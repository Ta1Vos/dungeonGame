//Destroys spells when they collide with callback function.
function spellWallCollision(spell) {
    spell.destroy();
}

//Loads the animation for the requested spell and gets the name
function loadSpellAttackAnimation(spellAttack) {
    if (spellAttack.attackInfo.animationName) {
        spellAttack.anims.play(spellAttack.attackInfo.animationName, true);
    }
}

//Checks if the currentSpell is on cooldown or not
function checkSpellCooldown() {
    if (currentSpell.coolingDown == false) {
        const spellInfo = fetchSpellinfo();
        spellInfo.coolingDown = true;

        spellCooldown.push({ name: spellInfo.sprite, cd: spellInfo.cooldown });

        loadSpell(spellInfo, currentSpell.sprite, { sender: player, target: undefined });
    }
}

//Fetch information about currently loaded spellcircle
function fetchSpellinfo() {
    let spellInfo;

    spellMoves.circles.forEach(circle => {
        if (circle.sprite == currentSpell.sprite) {
            spellInfo = circle;
            return;
        }
    });

    return spellInfo;
}

//All the timeouts for spells
function spellTimeouts(spellInfo, spellCircle, sendInfo) {
    if (spellInfo.followCursor == true) {
        //Despawns spell after cooldown, usually takes a bit longer
        setTimeout(() => {
            if (sendInfo.sender.info.spellContact == false) {
                spellCircle.waitForDestroy = true;
            }

            //Destroys the spell if it hasn't gotten destroyed yet.
            setTimeout(() => {
                if (spellCircle) {
                    spellCircle.destroy();
                }
            }, 2000);
        }, spellInfo.despawn * 1000);
    } else {
        //Instantly destroys spell after cooldown
        setTimeout(() => {
            if (spellCircle) {
                spellCircle.destroy();
            }
        }, spellInfo.despawn * 1000);
    }

    //Turns the cooldown back to false when it finishes.
    setTimeout(() => {
        if (spellInfo.coolingDown && sendInfo.sender == player) {
            spellInfo.coolingDown = false;
        }
    }, spellInfo.cooldown * 1000);
}

//Remove a spell object/variable
function removeSpell(spell) {
    spell.destroy();
}

//Launch a spell that is mentioned under the value "currentSpell"
function loadSpell(spellInfo, spellName, sendInfo) {
    const sender = sendInfo.sender;

    let spellCircle;

    //Spawns in a circle if that is requested.
    if (spellInfo.isCircle == true) {
        spellCircle = gameObject.physics.add.sprite(sender.x, sender.y, spellName);

        spellCircle.spellInfo = spellInfo;
        spellCircle.spellInfo.ignoreSprite = sender;

        spellCircle.setScale(spellInfo.scale);

        spells.add(spellCircle);
    }

    //Makes sure the spell does not overlay other sprites
    bringSpritesForwards();

    //Searches for the right spell(name) and then loads in the right spell.
    switch (spellName) {
        case 'Ice Trap':
            executePlaceableSpell(spellCircle, sendInfo);
            break;
        case 'Fire Ball':
            spellCircle.visible = false;
            loadSpellAttack(spellInfo, null, [spellCircle.x, spellCircle.y], sendInfo);
            removeSpell(spellCircle);
            break;
        case 'Flame':
            spellCircle.visible = false;
            loadSpellAttack(spellInfo, null, [spellCircle.x, spellCircle.y], sendInfo);
            removeSpell(spellCircle);
            break;
        case 'Small heal':
            healSpriteSpell(sendInfo, 15, { amt: 20, time: 750, step: 2 });
            break;
        case 'Large heal':
            healSpriteSpell(sendInfo, 40, { amt: 35, time: 1000, step: 5 });
            break;
        case 'Sapphire shattering ultra omega (sus potion 3 am) blast':
            loadSpellAttack(spellInfo, null, [spellCircle.x, spellCircle.y], sendInfo);
            break;
    }

    //Loads the timeouts for the spell.
    spellTimeouts(spellInfo, spellCircle, sendInfo);

    return true;
}

