config.scene.create = create;

function create() {
    //MAPS/WALLS

    let map = this.make.tilemap({ key: 'map' });

    let tileset = map.addTilesetImage('tiles', 'tiles');

    map.createStaticLayer("floor", tileset);
    const walls = map.createStaticLayer("walls", tileset);

    walls.setCollisionByProperty({ collision: true });

    //DOORS

    const doors = map.createStaticLayer("doors", tileset);
    doors.setCollisionByProperty({ collision: true });

    //LOADED IN TEXTS

    cooldownList = this.add.text(-225, -25, 'Spell cooldowns:', { fontSize: '16px', fill: '#00ff00' });
    this.add.text(16, 16, 'Funni dungeon novel gaem', { fontSize: '32px', fill: '#f3a3f3' });

    //SPELL GROUPS

    spells = this.add.group();
    temporarySpells = this.add.group();

    //INTERACTABLE GROUP

    interactablesCollision = this.physics.add.staticGroup();
    interactables = this.add.group();

    //TELEPORTERS

    teleporters = this.physics.add.staticGroup();

    //Load in teleporters
    teleportLoad.forEach(ele => {
        const teleporter = teleporters.create(ele.fX, ele.fY, '');

        teleporter.visible = false; //makes teleporter invisible. phoebe

        adjustHitbox(teleporter, ele.hitboxPadding);

        //Position the player will teleport to
        teleporter.teleportto = {
            x: ele.tX,
            y: ele.tY
        }
    });

    //ENEMIES

    enemies = this.add.group();

    //Load in every enemy
    enemySprites.forEach(element => {
        const enemy = this.physics.add.sprite(element.spawn[0], element.spawn[1], element.sprite);
        enemy.info = element;

        const info = enemy.info;
        const scale = info.scale;

        enemy.info.animationPlaying = false;
        enemy.info.hpText = this.add.text(element.spawn[0], element.spawn[1] - 50, info.hp, { fontSize: '16px', fill: '#fff' });
        enemy.info.nameHover = this.add.text(element.spawn[0] - info.sprite.length * 4, element.spawn[1] - 82, info.sprite, { fontSize: '16px', fill: '#f00' });

        adjustHitbox(enemy, info.hitboxPadding);
        enemy.setScale(scale);
        targetingSprites.push(enemy);

        enemies.add(enemy);
    });

    //PLAYER

    player = this.physics.add.sprite(850, 850, 'player');

    player.info = {
        hp: 100,
        maxHp: 100,
        speedMultiplier: 1,
        coins: 0,
        spawnX: 40,
        spawnY: 60,
        dmgCooldown: false,
        spellContact: false,
        statusEffect: false,
    }

    player.info.hpText = this.add.text(player.x - 15, player.y - 50, player.info.hp, { fontSize: '16px', fill: '#fff' });

    player.setSize(player.info.spawnX, player.info.spawnY, true);

    //SCREENCOVER
    screenCover = this.physics.add.sprite(250, 250, 'screenCover').setScale(100);
    screenCover.setTint(0x000000);
    screenCover.visible = false;
    screenCover.reverse = false;
    screenCover.running = false;

    //Load animations
    createBasicAnimations('player', this);
    createBasicAnimations('Xarzeth', this);
    createBasicAnimations('Mage', this);
    createDashAnimation('Mage', this);
    createDashAnimation('Xarzeth', this);
    //Spell animations
    loadSpellAnimations(this);

    //Wall collisions
    this.physics.add.collider(player, walls);
    this.physics.add.collider(enemies, walls, stopEnemy, null, this);
    this.physics.add.collider(spells, walls);
    this.physics.add.collider(temporarySpells, walls, spellWallCollision, null, this);
    this.physics.add.collider(enemies, doors);
    this.physics.add.collider(player, doors);

    //Sprite-Sprite collision
    this.physics.add.collider(player, interactablesCollision);
    this.physics.add.collider(player, enemies, stopCollision, null, this);
    this.physics.add.collider(enemies, enemies);

    //Teleporter collision
    this.physics.add.overlap(player, teleporters, screenFade, null, this);

    //Spell trigger with enemies
    this.physics.add.overlap(temporarySpells, enemies, tempSpellSpriteCollision, null, this);
    this.physics.add.overlap(spells, enemies, spriteSpellCollision, null, this);

    this.physics.add.overlap(temporarySpells, player, tempSpellSpriteCollision, null, this);
    this.physics.add.overlap(spells, player, spriteSpellCollision, null, this);

    //Initiate camera follow
    this.cameras.main.startFollow(player, false, 0.05, 0.05);

    //Movement input
    cursors = this.input.keyboard.createCursorKeys();

    keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

    gameObject = this;

    //Updates cooldown list
    setInterval(() => {
        updateCooldownList(this);
    }, 1000);
}

//Summon spells using the number keys within the spell range
document.addEventListener('keydown', function (e) {
    if (gameEnd == false) { //phoebe
        if (parseInt(e.key) === Number(e.key)) {//Checks if input is a number.
            num = parseInt(e.key) - 1;

            if (num < spellMoves.circles.length) {
                currentSpell = spellMoves.circles[num];
            }
            spellShowcase.innerHTML = "Current spell: " + currentSpell.sprite; //phoebe

            checkSpellCooldown();
        }

        if (e.key == 'e') { //phoebe
            num++;
            //if num is higher then length change it to the first 
            if (num >= spellMoves.circles.length) {
                num = 0;
            }
            //select next spell
            currentSpell = spellMoves.circles[num];
            //show the selected spell
            spellShowcase.innerHTML = "Current spell: " + currentSpell.sprite;


        }
    }
})

//Eventlistener for summoning a spell (left-click)
document.addEventListener('click', function () {
    if (gameEnd == false) { //phoebe makes game freeze
        checkSpellCooldown();
    }
});