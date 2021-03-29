// sizing and resizing dynamically is happening in css #mycanvas and #parentdiv - overrides what's happening in here

let theVolume = -10;
let treeSteps = 3;
let treeRows = 2;
let numberOfTreeButtons = treeSteps * treeRows;// automatically generate circular synth based on this
let treeButtonPositions = []; // position to draw the buttons

let birdSteps = 8;
let birdRows = 3;
let birdPositions = [];

let birdStuff = new Array ();
    birdStuff[0] = new Array ();
    birdStuff[1] = new Array ();
    birdStuff[2] = new Array ();


let totalNumberOfButtons = numberOfTreeButtons + birdSteps + birdRows;

let endedTouches = []; // array to store ended touches in

let buttonColour = []; // colour of the tree buttons at any given time
let buttonOffColour; // default off colours for tree buttons
let buttonOnColour; // default on colours for tree buttons
let treeCentreColour; // live state of tree centre button colour
let treeCentreOffColour;
let treeCentreOnColour;
let synthState = []; // we need to store whether a note is playing because the synth is polyphonic and it will keep accepting on messages with every touch or moved touch and we won't be able to switch them all off
let radius; // radius of the buttons
let offsetT; // to store the difference between x and y readings once menus are taken into account
let r; // radius of the circle around which the buttons will be drawn
let angle = 0; // variable within which to store the angle of each button as we draw it
let step; // this will be calculated and determine the gap between each button around the circle
let ongoingTouches = []; // array to copy the ongoing touch info into

let soundOn = false; // have we instigated Tone.start() yet? (needed to allow sound)
let whichKey = [0,0,0,0,0,0,0,0,0]; // array ensures only one trigger per qwerty click
let mouseState = []; // variable to store mouse clicks and drags in
let mouseClick = false;

let tree_x; // position of tree
let tree_y; // position of tree
let sun_x; // position of sun
let sun_y; // position of sun
let grassPosition; // position of grass, set in setup as uses p5 function

let tree2image; // current image for these items

let sky, birdOn, birdOff, birdStep1, birdStep2, grass, tree, tree2; // to store images in

let treewidth;
let treeheight;
let birdWidth;
let birdHeight;
let tree2width;

let one = 'ha1';
let two = 'ha2';
let three = 'ha3';
let four = 'he1';
let five = 'he2';
let six = 'he3';
let s1 = 'bubbles';
let s2 = 'bubbles';
let s3 = 'bubbles';

const player1 = new Tone.Player().toDestination();
const player2 = new Tone.Player().toDestination();
const player3 = new Tone.Player().toDestination();
const player4 = new Tone.Player().toDestination();
const player5 = new Tone.Player().toDestination();
const player6 = new Tone.Player().toDestination();
const seqRow1player = new Tone.Player().toDestination();
const seqRow2player = new Tone.Player().toDestination();
const seqRow3player = new Tone.Player().toDestination();

let playerArray = [player1, player2, player3, player4, player5, player6];

let seqPlayerArray = [seqRow1player, seqRow2player, seqRow3player];

Tone.Transport.scheduleRepeat(repeat, '8n'); // call our function 'repeat' every x time (8n or an 8th note in this case)
Tone.Transport.scheduleRepeat(playLooper, '1m');
Tone.Transport.bpm.value = 70;
console.log(`bpm ${Math.round(Tone.Transport.bpm.value)}`);

let slower;
let faster;
let save;

let bpmShow = false;

let bpmTextSize;
let optionTextSize;

function preload() {
  sky = loadImage(`/images/background.jpg`);
  birdOn = loadImage(`/images/bird_on.png`);
  birdOff = loadImage(`/images/bird.png`);
  birdStep1 = loadImage(`/images/bird_icon_yellow.png`);
  birdStep2 = loadImage(`/images/bird_icon_purple.png`);
  grass = loadImage(`/images/grass.jpg`);
  tree = loadImage(`/images/tree.png`);
  tree2off = loadImage(`/images/tree2_off.png`);

  buffers = new Tone.ToneAudioBuffers({
    urls: {
      A1: `${one}.mp3`,
      A2: `${two}.mp3`,
      A3: `${three}.mp3`,
      A4: `${four}.mp3`,
      A5: `${five}.mp3`,
      A6: `${six}.mp3`,
      S1: `${s1}.mp3`,
      S2: `${s2}.mp3`,
      S3: `${s3}.mp3`
    },
    //onload:  () => welcomeScreen(), // initial screen for project - also allows an elegant place to put in the Tone.start() command.,
    baseUrl: "/sounds/"
  });

}

