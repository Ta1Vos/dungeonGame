//Phaser settings
let config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 600,
    backgroundColor: '#ffffff',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload
    }
};

let gameObject;//Variable for the game object so it can be accessed anywhere, in any function.
let game = new Phaser.Game(config);//variable that contains the game

//Load in all the images
function preload() {
    //Sprites
    // this.load.image('PLACEHOLDER', '/img/sprites/PLACEHOLDER'); (template for assets)
    this.load.spritesheet('player', '/img/sprites/player.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Xarzeth', '/img/sprites/Xarzeth.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Mage', '/img/sprites/Mage.png', { frameWidth: 64, frameHeight: 64 });

    this.load.image('screenCover', '/img/worldMap/screenCover.png');
    this.load.tilemapTiledJSON('map', './world/firstMap.json');
    this.load.image('tiles', './world/tileset.png');

    this.load.image('Ice Trap', '/img/objects/iceCircle.png');

    this.load.spritesheet('Fire Ball', '/img/objects/fireProjectile.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Flame', '/img/objects/flameBall.png', { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('Sapphire shattering ultra omega (sus potion 3 am) blast', '/img/objects/crystalSpell.png', { frameWidth: 64, frameHeight: 64 });
}

//Game variables
let gameEnd = false;

//Collision variables
let interactablesCollision;
let interactables;
let toggleCollison = {};

let screenCover;//Variable for the screen cover
let points = 0;// phoebe
let num = 1;
let pointSystem = document.querySelector('.point-system'); //phoebe
let spellShowcase = document.querySelector('.current-spell'); //phoebe

let cooldownList;//List of spells in the cooldown

let teleporters;
const teleportLoad = [
    {
        fX: 1437,
        fY: 2478,
        tX: 2525,
        tY: 788,
        hitboxPadding: { top: 0, left: -100, bottom: 0, right: -100 }
    },
    {
        fX: 3040,
        fY: 2475,
        tX: 4640,
        tY: 1000,
        hitboxPadding: { top: 0, left: -100, bottom: 0, right: -100 }
    },
    {
        fX: 5405,
        fY: 2250,
        tX: 6750,
        tY: 2015,
        hitboxPadding: { top: 0, left: -100, bottom: 0, right: -100 }
    },
    {
        fX: 7710,
        fY: 2610,
        tX: 990,
        tY: 3430,
        hitboxPadding: { top: 0, left: -100, bottom: 0, right: -100 }
    },
    {
        fX: 3360,
        fY: 4160,
        tX: 6045,
        tY: 3360,
        hitboxPadding: { top: 0, left: -100, bottom: 0, right: -100 }
    }
];

//Player variables
let player;
let damageCooldown = false;

//List of sprites to be removed
let removedSprite = [];
//Enemy group
let enemies;

//All enemies, these get loaded in upon added them as an object,
const enemySprites = [
    //1st zone
    new enemy('Mage', [925, 1325], 100, [300, null], 1, 100, 100, 10, [{ atk: 'jumpToPlayer', dmg: 30 }],
        100, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [990, 2200], 100, [300, false], 1, 150, 125, 10, [{ atk: 'Flame' }, { atk: 'fireball' }, { atk: 'fireballBarrage' }, { atk: 'smallHeal' }],
        100, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [1250, 2200], 110, [300, false], 1, 150, 125, 10, [{ atk: 'smallHeal' }, { atk: 'jumpToPlayer', dmg: 25 }, { atk: 'fireball' }, { atk: 'largeHeal' }],
        150, { top: 8, left: 12, bottom: 0, right: 12 }),

    //2nd zone
    new enemy('Xarzeth', [2715, 1365], 100, [200, false], 1.5, 300, 300, 15, [{ atk: 'jumpToPlayer', dmg: 40 }, { atk: 'fireballBarrage' }, { atk: 'dash', dmg: 25 }],
        50, { top: 8, left: 12, bottom: 0, right: 12 }),

    new enemy('Mage', [3040, 2325], 75, [400, null], 1, 100, 100, 20, [{ atk: 'Flame' }, { atk: 'fireball' }, { atk: 'fireballBarrage' }],
        10, { top: 8, left: 12, bottom: 0, right: 12 }),

    //3rd zone
    new enemy('Mage', [4800, 1580], 100, [300, false], 1, 100, 100, 15, [{ atk: 'dash', dmg: 20 }, { atk: 'fireball' }],
        50, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [5310, 1580], 100, [300, false], 1.2, 100, 100, 20, [{ atk: 'dash', dmg: 25 }, { atk: 'Flame' }],
        50, { top: 8, left: 12, bottom: 0, right: 12 }),

    //4th zone
    new enemy('Mage', [6430, 1725], 0, [600, null], 1, 100, 100, 10, [{ atk: 'Flame' }, { atk: 'fireball' }],
        20, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [7070, 1460], 0, [600, null], 1, 100, 100, 10, [{ atk: 'fireballBarrage' }],
        20, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [6430, 1015], 100, [600, false], 1.2, 100, 100, 20, [{ atk: 'dash', dmg: 15 }, { atk: 'jumpToPlayer', dmg: 25 }],
        40, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Xarzeth', [7710, 1750], 50, [400, null], 1.5, 250, 100, 10, [{ atk: 'jumpToPlayer', dmg: 20 }, { atk: 'fireballBarrage' }, { atk: 'dash', dmg: 10 }, { atk: 'smallHeal' }],
        40, { top: 8, left: 12, bottom: 0, right: 12 }),

    //5th zone
    new enemy('Mage', [1760, 3600], 90, [300, false], 1, 100, 100, 10, [{ atk: 'dash', dmg: 15 }, { atk: 'fireballBarrage' }, { atk: 'jumpToPlayer', dmg: 20 }],
        40, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [1760, 3925], 90, [300, false], 1.2, 100, 100, 15, [{ atk: 'dash', dmg: 20 }, { atk: 'Flame' }, { atk: 'fireball' }],
        40, { top: 8, left: 12, bottom: 0, right: 12 }),
    new enemy('Mage', [2650, 3765], 110, [750, null], 1.5, 300, 300, 20, [{ atk: 'jumpToPlayer', dmg: 15 }, { atk: 'sapphireBlast' }],
        40, { top: 8, left: 12, bottom: 0, right: 12 }),
];

//Spellcircles & spellattacks
const spellMoves = {
    circles: [//Spell spawning
        new spellCircle('Ice Trap', 'iceTrap', 5, 15, 10, true, true, true, true, 0.15, 5, 5),
        new spellCircle('Fire Ball', 'fireProjectile', false, 1.5, 0.5, false, true, false, true, 0, 5, null),
        new spellCircle('Flame', 'flameProjectile', false, 10, 0.5, false, true, false, true, 0, 5, null),
        new spellCircle('Sapphire shattering ultra omega (sus potion 3 am) blast', 'sapphireProjectile', false, 16, 0.1, false, true, false, true, 0, 5, null),
        new spellCircle('Small heal', undefined, false, 30, 0, false, true, false, false, 0, 0, null),
        new spellCircle('Large heal', undefined, false, 120, 0, false, true, false, false, 0, 0, null)
    ],
    attacks: [//Spell attacks
        new spellAttack('iceTrap', 'iceTrap', undefined, 5, { enabled: true, dmg: 2, dur: 10, timeout: 750 }, 1, 1, 5),
        new spellAttack('fireProjectile', 'fireProjectile', 'Fire Ball-spell', 10, { enabled: false }, 1, 1, 5, true, 1, 115, { top: 16, left: 10, bottom: 16, right: 10 }),
        new spellAttack('flameProjectile', 'flameProjectile', 'Flame-spell', 0, { enabled: true, dmg: 2, dur: 15, timeout: 1000 },
            1, 1, 5, false, 1, 65, { top: 5, left: 5, bottom: 5, right: 5 }),
        new spellAttack('Sapphire shattering ultra omega (sus potion 3 am) blast', 'sapphireProjectile', 'Sapphire shattering ultra omega (sus potion 3 am) blast-spell',
            20, { enabled: false }, 1, 0.1, 10, true, 2, 25, { top: 0, left: 0, bottom: 0, right: 0 })
    ]
}

//Spell variables
let spells;
let temporarySpells;

let currentSpell = spellMoves.circles[1];
let spellCooldown = [];
let spellContact = false;
let spellCount = 0;


let dungeonEnemies;
let minigame1Enemies;
let minigame2Enemies;

//Movement variables
let cursors;

let keyA;
let keyS;
let keyD;
let keyW;

// const spacebar = game.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
let movementSpeed = 100;
let targetingSprites = [];