//Brings sprites to the upper z-index layer
function bringSpritesForwards() {
    gameObject.children.bringToTop(player);

    enemies.children.entries.forEach(enemy => {
        gameObject.children.bringToTop(enemy);
    });
}

//Updates location where a spell/sprite should move to.
function updateSpellLocation(sprite, toSprite, timeInS, speed, cameraOffSet, updateRotation) {
    let pos;
    //Either fetch location for the user's view or the in-game view.
    if (cameraOffSet) {
        pos = distanceInbetween(toSprite, player);
    } else {
        pos = [toSprite.x, toSprite.y];
    }

    //Basic speed if speed hasn't been declared.
    if (!speed) {
        speed = 60;
    }

    //Rotates sprite if the variable has been declared.
    if (!updateRotation) {
        gameObject.physics.moveTo(sprite, pos[0], pos[1], speed, (timeInS * 1000));
    } else {
        sprite.rotation = gameObject.physics.moveTo(sprite, pos[0], pos[1], speed, (timeInS * 1000));
    }
}

//Calculates distance inbetween sprite 1 and 2
function distanceInbetween(sprite1, sprite2) {
    const x = sprite1.x - (500 - sprite2.x);
    const y = sprite1.y - (300 - sprite2.y);

    return [x, y];
}

//Load attack that should be executed (which has been linked to the current circle)
function loadSpellAttack(spellInfo, enemy, circlePos, sendInfo) {
    spellMoves.attacks.forEach((attack, i) => {
        if (attack.attackName == spellInfo.attackName) {
            //Switches inbetween attacks that should be loaded in, grabs the info and loads the right code
            switch (spellInfo.attackName) {
                case 'iceTrap':
                    trapSpell(spellInfo, enemy, attack, circlePos);
                    break;
                case 'fireProjectile':
                    projectileSpell(spellInfo, attack, circlePos, sendInfo);
                    break;
                case 'flameProjectile':
                    projectileSpell(spellInfo, attack, circlePos, sendInfo);
                    break;
                case 'sapphireProjectile':
                    growingSpellBlast(spellInfo, attack, circlePos, sendInfo, { toSize: 2, time: 50, step: 0.02, executeFunction: function(par) {explodeASpell(par)} });
                    break;
            }
        }
    });
}

//Luanches when a spellcircle collides with an sprite.
function spriteSpellCollision(spellCircle, sprite) {
    if (sprite.info.spellContact == false && spellCircle.spellInfo.ignoreSprite != sprite) {
        sprite.info.spellContact = true;

        setTimeout(() => {
            const spellInfo = spellCircle.spellInfo;

            removeVelocity(spellCircle);

            //Places spell on sprite
            if (spellInfo.disappearOnTouch == true) {
                spellCircle.x = sprite.x;
                spellCircle.y = sprite.y;
            }

            if (spellCircle.ignoreSprite != sprite) {
                spellInfo.spellContact = true;
            }

            loadSpellAttack(spellInfo, sprite, [spellCircle.x, spellCircle.y]);

            //Destroy spellCircle
            setTimeout(() => {
                if (spellInfo.disappearOnTouch == true) {
                    spellInfo.spellContact = false;
                    spellCircle.destroy();
                }

                sprite.info.spellContact = false;
            }, 500);
        }, 75);
    }
}

//Collision of the spell attacks (NOT CIRCLES)
function tempSpellSpriteCollision(spell, sprite) {
    if (sprite.info.dmgCooldown == false && spell.attackInfo.ignoreSprite != sprite) {
        const spriteInfo = sprite.info;
        spriteInfo.dmgCooldown = true;

        const attackInfo = spell.attackInfo;

        changeSpriteHp(sprite, -attackInfo.dmg);
        dealPassiveSpellDmg(attackInfo.passiveDmg, sprite);

        //Either make the spell disappear upon collision or let it move.
        if (attackInfo.disappearOnTouch) {
            spriteInfo.dmgCooldown = false;

            if (attackInfo.disappearOnTouch == true) {
                spell.destroyed = true;
                spell.destroy();
            }
        } else if (attackInfo.damageCooldown) {
            setTimeout(() => {
                spriteInfo.dmgCooldown = false;
            }, attackInfo.damageCooldown * 1000);
        }
    }
}