function setup() {  // setup p5
  step = TWO_PI/numberOfTreeButtons; // in radians the equivalent of 360/6 - this will be used to draw the circles position
  console.log(`step = ${step}`);

  let masterDiv = document.getElementById("container");
  let divPos = masterDiv.getBoundingClientRect(); //The returned value is a DOMRect object which is the smallest rectangle which contains the entire element, including its padding and border-width. The left, top, right, bottom, x, y, width, and height properties describe the position and size of the overall rectangle in pixels.
  let masterLeft = divPos.left; // distance from left of screen to left edge of bounding box
  let masterRight = divPos.right; // distance from left of screen to the right edge of bounding box
  let cnvDimension = masterRight - masterLeft; // size of div -however in some cases this is wrong, so i am now using css !important to set the size and sca;ing - but have kept this to work out size of other elements if needed

  console.log("canvas size = " + cnvDimension);

  let cnv = createCanvas(cnvDimension, cnvDimension); // create canvas - because i'm now using css size and !important this sizing actually reduntant
  cnv.id('mycanvas'); // assign id to the canvas so i can style it - this is where the css dynamic sizing is applied
  cnv.parent('p5parent'); //put the canvas in a div with this id if needed - this also needs to be sized

  // *** add vanilla JS event listeners for touch which i want to use in place of the p5 ones as I believe that they are significantly faster
  let el = document.getElementById("p5parent");
  el.addEventListener("click", handleClick);

  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be

  noStroke(); // no stroke on the drawings

  radius = width/14;
  r = width/5;
  tree_x = (width/36) * 13;
  tree_y = (height/18) * 11;
  tree2image = tree2off;
  grassPosition = (height/10)*9;
  buttonOffColour = 'rgba(0, 200, 70, 0.3)'; // default off colours for tree buttons
  buttonOnColour = 'rgba(255, 255, 0, 0.3)'; // default on colours for tree buttons
  treewidth = (width/5)*3.5;
  treeheight = (width/5)*3;
  birdWidth = width/9;
  birdHeight = width/12;
  tree2width = width/6;
  speed_text_y =  height/10*9.5;
  bpmTextSize = width/8;
  optionTextSize = width/16;
  slower = ({
    x: width/10,
    y: height/10*9.5,
    text: 'Slower',
    colour: 'rgba(255, 255, 255, 0.9)'
  });
  faster = ({
    x: width/10*9,
    y: height/10*9.5,
    text: 'Faster',
    colour: 'rgba(255, 255, 255, 0.9)'
  });
  save = ({
    x: width/2,
    y: height/10*9.5,
    text: 'Save',
    colour: 'rgba(255, 255, 255, 0.9)'
  });

  for (let i = 0; i < numberOfTreeButtons; i++) { // for each button build mouseState default array
    mouseState.push(0);
  }

  if (window.DeviceOrientationEvent) {      // if device orientation changes we recalculate the offsetT variable
    window.addEventListener("deviceorientation", handleOrientationEvent);
  }

  welcomeScreen(); // initial screen for project - also allows an elegant place to put in the Tone.start() command.
                    // if animating put an if statement in the draw() function otherwise it will instantly overide it
  createButtonPositions(); // generate the default array info depending on number of buttons
}

function handleOrientationEvent() {
  let el = document.getElementById("p5parent");
  offsetT = el.getBoundingClientRect(); // get the size and position of the p5parent div so i can use offset top to work out where touch and mouse actually need to be
}

function welcomeScreen() {
  background(150); // background is grey (remember 5 is maximum because of the setup of colorMode)
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Imagined Landscapes. Touch screen or click mouse or use keys QWERTYU", width/10, height/10, (width/10) * 8, (height/10) * 8);
}

