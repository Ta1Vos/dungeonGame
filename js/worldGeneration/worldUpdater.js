config.scene.update = update;

function update() {
    playerMovement();

    //Update player health location
    player.info.hpText.x = player.x - 15;
    player.info.hpText.y = player.y - 50;

    //Update cooldown list pos
    cooldownList.x = player.x - 475;
    cooldownList.y = player.y - 250;

    //Update enemy text locations
    enemies.children.entries.forEach(enemy => {
        updateEnemyText(enemy, enemy.info);
    });
}

//Initiate enemy movement
moveSprite(targetingSprites);