//Deals damage over time.
function dealPassiveSpellDmg(passiveInfo, enemy, color, duration, override) {
    if (passiveInfo.enabled == true && (enemy.info.statusEffect == false || override)) {
        changeSpriteHp(enemy, -passiveInfo.dmg, color);
        enemy.info.statusEffect = true;

        //Initiates a duration if its the first time of the loop.
        if (!duration) {
            duration = passiveInfo.dur;
        }

        duration--;

        if (duration > 0) {//Loops until duration is equal to or smaller than 0.
            setTimeout(() => {
                dealPassiveSpellDmg(passiveInfo, enemy, color, duration, true);
            }, passiveInfo.timeout);
        } else {//Turns the statusEffect off so the enemy can be affected again.
            enemy.info.statusEffect = false;
        }
    }
}

//Prevent an enemy from doing anything until time/stun has run out.
function stunEnemyWithSpell(spellInfo, enemy) {
    if (spellInfo.stun) {
        stopEnemy(enemy);

        //Blocks out all other animations
        enemy.info.animationPlaying = 'spell';
        //Disables ALL movement of sprite
        enemy.body.enable = false;

        setTimeout(() => {//If the sprite isn't considered dead, it will activate movement again.
            if (enemy.state != 'dead') {
                enemy.info.animationPlaying = false;
                enemy.info.attackCooldown = false;
    
                enemy.body.enable = true;
                resetEnemyStats(enemy);
            }
        }, spellInfo.stun * 1000);
    }
}

//Makes a spell attack disappear after a certain amount of time.
function attackDurationWearOff(attackInfo, spellAttack) {
    setTimeout(() => {
        spellAttack.destroy();
    }, attackInfo.duration * 1000);
}

//Updates location for a placeable and moveable spell until it is prompted to destroy itself.
function executePlaceableSpell(circle, sendInfo) {
    if ((circle.spellInfo.spellContact == false) && !circle.waitForDestroy) {
        updateSpellLocation(circle, game.input.activePointer, circle.spellInfo.speed, null, true);

        setTimeout(() => {
            executePlaceableSpell(circle, sendInfo);
        }, 50);
    } else if (circle.waitForDestroy == true) {
        circle.destroy();
    }
}

//Execute the ice trap spell.
function trapSpell(spellInfo, enemy, attackInfo, spawnPos) {
    if (enemy.info.animationPlaying != 'spell') {
        stunEnemyWithSpell(spellInfo, enemy);
    }

    changeSpriteHp(enemy, -attackInfo.dmg);
    dealPassiveSpellDmg(attackInfo.passiveDmg, enemy, 0x00ffff);
}

//Summon a projectileSpell that heads for the cursor.
function projectileSpell(spellInfo, attackInfo, spawnPos, sendInfo) {
    const spellAttack = gameObject.physics.add.sprite(spawnPos[0], spawnPos[1], attackInfo.sprite);

    adjustHitbox(spellAttack, attackInfo.hitboxPadding);

    spellAttack.setScale(attackInfo.sizeScale);
    spellAttack.attackInfo = deepCopyObject(attackInfo);

    //Ignores the sender so that the sender won't receive any damage.
    spellAttack.attackInfo.ignoreSprite = sendInfo.sender;

    loadSpellAttackAnimation(spellAttack);

    temporarySpells.add(spellAttack);

    //Despawn for the spell
    attackDurationWearOff(attackInfo, spellAttack);

    //Either send a spell at the cursor or at the target.
    if (!sendInfo.target) {
        updateSpellLocation(spellAttack, game.input.activePointer, null, attackInfo.velocitySpeed, true, true);
    } else {
        updateSpellLocation(spellAttack, sendInfo.target, null, attackInfo.velocitySpeed, false, true);
    }
}