function createButtonPositions() {

  //tree button positions

  let treeStepStart = tree_x - radius*2.5;
  let treeStepIncrement = radius*2.3;
  let treeStepDistance = treeStepStart;
  let treeRowIncrement = radius*2.5;
  let treeRowPosition = tree_y - radius*2;

  for(let i = 0; i < treeRows; i++){
    for(let i = 0; i < treeSteps; i++){
      treeButtonPositions.push({
        x: treeStepDistance,
        y: treeRowPosition,
        state: 0,
        colour: buttonOffColour
      });
      treeStepDistance = treeStepDistance + treeStepIncrement;
    }
    treeStepDistance = treeStepStart;
    treeRowPosition = treeRowPosition + treeRowIncrement;
  }

  for(let i = 0; i < treeButtonPositions.length; i++){
    synthState.push(0); //create default state of the synth array
    buttonColour[i] = buttonOffColour;
  }

  //next the positions of the bird sequencer buttons

  let step = (birdSteps/birdSteps);
  let birdStepStart = width/(birdSteps*1.5);
  let birdStepIncrement = width/(birdSteps + (step*0.5));
  let birdStepDistance = birdStepStart;
  let birdRowIncrement = height/10;
  let birdRowDistance = birdRowIncrement;
  let birdRowPosition = birdRowDistance;

  for(let i = 0; i < birdRows; i++){
    for(let j = 0; j < birdSteps; j++){
      birdStuff[i].push({
        x: birdStepDistance,
        y: birdRowPosition,
        state: 0,
        image: birdOff
      });
      birdStepDistance = birdStepDistance + birdStepIncrement;
    }
    birdStepDistance = birdStepStart;
    birdRowPosition = birdRowPosition + birdRowIncrement;
  }
}

function drawSynth(step) { // instead of using the draw function at 60 frames a second we will call this function when something changes

  imageMode(CORNER);

  image(sky, 0, 0, width, height); // place the sky image
  imageMode(CENTER);
  image(tree, tree_x, tree_y + (birdHeight/3), treewidth, treeheight); // place the tree image
  imageMode(CORNER);
  image(grass, 0, grassPosition, width, (height/5)*2); // place the grass image
  image(tree2image, (width/10)*8, grassPosition - tree2width, tree2width, tree2width);

  for (let i = 0; i < numberOfTreeButtons; i++) { // draw the looper buttons on tree
    fill(treeButtonPositions[i].colour);
    ellipse(treeButtonPositions[i].x, treeButtonPositions[i].y, radius * 2);
  }

  imageMode(CENTER);

  for(let i = 0; i < birdRows; i++){
    for(let j = 0; j < birdSteps; j++){
      if((j === step) && (birdStuff[i][j].state === 0)){ // if this is the current step and the step is "off"
        image(birdStep1, birdStuff[i][j].x, birdStuff[i][j].y, birdWidth, birdHeight); // then yellow bird for this step
      }else if((j === step) && (birdStuff[i][j].state === 1)){ // if this is the current step and the step is "on"
        image(birdStep2, birdStuff[i][j].x, birdStuff[i][j].y, birdWidth, birdHeight); // then purple bird for this step
      }
      else{
        image(birdStuff[i][j].image, birdStuff[i][j].x, birdStuff[i][j].y, birdWidth, birdHeight); // otherwise bird colour reflects step state
      }
    }
  }

  textFont('Helvetica');
  textSize(optionTextSize);
  fill(slower.colour);
  text(slower.text, slower.x, slower.y);
  fill(faster.colour);
  text(faster.text, faster.x, faster.y);
  fill(save.colour);
  text(save.text, save.x, save.y);

  if(bpmShow){
    textSize(bpmTextSize);
    fill('rgba(255, 255, 255, 0.7)');
    text(`BPM ${Math.round(Tone.Transport.bpm.value)}`, width/2, height/2);
  }
}

