const colorButtons = document.querySelectorAll(".color-btn");
const startBtn = document.querySelector("#start-btn");
const strictBtn = document.querySelector("#strict-btn");
const countScreen = document.querySelector("#count");

const sounds = {
    green: new Audio(
        "https://s3.amazonaws.com/freecodecamp/simonSound1.mp3"),
    red: new Audio(
        "https://s3.amazonaws.com/freecodecamp/simonSound2.mp3"),
    blue: new Audio(
        "https://s3.amazonaws.com/freecodecamp/simonSound3.mp3" ),
    yellow: new Audio(
        "https://s3.amazonaws.com/freecodecamp/simonSound4.mp3"),
    playSound (sound){
        this[sound].playbackRate = 1.5;
        this[sound].play();
    }    
};

class SimonGame{
    constructor(green, red, yellow, blue){
        this.sequence = [];
        this.sequenceToGuess = [];
        this.strict = false;
        this.turn = "computer";
        this.buttons = {
            green,
            red,
            yellow,
            blue
        };
    };

    addSequence(){
        this.sequence.push(
            Object.keys(this.buttons)[parseInt(Math.random() * 4)]
        );
        countScreen.textContent = this.sequence.length;
        this.sequenceToGuess = [...this.sequence];
    };

    updateTurn(){
        this.turn = this.turn === "computer"
        ? "human"
        : "computer";
    }

    strictToggle(){
        this.strict = this.strict
        ? false
        : true;
    };

    resetNormalGame(){
        this.turn = "computer";
        this.sequenceToGuess = [...this.sequence];
        countScreen.textContent = this.sequence.length;
    };

    resetStrictGame(){
        this.sequence = [];
        this.sequenceToGuess = [];
        this.turn = "computer";
        countScreen.textContent = this.sequence.length;
    };

    offGame(){
        this.sequence = [];
        this.sequenceToGuess = [];
        this.turn = "computer";
        startBtn.classList.remove("active");
        countScreen.textContent = "- -"
    };

    win(){
        this.offGame();
        countScreen.textContent = "WIN!";
        errorAnimation(this);
    };
};

const flash = (color, timeFlash)=>{
    return new Promise(resolve =>{
        color.classList.add("active");
        setTimeout(()=>{
            color.classList.remove("active");
            setTimeout(() => {
                resolve();
            }, 250);
        }, timeFlash);
    });
};

const startFlashing = async(game)=>{
    for(const color of game.sequence){
        sounds.playSound(color);
        await flash(game.buttons[color], 700);
    };
    game.updateTurn();
};

const errorAnimation = (game)=>{
    let flashed = 0;
    let interval = setInterval(() => {
        for(const color in game.buttons){
            game.buttons[color].classList.add("active");
            setTimeout(()=>{
                game.buttons[color].classList.remove("active");
            }, 100);
        };
        if(flashed > 1) clearInterval(interval);
        flashed++
    }, 200);
};

const wrongButtonFlow = (typeReset, game) =>{
    game[typeReset]();
    errorAnimation(game);
    //Dsiplay sequence again
    setTimeout(()=>{
        startFlashing(game);
    }, 1000); 
};

const simonFlow = (currentGame, buttonPressed)=>{
    let expectedSequence = currentGame.sequenceToGuess.shift();

    if(!(expectedSequence === buttonPressed) && currentGame.strict){
        wrongButtonFlow("resetStrictGame", currentGame);
    }

    if(!(expectedSequence === buttonPressed) && !currentGame.strict){
        wrongButtonFlow("resetNormalGame", currentGame);
    }
    

    if(currentGame.sequenceToGuess.length === 0){
        if(currentGame.sequence.length === 8){
            currentGame.win();
        }
        
        if(startBtn.classList.contains("active")){
            currentGame.updateTurn();
            currentGame.addSequence();
            //Dsiplay sequence again
            setTimeout(()=>{
                startFlashing(currentGame);
            }, 1000); 
        }

    }
}; 

document.addEventListener("DOMContentLoaded", ()=>{
    let simonInstance = new SimonGame(...colorButtons);
    //Start button
    startBtn.addEventListener("click", ()=>{
        //Button active means game on
        if(!startBtn.classList.contains("active")){
            startBtn.classList.add("active");
            simonInstance.addSequence();
            startFlashing(simonInstance);  
        }else{
            startBtn.classList.remove("active");
            simonInstance.offGame();
        }
    });
    //Strict button
    strictBtn.addEventListener("click", ()=>{
        simonInstance.strictToggle();
        strictBtn.classList.toggle("active");
    });
    //Color buttons
    colorButtons.forEach(btn => {

        btn.addEventListener("click", (e)=>{
            //Example of id button : "color-(red)" <- take this
            let colorButton = e.currentTarget.id.split("-")[1];

            if(startBtn.classList.contains("active")&&
            simonInstance.turn === "human"){

                (async ()=> await flash(e.currentTarget, 400))();
                sounds.playSound(colorButton);
                simonFlow(simonInstance, colorButton);
            };
            //

        });
        //

    });

    
});







