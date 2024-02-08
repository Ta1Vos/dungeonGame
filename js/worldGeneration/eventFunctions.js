//Prevents too many calls from overlaps
function screenFade(player, teleporter) {
    if (screenCover.visible != true) {
        //Array that contains the position where the player will teleport to
        const teleportPos = [teleporter.teleportto.x, teleporter.teleportto.y];

        screenCover.visible = true;
        screenCover.alpha = 0.05;
        screenCover.x = player.x;
        screenCover.y = player.y;
        fadeLoop(0.05, teleportPos);
    }
}

//Loop for the screencover fade
function fadeLoop(changeAmount, teleportPos) {
    if (screenCover.reverse == false) {
        //Fade-out
        setTimeout(() => {
            screenCover.alpha += changeAmount;
            fadeLoop(changeAmount, teleportPos);
            if (screenCover.alpha == 1) {
                //Move the player
                player.x = teleportPos[0];
                player.y = teleportPos[1];

                setTimeout(() => {
                    screenCover.reverse = true;
                }, 1000);
            }
        }, 100);
    } else {
        //Fade-in
        if (screenCover.alpha > 0.05) {
            screenCover.alpha -= changeAmount;
            setTimeout(() => {
                fadeLoop(changeAmount);
            }, 125);
        } else if (screenCover.alpha <= 0.05) {
            //Initializes when the fade has finished
            setTimeout(() => {
                screenCover.visible = false;
                screenCover.reverse = false;
                screenCover.running = false;
            }, 500);
        }
    }
}