function startAudio() {
    Tone.start(); // we need this to allow audio to start.
    soundOn = true;
    drawSynth();
    player1.buffer = buffers.get("A1");
    player1.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player2.buffer = buffers.get("A2");
    player2.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player3.buffer = buffers.get("A3");
    player3.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player4.buffer = buffers.get("A4");
    player4.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player5.buffer = buffers.get("A5");
    player5.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    player6.buffer = buffers.get("A6");
    player6.set(
      {
        "mute": false,
        "volume": -65,
        "autostart": false,
        "fadeIn": 11,
        "fadeOut": 2,
        "loop": false,
        "loopEnd": "1m",
        "loopStart": 0,
        "playbackRate": 1,
        "reverse": false
      }
    );
    seqRow1player.buffer = buffers.get("S1");
    seqRow1player.set(
      {
        "mute": false,
        "volume": -10,
        "autostart": false,
        "fadeIn": 0,
        "fadeOut": 0,
        "loop": false,
        "playbackRate": 1,
        "reverse": false
      }
    );
    seqRow2player.buffer = buffers.get("S2");
    seqRow2player.set(
      {
        "mute": false,
        "volume": -10,
        "autostart": false,
        "fadeIn": 0,
        "fadeOut": 0,
        "loop": false,
        "playbackRate": 1,
        "reverse": false
      }
    );
    seqRow3player.buffer = buffers.get("S3");
    seqRow3player.set(
      {
        "mute": false,
        "volume": -10,
        "autostart": false,
        "fadeIn": 0,
        "fadeOut": 0,
        "loop": false,
        "playbackRate": 1,
        "reverse": false
      }
    );
    Tone.Transport.start();
}

function playLooper() {
  player1.start();
  player2.start();
  player3.start();
  player4.start();
  player5.start();
  player6.start();
}


function handleClick(e){
  if(soundOn) {

    for (let i = 0; i < numberOfTreeButtons; i++) {
      let d = dist(mouseX, mouseY, treeButtonPositions[i].x, treeButtonPositions[i].y);
      if (d < radius) {
        buttonPressed(i);
      }
    }

    for(let i = 0; i < birdRows; i++){
      for(let j = 0; j < birdSteps; j++){
        let d = dist(mouseX, mouseY, birdStuff[i][j].x, birdStuff[i][j].y);
        if (d < birdHeight/2) {
          seqPressed(i, j);
        }
      }
    }

    if(isMouseInsideText(slower.text, slower.x, slower.y)){
      console.log("slower");
      if(Tone.Transport.bpm.value > 35){
        Tone.Transport.bpm.value = Tone.Transport.bpm.value - 5;
      }
      setSpeed(Tone.Transport.bpm.value);
      console.log(`bpm ${Math.round(Tone.Transport.bpm.value)}`);
      slower.colour = 'rgba(255, 0, 255, 0.9)'
      bpmShow = true;
      drawSynth();
      setTimeout(() => {
        bpmShow = false;
        slower.colour = 'rgba(255, 255, 255, 0.9)';
        drawSynth();
      }, 1000);
    }

    if(isMouseInsideText(faster.text, faster.x, faster.y)){
      console.log("faster");
      if(Tone.Transport.bpm.value < 195){
        Tone.Transport.bpm.value = Tone.Transport.bpm.value + 5;
      }
      setSpeed(Tone.Transport.bpm.value);
      console.log(`bpm ${Math.round(Tone.Transport.bpm.value)}`);
      faster.colour = 'rgba(255, 0, 255, 0.9)'
      bpmShow = true;
      drawSynth();
      setTimeout(() => {
        bpmShow = false;
        faster.colour = 'rgba(255, 255, 255, 0.9)';
        drawSynth();
      }, 1000);
    }

    if(isMouseInsideText(save.text, save.x, save.y)){
      console.log("save");
      save.colour = 'rgba(255, 0, 255, 0.9)'
      saveSeq();
      drawSynth();
      setTimeout(() => {
        save.colour = 'rgba(255, 255, 255, 0.9)';
        drawSynth();
      }, 1000);
    }

  }else{
    startAudio();
  }
}

function seqPressed(row, step) {

  if(birdStuff[row][step].state === 0) { // if the synth is not playing that note at the moment
    birdStuff[row][step].image = birdOn;
    drawSynth();
    birdStuff[row][step].state = 1; // change the array to reflect that the note is playing
  }
  else { // if the synth is playing that note at the moment
    birdStuff[row][step].image = birdOff;
    drawSynth();
    birdStuff[row][step].state = 0; // change the array to reflect that the note is playing
  }
  console.log(`row${row} step ${step} = ${birdStuff[row][step].state}`);


}

function setSpeed(tempo) {
  for(let i = 0; i < playerArray.length; i++){
    playerArray[i].playbackRate = tempo/70;
  }
  for(let i = 0; i < seqPlayerArray.length; i++){
    seqPlayerArray[i].playbackRate = tempo/70;
  }
}

