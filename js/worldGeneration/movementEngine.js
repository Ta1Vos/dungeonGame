const moveAnimation = ['-left', '-right', '-up', '-down'];
const dashAnimation = ['-dashleft', '-dashright', '-dashup', '-dashdown'];

//Prompt enemies to move using pathfinding, and if they are not blocked to do anything.
function moveSprite(sprites) {
    sprites.forEach((sprite, i) => {
        const info = sprite.info;

        //Prevents enemies from moving in case of special events.
        if (info.animationPlaying == false && removedSprite[0] != sprite && gameEnd != true) {
            //Checks if aggroDistance is active, if it is then it will only move the sprite if the player is within said distance.
            if ((info.aggroDistance[0] == 0 || info.aggroDistance[1] == true || (rangeCalc(player.x, sprite.x, -info.aggroDistance[0], info.aggroDistance[0]) &&
                rangeCalc(player.y, sprite.y, -info.aggroDistance[0], info.aggroDistance[0])))) {

                enemyAttackRandomizer(info.attackRate, sprite, info.sprite);

                //Makes the sprite find a way towards the player
                findPath(sprite, info, 1000, moveAnimation);

                //Turns on infinite aggro
                if (info.aggroDistance[1] == false) {
                    info.aggroDistance[1] = true;
                }
            } else {
                //Makes the sprite stop
                sprite.setVelocityX(0);
                sprite.setVelocityY(0);
                sprite.anims.play(info.sprite + '-idle');
            }
        } else {
            //Removing sprite out of the loop
            removedSprite.unshift();
            sprites.slice(i, i + 1);
        }
    });

    //Repeat movement updater
    setTimeout(() => {
        moveSprite(sprites);
    }, 10);
}

//Update location for the text above sprites.
function updateEnemyText(sprite, info) {
    if (info.hpText && info.nameHover) {
        info.hpText.x = sprite.x - 15;
        info.hpText.y = sprite.y - 50;
    
        info.nameHover.x = sprite.x - info.sprite.length * 4;
        info.nameHover.y = sprite.y - 82;
    }
}

function moveLeft(sprite, info, animation) {
    sprite.info.moving = 'left';

    sprite.setVelocityX(-info.moveSpeed);
    sprite.setVelocityY(0);

    if (info.pauseAnimations == false) {
        sprite.anims.play(info.sprite + animation, true);
    }
}

function moveRight(sprite, info, animation) {
    sprite.info.moving = 'right';

    sprite.setVelocityX(info.moveSpeed);
    sprite.setVelocityY(0);

    if (info.pauseAnimations == false) {
        sprite.anims.play(info.sprite + animation, true);
    }
}

function moveUp(sprite, info, animation) {
    sprite.info.moving = 'up';

    sprite.setVelocityY(-info.moveSpeed);
    sprite.setVelocityX(0);

    if (info.pauseAnimations == false) {
        sprite.anims.play(info.sprite + animation, true);
    }
}

function moveDown(sprite, info, animation) {
    sprite.info.moving = 'down';

    sprite.setVelocityY(info.moveSpeed);
    sprite.setVelocityX(0);

    if (info.pauseAnimations == false) {
        sprite.anims.play(info.sprite + animation, true);
    }
}

//Basic randomized pathfinding function, always makes the enemy go towards the player.
function findPath(sprite, info, timeout, animationPack) {
    if (sprite.info.moving == false) {
        const moves = [];

        //Check if sprite can move horizontal
        if (sprite.x <= player.x - 5 || sprite.x >= player.x + 5) {
            if (sprite.x > player.x) {
                moves.push(0);
            }
            if (sprite.x < player.x) {
                moves.push(1);
            }
        }

        //Check if sprite can move vertical
        if (sprite.y <= player.y - 5 || sprite.y >= player.y + 5) {
            if (sprite.y > player.y) {
                moves.push(2);
            }

            if (sprite.y < player.y) {
                moves.push(3);
            }
        }

        //Pick a random available direction to move towards the player
        const randomNumber = moves[Math.round(Math.random(moves.length))];

        switch (randomNumber) {
            case 0:
                if (info.moving != 'left') {
                    moveLeft(sprite, info, animationPack[0]);
                }
                break;
            case 1:
                if (info.moving != 'right') {
                    moveRight(sprite, info, animationPack[1]);
                }
                break;
            case 2:
                if (info.moving != 'up') {
                    moveUp(sprite, info, animationPack[2]);
                }
                break;
            case 3:
                if (info.moving != 'down') {
                    moveDown(sprite, info, animationPack[3]);
                }
                break;
        }

        //Forcing the sprite to move into another direction after some time
        if (timeout != undefined) {
            setTimeout(() => {
                if (info.moving != false) {
                    info.moving = false;
                }
            }, timeout);
        }
    }
}

//Calculate hitboxes for enemies to trigger whenever the player enters the hitboxes.
function rangeCalc(one, two, min, max) {
    const distance = one - two;
    if (distance >= min && distance <= max) {
        return true;
    }
    return false;
}