//Cast a healing spell, could either be an enemy or the player itself.
function healSpriteSpell(sendInfo, heal, overtime) {
    const info = sendInfo.sender.info;

    //Checks if the sprite hasn't reached max hp yet, otherwise it will toggle the healing off.
    if (info.maxHp >= info.hp + heal && info.hp > 0) {
        if (heal > 0) {//First heal
            changeSpriteHp(sendInfo.sender, heal);

            if (overtime) {
                setTimeout(() => {
                    healSpriteSpell(sendInfo, 0, overtime);
                }, overtime.time);
            }
        } else {
            if (overtime.amt > 0) {//Heal of the overtime
                changeSpriteHp(sendInfo.sender, overtime.step);
                overtime.amt -= overtime.step;

                setTimeout(() => {
                    healSpriteSpell(sendInfo, 0, overtime);
                }, overtime.time);
            }
        }
    } else {
        //Put the hp to the sprite's maxhp.
        changeSpriteHp(sendInfo.sender, info.maxHp - info.hp);
    }
}

//Grows a spell until it reaches the set size. Is capable of calling a function afterwards.
function growASpell(spell, sizeInfo) {
    if (spell.scaleX < sizeInfo.toSize && spell.scaleY < sizeInfo.toSize) {
        spell.setScale(spell.scaleX + sizeInfo.step);

        setTimeout(() => {
            growASpell(spell, sizeInfo);
        }, sizeInfo.time);
    } else {//Calls the function if it is declared and if the spell is not destroyed.
        if (sizeInfo.executeFunction && !spell.destroyed) {
            sizeInfo.executeFunction(spell);
        }
    }
}

//Grows a spell until the limit has been reached.
function growingSpellBlast(spellInfo, attackInfo, spawnPos, sendInfo, sizeInfo) {
    const spellAttack = gameObject.physics.add.sprite(spawnPos[0], spawnPos[1], attackInfo.sprite);

    //Change the hitbox's size
    adjustHitbox(spellAttack, attackInfo.hitboxPadding);

    spellAttack.setScale(attackInfo.sizeScale);//Scale the spell
    spellAttack.attackInfo = deepCopyObject(attackInfo);//Copy the spell's info to prevent bugs.

    spellAttack.attackInfo.ignoreSprite = sendInfo.sender;//Ignores sender to prevent random dmg.

    temporarySpells.add(spellAttack);

    attackDurationWearOff(attackInfo, spellAttack);

    //Either send a spell at the cursor or at the target.
    if (!sendInfo.target) {
        updateSpellLocation(spellAttack, game.input.activePointer, null, attackInfo.velocitySpeed, true, false);
    } else {
        updateSpellLocation(spellAttack, sendInfo.target, null, attackInfo.velocitySpeed, false, false);
    }

    growASpell(spellAttack, sizeInfo);
}

//Mostly used for the Sapphire spell, increases spell damage and grows it in size. Destroys it afterwards.
function explodeASpell(spell) {
    if (!spell.destroyed) {
        const attackInfo = spell.attackInfo;

        //Increase the stats of the spell
        attackInfo.dmg = attackInfo.dmg * 2.5;
        attackInfo.ignoreSprite = undefined;
        attackInfo.disappearOnTouch = false;
    
        loadSpellAttackAnimation(spell);

        //Function to run after the spell reaches max growth (destroy the spell)
        growASpell(spell, { toSize: 6, time: 20, step: 0.1, executeFunction: function(spell) {
            attackInfo.dmg = attackInfo.dmg / 2.5;
            attackInfo.disappearOnTouch = true;

            spell.destroy();
        } });
    }
}