function buttonPressed(i) {
    if(treeButtonPositions[i].state === 0) { // if the synth is not playing that note at the moment
      playerArray[i].volume.rampTo(theVolume, 2);
      treeButtonPositions[i].colour = buttonOnColour; //change the colour of the button to on colour
      drawSynth();
      treeButtonPositions[i].state = 1; // change the array to reflect that the note is playing
    }
    else { // if the synth is playing that note at the moment
      playerArray[i].volume.rampTo(-65, 2);
      treeButtonPositions[i].colour = buttonOffColour; //change the colour of the button to off colour
      drawSynth();
      treeButtonPositions[i].state = 0; // change the array to reflect that the note is playing
    }
    console.log(`treeButtonPositions${i} = ${treeButtonPositions[i].state}`);
}

let index = 0;
    notes = ['a3', 'g3', 'e3', 'd3', 'c3'];

    const sampler = new Tone.Sampler({
      urls: {
        C3: "bubbles.mp3",

      },
      baseUrl: "/sounds/",
    // 	onload: () => {
    //     // hideLoadScreen();
    //   }
      volume: theVolume
    }).toDestination();

function repeat(time) {
  let _step = index % birdSteps;
  drawSynth(_step)
  for(let i = 0; i < birdRows; i++) {
    //console.log(`row ${i} step ${_step} `);
    let synth = sampler,
    note = notes[i];
    //console.log(`row ${i} step ${_step} ${birdStuff[i][_step].state}`);
    if(birdStuff[i][_step].state === 1) {
      //synth.triggerAttackRelease(note, '4n', time);
      seqPlayerArray[i].start();
    }
  }

  index++;
}

function isMouseInsideText(text, textX, textY) {
  const messageWidth = textWidth(text);
  const messageTop = textY - textAscent();
  const messageBottom = textY + textDescent();

  return mouseX > textX - messageWidth/2 && mouseX < textX + messageWidth/2 && // note messageWidth/2 because text being drawn centred in draw
    mouseY > messageTop && mouseY < messageBottom;
}



// save functionality here

//document.URL is the current url
var url_ob = new URL(document.URL);

var savedWork = url_ob.hash; //retrieve saved work from url
var savedWorkNoHash = savedWork.replace('#', ''); // remove the hash from it leaving only the number
//var savedSeqAsBinary = (parseInt(savedWorkNoHash, 16).toString(2)); //convert saved work to binary number
var savedSeqAsArray = savedWorkNoHash.split('');
//var totalSteps = rows * seqLength; // not sure if i need this on
var convertedSeqAsArray = new Array ();


// for (let i = rows-1; i >= 0; i--) {  // put the saved number into the sequence arrays - running this loop backwards to fill in from lowest number
//   for (let j = seqLength-1; j >= 0; j--) {
//       if (savedSeqAsArray.length > 0){
//           seqSteps[i][j] = savedSeqAsArray.pop(); //remove last number from array and place in last place
//       } else {   //we will likely run out of numbers unless the first step is used
//           seqSteps[i][j] = "0"; //in that case place a 0
//       }
//       let input = document.getElementById(`row${i}step${j}`);
//       console.log(input);
//       if (seqSteps[i][j] === "1") {
//           input.checked = true;
//       } else {
//           input.checked = false;
//       }
//   }
// }

let birdSaveSteps = new Array;
  birdSaveSteps[0] = new Array;
  birdSaveSteps[1] = new Array;
  birdSaveSteps[2] = new Array;

function saveSeq() {
  url_ob = new URL(document.URL);
  for(let i = 0; i < birdRows; i++){
    for(let j = 0; j < birdSteps; j++){
      birdSaveSteps[i].push(birdStuff[i][j].state);
    }
  }


  let row0 = birdSaveSteps[0].join('');
  let row1 = birdSaveSteps[1].join('');
  let row2 = birdSaveSteps[2].join('');
  let seqAsBinary = `${row0}${row1}${row2}`;
  console.log(seqAsBinary);
  //let seqAsHex = seqAsBinary.toString(16);
  // var seqAsHex = parseInt(seqAsBinary, 2).toString(16);
  // console.log(seqAsHex);
  // console.log(parseInt(seqAsHex, 16).toString(2)); //convert back to long binary
  url_ob.hash = `#${seqAsBinary}`;
  var new_url = url_ob.href;
  document.location.href = new_url;
}
