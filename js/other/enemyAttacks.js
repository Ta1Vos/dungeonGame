//Reset values for enemies to stop the animation.
function cancelAnimation(enemy, info) {
    changeHeadonCollision(enemy, null, true);
    info.pauseAnimations = false;
}

//Depending on the rate, makes an enemy perform an attack.
function enemyAttackRandomizer(rate, sprite, enemyName) {
    const attackChance = Math.round(Math.random(rate) * rate);//Random number within the rate's range.

    //Executes enemy attack if num 0 has been reached in the random number
    if (attackChance == 0 && sprite.info.attackCooldown == false && sprite.info.animationPlaying == false) {
        sprite.info.attackCooldown = true;

        setTimeout(() => {//Stops sprite for a second before initiating the attack.
            sprite.anims.play(enemyName + '-idle');
            sprite.setVelocityX(0);
            sprite.setVelocityY(0);

            setTimeout(() => {
                enemyAttack(sprite, enemyName, rate);
            }, 10);
        }, 10);
    }
}

//Resets the Boolean stats to prevent bugs.
function resetEnemyStats(enemy) {
    const info = enemy.info;

    info.animationPlaying = false;
    info.pauseAnimations = false;
    info.cancelAnimations = false;
}

//Upon called, launches a randomized attack that had been assigned to the enemy.
function enemyAttack(sprite, enemyName, rate) {
    const info = sprite.info;
    const attacks = info.attackMoves;
    let randomNum;
    let cooldown = 0;

    //if there's more than 1 attack then it will pick a random attack, otherwise it will only pick the first one in the array of attacks.
    if (attacks.length > 1) {
        randomNum = Math.floor(Math.random(attacks.length) * attacks.length);
    } else {
        randomNum = 0;
    }

    const attack = attacks[randomNum];

    let attackFinished = false;
    let spell;

    //Switches inbetween chosen RNG attack.
    switch (attack.atk) {
        case 'jumpToPlayer'://Non-spell
            cooldown = 2500;
            tempIncreaseDamage(sprite, attack.dmg, 2250);
            attackFinished = playSpriteJump(sprite, enemyName, [player.x, player.y]);
            break;
        case 'dash'://Non-spell
            cooldown = 1500;
            tempIncreaseDamage(sprite, attack.dmg, 1100);
            attackFinished = spriteDash(sprite, 1000);
            break;
        case 'Flame':
            cooldown = 500;
            spell = spellMoves.circles[2];

            loadSpell(spell, spell.sprite, { sender: sprite, target: player });

            info.animationPlaying = false;
            info.attackCooldown = false;
            attackFinished = true;
            break;
        case 'fireball':
            cooldown = 0;
            spell = spellMoves.circles[1];

            loadSpell(spell, spell.sprite, { sender: sprite, target: player });

            info.animationPlaying = false;
            info.attackCooldown = false;
            attackFinished = true;
            break;
        case 'fireballBarrage':
            cooldown = 1500;
            spell = spellMoves.circles[1];

            info.animationPlaying = true;
            info.attackCooldown = true;

            const code = setInterval(() => {
                loadSpell(spell, spell.sprite, { sender: sprite, target: player });

                setTimeout(() => {
                    clearInterval(code);
                }, 1000);
            }, 250);

            attackFinished = true;
            break;
        case 'smallHeal':
            cooldown = 2500;
            spell = spellMoves.circles[4];

            info.animationPlaying = true;
            info.attackCooldown = true;

            healSpriteSpell({ sender: sprite }, 15, { amt: 10, time: 1000, step: 2 });

            attackFinished = true;
            break;
        case 'largeHeal':
            cooldown = 5000;
            spell = spellMoves.circles[5];

            info.animationPlaying = true;
            info.attackCooldown = true;

            healSpriteSpell({ sender: sprite }, 15, { amt: 25, time: 1250, step: 5 });

            attackFinished = true;
            break;
        case 'sapphireBlast':
            cooldown = 5000;
            spell = spellMoves.circles[3];

            loadSpell(spell, spell.sprite, { sender: sprite, target: player });

            info.animationPlaying = false;
            info.attackCooldown = false;
            attackFinished = true;
            break;
    }

    //Waits before making the enemy able to attack again
    if (attackFinished != false) {
        setTimeout(() => {
            //In case a spell has hit the enemy before the timeout, it can't snap out of the stun due to the if-statement.
            if (info.animationPlaying == true) {
                resetEnemyStats(sprite);

                setTimeout(() => {//turns off the cooldown after it expires (has been declared at the attack switch case).
                    info.attackCooldown = false;
                }, cooldown);
            }
        }, cooldown);
    } else {
        //Catch if the attack has not finished yet, but the code has reached this point already.
        resetEnemyStats(sprite);
    }
}

