/* 
ANIMATIONS
*/

//Create walking & jumping animation
function createBasicAnimations(name, gameObject) {
    createAnimaton(name, 'idle', gameObject, 180);
    createAnimaton(name, 'up', gameObject, { start: 145, end: 152 }, 10, -1);
    createAnimaton(name, 'left', gameObject, { start: 163, end: 170 }, 10, -1);
    createAnimaton(name, 'down', gameObject, { start: 181, end: 188 }, 10, -1);
    createAnimaton(name, 'right', gameObject, { start: 199, end: 206 }, 10, -1);
    createAnimaton(name, 'jump', gameObject, { frames: [361, 362, 362, 361, 180] }, 10, 0);

    //Create death animation
    createAnimaton(name, 'death', gameObject, { start: 361, end: 365 }, 2, -1);
    createAnimaton(name, 'laying', gameObject, 365);
}

//Basic animation create function
function createAnimaton(spriteName, animationName, gameObject, frames, rate, repeat) {
    if (frames !== Number(frames)) {
        gameObject.anims.create({
            key: spriteName + '-' + animationName,
            frames: gameObject.anims.generateFrameNumbers(spriteName, frames),
            frameRate: rate,
            repeat: repeat
        });
    } else {
        gameObject.anims.create({
            key: spriteName + '-' + animationName,
            frames: [{ key: spriteName, frame: frames }],
            frameRate: 0,
            repeat: -1
        });
    }
}

//Animation for the dash attack
function createDashAnimation(name, gameObject) {
    createAnimaton(name, 'dashright', gameObject, { frames: [271, 272, 272, 273, 273, 273, 273, 272, 272, 271] }, 10, -1);
    createAnimaton(name, 'dashdown', gameObject, { frames: [253, 254, 254, 255, 255, 255, 255, 254, 254, 253] }, 10, -1);
    createAnimaton(name, 'dashleft', gameObject, { frames: [235, 236, 236, 237, 237, 237, 237, 236, 236, 235] }, 10, -1);
    createAnimaton(name, 'dashup', gameObject, { frames: [217, 218, 218, 219, 219, 219, 219, 218, 218, 217] }, 10, -1);
}

function loadSpellAnimations(gameObject) {
    createAnimaton('Fire Ball', 'spell', gameObject, { start: 0, end: 5 }, 10, -1);
    createAnimaton('Flame', 'spell', gameObject, { start: 0, end: 4 }, 10, -1);
    createAnimaton('Sapphire shattering ultra omega (sus potion 3 am) blast', 'spell', gameObject, { start: 0, end: 5 }, 20, -1);
}

/* 
ANIMATION TRIGGER FUNCTIONS
*/

//Plays death animation for a sprite (mostly for times when their hp reaches 0)
function playDeathAnimation(sprite, name, info) {
    if (!sprite.state) {
        sprite.state = 'dead';

        if (info) {
            info.hpText.visible = false;
            info.nameHover.visible = false;
        }

        stopEnemy(sprite);

        if (info) {
            info.animationPlaying = 'death';
        }

        sprite.body.enable = false;

        sprite.anims.play(name + '-death', true);

        setTimeout(() => {
            sprite.anims.play(name + '-laying', true);
            sprite.disableBody(true, false);

            if (info) {
                info.hpText.destroy();
                info.nameHover.destroy();
            }
        }, 2500);
    }
}

//Movement detection for the player
function playerMovement() {
    if (gameEnd != true) {
        if (!cursors.shift.isDown) {
            movementSpeed = 100 * player.info.speedMultiplier;
            player.anims.msPerFrame = 100 * invertNumber(player.info.speedMultiplier, 1);
        } else {
            movementSpeed = 150 * player.info.speedMultiplier;
            player.anims.msPerFrame = 75 * invertNumber(player.info.speedMultiplier, 1);
        }

        if (cursors.left.isDown || keyA.isDown) {
            player.setVelocityX(-movementSpeed);
            player.setVelocityY(0);
            player.anims.play('player-left', true);
        } else if (cursors.right.isDown || keyD.isDown) {
            player.setVelocityX(movementSpeed);
            player.setVelocityY(0);
            player.anims.play('player-right', true);
        } else if (cursors.up.isDown || keyW.isDown) {
            player.setVelocityY(-movementSpeed);
            player.setVelocityX(0);
            player.anims.play('player-up', true);
        } else if (cursors.down.isDown || keyS.isDown) {
            player.setVelocityY(movementSpeed);
            player.setVelocityX(0);
            player.anims.play('player-down', true);
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play('player-idle');
        }
    }
}

//Prevent the sprite from pushing the player too much upon collision.
function stopCollision(player, enemy) {
    if (enemy.info.animationPlaying == false) {
        const info = enemy.info;

        enemy.setVelocity(0);
        player.setVelocity(0);

        enemy.anims.play(info.sprite + '-idle');
    }

    dealDamageToPlayer(player, enemy);
}

