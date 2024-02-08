//Create an enemy with settings in the constructor.
class enemy {
    //Booleans that only get changed during the time of the game.
    statusEffect = false;
    pauseAnimations = false;
    cancelAnimations = false;
    dmgCooldown = false;
    attackCooldown = false;
    spellContact = false;
    moving = false;

    //Settings which can alter/create an enemy.
    constructor(sprite, spawn, moveSpeed, aggroDistance, scale, maxHp, hp, dmg, attackMoves, attackRate, hitboxPadding) {
        this.sprite = String(sprite);
        this.spawn = spawn;
        this.moveSpeed = moveSpeed;
        this.aggroDistance = aggroDistance;
        this.scale = scale;
        this.maxHp = maxHp;
        this.hp = hp;
        this.dmg = dmg;
        this.attackMoves = attackMoves;
        this.attackRate = attackRate;
        this.hitboxPadding = hitboxPadding;
    }
}

//Create a spell circle ( base for spell spawning ) with settings in the constructor.
class spellCircle {
    //Booleans that only get changed during the time of the game.
    coolingDown = false;
    ignoreSprite = false;
    spellContact = false;

    //Settings which can alter/create a spell circle.
    constructor(sprite, attackName, charge, cooldown, despawn, activeOnTouch, disappearOnTouch, followCursor, isCircle, scale, speed, stun) {
        this.sprite = sprite;
        this.attackName = attackName
        this.charge = charge;
        this.cooldown = cooldown;
        this.despawn = despawn;
        this.activeOnTouch = activeOnTouch;
        this.disappearOnTouch = disappearOnTouch;
        this.followCursor = followCursor;
        this.isCircle = isCircle;
        this.scale = scale;
        this.speed = speed;
        this.stun = stun;
    }
}

//Create a spell attack with settings in the constructor.
class spellAttack {
    //Booleans that only get changed during the time of the game.
    ignoreSprite = undefined;
    spellContact = false;

    //Settings which can alter/create a spell attack.
    constructor(sprite, attackName, animationName, dmg, passiveDmg, chargeScale, sizeScale, duration, disappearOnTouch, damageCooldown, velocitySpeed, hitboxPadding) {
        this.sprite = sprite;
        this.attackName = attackName
        this.animationName = animationName;
        this.dmg = dmg;
        this.passiveDmg = passiveDmg;
        this.chargeScale = chargeScale;
        this.sizeScale = sizeScale;
        this.duration = duration;
        this.disappearOnTouch = disappearOnTouch;
        this.damageCooldown = damageCooldown;
        this.velocitySpeed = velocitySpeed;
        this.hitboxPadding = hitboxPadding;
    }
}