//Requires animationPlaying to be a Boolean, otherwise it shall not change.
function turnAnimationPlayingFalse(info) {
    if (info.animationPlaying == true) {
        info.animationPlaying = false;
    }
}

//Toggle hp visibility for a certain amount of time
function toggleText(info, time) {
    info.hpText.visible = false;
    info.nameHover.visible = false;

    setTimeout(() => {
        info.hpText.visible = true;
        info.nameHover.visible = true;
    }, time);
}

//Stop animations of a sprite.
function pauseAnimations(sprite, time) {
    const info = sprite.info;

    if (info.cancelAnimations == false) {
        info.pauseAnimations = true;
        sprite.anims.pause();

        setTimeout(() => {
            info.pauseAnimations = false;
        }, time);
    } else {
        info.cancelAnimations = false;
    }
}

//Increase enemy damage temporarily
function tempIncreaseDamage(sprite, damage, time) {
    const info = sprite.info;
    const normalDmg = info.dmg;

    info.dmg = damage;

    setTimeout(() => {
        info.dmg = normalDmg;
    }, time);
}

//Either have 1 direction collision toggled or all of them toggled.
function changeHeadonCollision(sprite, ignore, state) {
    switch (ignore) {
        case 'up':
            sprite.body.checkCollision.up = !state;
            sprite.body.checkCollision.left = state;
            sprite.body.checkCollision.down = state;
            sprite.body.checkCollision.right = state;
            break;
        case 'left':
            sprite.body.checkCollision.left = !state;
            sprite.body.checkCollision.up = state;
            sprite.body.checkCollision.down = state;
            sprite.body.checkCollision.right = state;
            break;
        case 'down':
            sprite.body.checkCollision.down = !state;
            sprite.body.checkCollision.up = state;
            sprite.body.checkCollision.left = state;
            sprite.body.checkCollision.right = state;
            break;
        case 'right':
            sprite.body.checkCollision.right = !state;
            sprite.body.checkCollision.up = state;
            sprite.body.checkCollision.left = state;
            sprite.body.checkCollision.down = state;
            break;
        default:
            sprite.body.checkCollision.up = state;
            sprite.body.checkCollision.left = state;
            sprite.body.checkCollision.down = state;
            sprite.body.checkCollision.right = state;
            break;
    }
}

//Sprite jump animation
function playSpriteJump(sprite, name, jumpTo) {
    const info = sprite.info;
    info.animationPlaying = true;
    toggleText(info, 2800);

    //Disable collisions
    changeHeadonCollision(sprite, null, false);

    sprite.anims.play(name + '-jump', true);
    setTimeout(() => {
        sprite.setVelocityY(-600);
        sprite.setVelocityX(0);

        setTimeout(() => {
            if (sprite.moving != 'spell') {
                sprite.x = jumpTo[0];
                sprite.y = jumpTo[1] - 600;
            }

            sprite.setVelocityY(600);
            sprite.setVelocityX(0);

            setTimeout(() => {
                sprite.setVelocityY(0);
                sprite.setVelocityX(0);

                //Small safeguard that makes sure the enemy isn't left out outside the map
                sprite.y = jumpTo[1];

                sprite.anims.play(name + '-jump', true);

                changeHeadonCollision(sprite, null, true);

                setTimeout(() => {
                    info.hpText.visible = true;

                    return true;
                }, 450);
            }, 1000);
        }, 1000);
    }, 350);
}

//Sprite dash animation WARNING!NEEDS THE ANIMATION PACK LOADED!
function spriteDash(sprite, time) {
    const info = sprite.info;
    const speed = info.moveSpeed;

    toggleText(info, time);
    info.animationPlaying = true;

    setTimeout(() => {
        info.moving = false;
        info.moveSpeed = speed * 3;

        //Find a direction to dash into
        findPath(sprite, info, time, dashAnimation);
        changeHeadonCollision(sprite, info.moving, false);

        setTimeout(() => {
            changeHeadonCollision(sprite, null, true);
            info.moveSpeed = info.moveSpeed / 3;

            return true;
        }, time);
    }, 15);
}