//Death events for the player
function playerDeath() {
    const playerInfo = player.info;

    if (playerInfo.hp <= 0 && gameEnd == false) {
        gameEnd = true;
        playerInfo.hp = 0;

        player.setVelocity(0, 0);
        playDeathAnimation(player, 'player');

        player.info.hpText.visible = false;

        enemies.children.entries.forEach(enemy => {
            enemy.info.animationPlaying = true;
            enemy.body.checkCollision.none = true;
            enemy.disableBody(true, false);
        });
    }
}

//Forcefully stop an enemy during animations, even if its in an animation
function stopEnemy(sprite) {
    const info = sprite.info;

    //Only execute code is info is declared.
    if (info) {
        if (info.animationPlaying == true) {
            cancelAnimation(sprite, info);
        }
    }

    sprite.setVelocity(0, 0);

    if (info) {
        info.pauseAnimations = false;
        info.moving = false;
        sprite.anims.play(info.sprite + '-idle');
    } else {
        sprite.anims.play('player' + '-idle');
    }
}

/* 
HP FUNCTIONS
*/

//Increase the max hp cap for a sprite and heal the sprite if that is requested.
function increaseMaxHealth(sprite, amount, includeHeal) {
    sprite.info.maxHp += amount;

    if (includeHeal) {
        changeSpriteHp(sprite, amount, 0x006400);
    }
}

//Damage for the player
function dealDamageToPlayer(player, enemy) {
    if (damageCooldown == false) {
        const info = enemy.info;
        const playerInfo = player.info;

        damageCooldown = true;

        playerInfo.hp -= info.dmg;

        player.info.hpText.setText(playerInfo.hp);
        player.setTint(0xff0000);

        playerDeath();

        setTimeout(() => {
            player.setTint(0xffffff);

            setTimeout(() => {
                damageCooldown = false;
            }, 400);
        }, 600);
    }
}

//Change hp of an enemy, either healing or declining.
function changeSpriteHp(sprite, amount, customColor) {
    sprite.info.hp += amount;

    if (sprite.info.aggroDistance) {
        if (sprite.info.aggroDistance[1] == false) {
            sprite.info.aggroDistance[1] = true;
        }
    }

    if (sprite.info.hpText) {
        sprite.info.hpText.setText(sprite.info.hp);
    }

    if (sprite.info.hp > 0) {
        if (amount < 0) {
            if (!customColor) {
                sprite.setTint(0xff0000);
            } else {
                sprite.setTint(customColor);
            }

            setTimeout(() => {
                sprite.setTint(0xffffff);
                return true;
            }, 600);
        } else if (amount > 0) {
            sprite.setTint(0x00ff00);

            setTimeout(() => {
                sprite.setTint(0xffffff);
                return true;
            }, 500);
        }
    } else { //death effect
        let notPlayer = true;
        const enemyList = enemies.children.entries;

        for (let i = 0; i < enemyList.length; i++) {
            if (enemyList[i] == sprite) {
                removedSprite.push(sprite);

                enemyList.slice(i, i + 1);

                playDeathAnimation(sprite, sprite.info.sprite, sprite.info);

                increasePoints(6);

                increaseMaxHealth(player, 5, true);

                notPlayer = false;
            }
        }

        if (notPlayer == false) {
            return true;
        } else {
            playerDeath();
        }
    }
}

/* 
OTHER FUNCTIONS
*/

//Set a sprite's velocity to 0.
function removeVelocity(sprite) {
    sprite.setVelocity(0, 0);
}

function adjustHitbox(sprite, padding) {
    if (padding) {
        sprite.setSize((64 - padding.right - padding.left), (64 - padding.bottom - padding.top));

        sprite.setOffset(padding.right, padding.top);
    }
}

//Updates the list of cooldowns when a spell is cooling down.
function updateCooldownList(gameObject) {
    let cooldownArray = ['Spell cooldowns:'];
    let index = 0;

    spellCooldown.forEach((spell) => {
        if (spell.cd > 0) {
            if (spell.cd % 1 > 0) {//Only actives if the cooldown contains a decimal
                setTimeout(() => {
                    spell.cd -= spell.cd % 1;
                    cooldownArray[index] = `${spell.name} : ${spell.cd+1}`;

                    cooldownList.setText(cooldownArray);
                }, spell.cd % 1 * 1000);
            }

            spell.cd--;
            cooldownArray.push(`${spell.name} : ${spell.cd + 1}`);

            index++;
        } else {
            spellCooldown.includes(spell);
        }
    });

    cooldownList.setText(cooldownArray);
}

function deepCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}

//Change the numbers around a certain number.
function invertNumber(num, baseNum) {
    if (num < baseNum) {
        num = baseNum - num + baseNum;
    } else {
        num -= baseNum;
        num = baseNum - num;
    }

    return Math.round(num * 10) / 10;
}

function increasePoints(amount) {
    points += amount;// phoebe
    pointSystem.innerHTML = 'Points: ' + points;
}