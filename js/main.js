const centeredBtn = document.querySelector(".centered-btn");
const overlayLocation = document.querySelector(".overlay-location");
let buttonPressed = false;
let audioHTMLText = `<audio autoplay class="invisible" src="/audio/goofy-ahhh.mp3"></audio>`
let buttonLink = "/gameworld.html";
let firstCheck;
let secondCheck;

let innerHTMLText = `<div class="overlay-div short-transition overlay-transition z-index container-fluid col-9 bg-light mt-4">
    <div class="row">
        <div class="col col-3">
            <p>Bent u een bot?</p>
        </div>
    </div>
    <div class="row text-center mb-2">
        <form>
            <div class="col col-3">
                <input class="first-checkbox" type="checkbox" name="answer1" value="True">
                <label class="me-4" for="answer1">Ja</label>
                <input class="second-checkbox" type="checkbox" name="answer2" value="False">
                <label for="answer1">Nee</label>
            </div>
        </div>
    </form>
</div>`;

centeredBtn.addEventListener("click", addOverlay);

//Add the option overlay
function addOverlay(){
    buttonPressed = true;

    console.log("This button has been pressed");
    console.log(buttonPressed);

    overlayLocation.innerHTML += innerHTMLText;

    centeredBtn.remove();

    firstCheck = document.querySelector(".first-checkbox");
    secondCheck = document.querySelector(".second-checkbox");
    
    console.log(firstCheck, secondCheck);
    updateCheckValues();
};

//Adds eventlistener to the buttons
function updateCheckValues(){
    firstCheck.addEventListener("click", closePage);
    secondCheck.addEventListener("click", redirectToGame);
};

//Sends user to the gameworld page
function redirectToGame(){
    window.location.replace("/gameworld.html");
};

//Throws the user off of the page.
function closePage(){
    document.body.innerHTML += audioHTMLText;

    confirm("Kom terug wanneer je geen bot bent 💀");

    //Closes the page/window.
    close();
};