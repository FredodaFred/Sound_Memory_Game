// global constants
const cluePauseTime = 333; //how long to pause in between clues
const nextClueWaitTime = 1000; //how long to wait before starting playback of the clue sequence

//Global Variables
var pattern = [];
var progress = 0;
var gamePlaying = false;
var tonePlaying = false
var volume = 0.5 //must be betwee 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 0; //how long to hold each clue's light/sound
var strikes = 0;//how many mistakes did the player make, 3 means game over
var timerId = 0; //Holds id of the timer
var timerCounter = 0; //which guess the user SHOULD be on (for timer)
var guessTime = 3000; //How long a user has to guess the right color (5s)
var checkTime = 0; //how frequently are we checking the timer?

function genPattern(){
  //Create the pattern using math.random
  function getRandomInt(min, max) {return min + Math.floor(Math.random() * (max - min + 1));} 
  pattern = []
  for(let i = 0; i < 8; i++){
     pattern.push(getRandomInt(1,5))
  }
  console.log("The pattern is: " + pattern)
}

function startGame() {
  //initialize game variables
  progress = 0;
  gamePlaying = true;
  clueHoldTime = 1000
  guessCounter = 0;
  progress = 0;
  strikes = 0;
  guessTime = 3000;
  genPattern()
  
  // swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  document.getElementById("strikes").innerHTML = "Attempts remaining: "+ (3-strikes)
  playClueSequence()
}

function stopGame(){
  stopTimer()
  gamePlaying = false
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

function guess(btn){
  //Stop timer
  stopTimer()
  
  console.log("user guessed: " + btn); 
  if(!gamePlaying){
    return;
  }
  //if the guess is not correct
  else if(btn != pattern[guessCounter]){
    strikes++;
    console.log("strikes: "+ strikes)
    //reset guesstimer: clearInterval and startTimer
    document.getElementById("strikes").innerHTML = "Attempts remaining: "+ (3-strikes)
    if(strikes >= 3){
      loseGame()
    }
  }
  //if turn not over
  else if(guessCounter < progress){
    console.log(guessCounter)
    guessCounter++;
  }
  //is not the last turn
  else if (progress < pattern.length-1){
     guessTime += 3000 //3 seconds for every new clue
     progress++;
     guessCounter = 0;
     timerCounter = 0;
     playClueSequence();
  } //win game
  else{
    winGame();  
  }
}



function startTimer(){
  document.getElementById("timer").innerHTML = "Time Left: "+ ((guessTime/1000)-(checkTime/1000))
  if(checkTime == guessTime){
    console.log("gc: "+guessCounter +"progress: "+progress)
      //check for every guesstime passed if guessCounter++ has been made until guess == progress
    if((guessTime/1000)-(checkTime/1000) <= 0){
        console.log('timer strike')
        strikes += 1
        document.getElementById("strikes").innerHTML = "Attempts remaining: "+ (3-strikes)
        checkTime = 0
        
      }
    if(strikes == 3){
        loseGame()
    }
  }
  
  checkTime += 1000
  console.log("CT:" + checkTime)

}

function stopTimer(){
  clearInterval(timerId)
  checkTime = 0
  //playclueseq
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  let delay = nextClueWaitTime; //set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
    clueHoldTime -= 25
  }
  timerId = setInterval(startTimer, 1000)
}

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

function loseGame(){
  stopGame();
  alert("Game Over. You lost.");
}
function winGame(){
  stopGame()
  alert("Game Over. You Won!")
}
//For onclick of gameAreaButtons
function showImg(btn){
    document.getElementById("img"+btn).style.visibility = "visible";
}
function hideImg(btn){
  document.getElementById("img"+btn).style.visibility = "hidden";
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6, //C7 add 9
  2: 329.6,
  3: 392,
  4: 466.2,
  5: 587.3
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn];
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
   
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    tonePlaying = true
  }
}
function stopTone(){
    g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
    tonePlaying = false
}

//Page Initialization
// Init Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)

