import SpriteText from 'three-spritetext';
import * as THREE from 'three';

import {playLetterPronunciation} from './init';
import {shuffleString, shuffle, getRandomArbitrary, transformScoreNumberToGameScore} from './utils';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
window.addEventListener( 'resize', onWindowResize, false );

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const balloonCountPerRow = 4;
const alphabetFactor = 30;

var balloonLetters = "abcdefghijklmnopqrstuvwxyz";
//var balloonLetters = "a";

let score = 0;

let resizeDone = false;

let gameState = "not-started";

// Variables for shake
const shakeIntensity = 0.1;  // Shake range
const shakeSpeed = 0.1;      // Speed of shake
let letterState = "non-shaking";

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    if(camera.aspect > 1){
        balloonCountPerRow = 2;
    }
}

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new THREE.TextureLoader();
scene.background = loader.load("assets/sky.jpg");



let lettersToFind = [];
let letterToFind = null;

for(let letterToFind of balloonLetters){
    lettersToFind.push(letterToFind);
}

balloonLetters = shuffleString(balloonLetters);

var shuffledLetters = "";

// Add more letters
for(let i=0; i < alphabetFactor; i++){
    shuffledLetters += shuffleString(balloonLetters);
}

const BALLOON_MAPPING = {};
const BALLOON_TEXTURES = [];
const letterSounds = {};

let balloonTextureLoader = new THREE.TextureLoader();


let bigLetterShowing = false;

// Load big letters
let bigLetters = {};
const letterIconGeometry = new THREE.PlaneGeometry(5, 5);

for(let balloonLetter of balloonLetters){
    const letterIconTexture = balloonTextureLoader.load(`assets/letters/${balloonLetter}.png`);
    const letterIconMaterial = new THREE.MeshBasicMaterial({ map: letterIconTexture, transparent: true});
    let letterIconPlane = new THREE.Mesh(letterIconGeometry, letterIconMaterial);
    letterIconPlane.position.x = 0;
    letterIconPlane.position.y = 0;
    bigLetters[balloonLetter] = letterIconPlane;
}

for(let letter of shuffledLetters){
    const balloonTexture = balloonTextureLoader.load('assets/balloons/balloon_'+ letter +'.png');
    BALLOON_TEXTURES.push(balloonTexture);
    BALLOON_MAPPING[letter] = balloonTexture;
}

//// Load sounds into a an object a: sound a to play sound when needed
//
//const listener = new THREE.AudioListener();
//
//
//const audioLoader = new THREE.AudioLoader();
//
//const soundWinLetter = new THREE.Audio(listener);
//audioLoader.load(`sounds/win.wav`, (buffer) => {
//    soundWinLetter.setBuffer(buffer);
//    soundWinLetter.setVolume(0.5);
//    soundWinLetter.onEnded = () => {
//       soundWinLetter.stop();
//    }
//});
//
//const soundWinGame = new THREE.Audio(listener);
//audioLoader.load(`sounds/end.mp3`, (buffer) => {
//    soundWinGame.setBuffer(buffer);
//    soundWinGame.setVolume(0.5);
//    soundWinGame.onEnded = () => {
//       soundWinGame.stop();
//    }
//});

for(let letterToFind of lettersToFind){
    const soundLetter = new THREE.Audio(listener);
    audioLoader.load(`sounds/${letterToFind}.wav`, (buffer) => {
        soundLetter.setBuffer(buffer);
        soundLetter.setVolume(0.5);
        soundLetter.onEnded = () => {
           letterState = "non-shaking";
        }
        letterSounds[letterToFind] = soundLetter;
    });
}


let alphabetBoxes = [];

let boxPlaneInitX = 10;
let boxPlaneInitY = -4;

let botPlaneIncrementY = 0.7;

let boxLineCounter = 0;

lettersToFind = lettersToFind.reverse();

for(var i=0; i<lettersToFind.length; i++){
    let letterBox = lettersToFind[i];
    let boxTexture = balloonTextureLoader.load(`assets/squares/${letterBox}.webp`);

    let boxMaterial = new THREE.MeshBasicMaterial({ map: boxTexture});

    let boxGeometry = new THREE.PlaneGeometry(0.6, 0.6);
    let boxPlane = new THREE.Mesh(boxGeometry, boxMaterial);

    boxPlane.name = letterBox;

    boxPlane.position.y = boxPlaneInitY + botPlaneIncrementY*boxLineCounter;

    if(i <= 12){
        boxPlane.position.x = boxPlaneInitX;
    }else{
        boxPlane.position.x = boxPlaneInitX - 0.8;
    }

     if(boxLineCounter == 12){
         boxLineCounter = 0;
    }else{
         boxLineCounter += 1;
    }

    scene.add(boxPlane);

    alphabetBoxes.push(boxPlane);
}

lettersToFind = shuffle(lettersToFind);

// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Grid Parameters
const rows = 1;  // Number of rows
const cols = 26;  // Number of columns
const planeWidth = 0.5;  // Width of each plane
const planeHeight = 0.5;  // Height of each plane
const gap = 0.3;  // Gap between planes

// Array to store all planes
const planes = [];

const balloonPlanes = [];

// Load Audio

camera.add(listener);
const sound = new THREE.Audio(listener);

audioLoader.load('sounds/pop.wav', (buffer) => {
    sound.setBuffer(buffer);
    sound.setVolume(0.5);
});

// Background Music
const backgroundMusic = new THREE.Audio(listener);
const audioBackgroundLoader = new THREE.AudioLoader();
audioBackgroundLoader.load('sounds/Colorful-World.mp3', (buffer) => { // Replace with your music path
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true); // Enable looping for background music
    backgroundMusic.setVolume(0.1); // Set an appropriate volume level
});

const totalWidth = cols * planeWidth + (cols - 1) * gap;
const totalHeight = rows * planeHeight + (rows - 1) * gap;

const balloonPlaneWidth = 2;  // Width of each plane
const balloonPlaneHeight = 4;  // Height of each plane

for(let i = 0; i < shuffledLetters.length; i++){
    const balloonGeometry = new THREE.PlaneGeometry(balloonPlaneWidth, balloonPlaneHeight);

    const balloonTexture = BALLOON_TEXTURES[i];
    const balloonMaterial = new THREE.MeshBasicMaterial({ map: balloonTexture, transparent: true});
    const balloonPlane = new THREE.Mesh(balloonGeometry, balloonMaterial);

    balloonPlane.name = shuffledLetters.charAt(i);
    balloonPlanes.push(balloonPlane);
}

// Sound icon
const soundPlaneWidth = 1;  // Width of each plane
const soundPlaneHeight = 1;  // Height of each plane
const soundIconGeometry = new THREE.PlaneGeometry(soundPlaneWidth, soundPlaneHeight);

letterToFind = lettersToFind.shift();

const soundIconTexture = balloonTextureLoader.load('assets/volume.png');
const soundIconMaterial = new THREE.MeshBasicMaterial({ map: soundIconTexture, transparent: true});
let soundIconPlane = new THREE.Mesh(soundIconGeometry, soundIconMaterial);
soundIconPlane.position.x = 0;
soundIconPlane.position.y -= 4.8;

scene.add(soundIconPlane);

let randomXPosition = -10;
let randomYPosition = 10;
// Balloon start at the bottom



let columnCounter = 0;

for(let i = 0; i < balloonPlanes.length; i++){
    const balloonPlane = balloonPlanes[i];

    if(columnCounter == balloonCountPerRow){
        randomXPosition = -10;
        columnCounter = 0;
    }

    columnCounter += 1;

    randomXPosition += 4;
    randomYPosition += 1.5;

    balloonPlane.position.y = -randomYPosition;
    balloonPlane.position.x = randomXPosition;

    scene.add(balloonPlane);
}

camera.position.z = 5;

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

// Handle Clicks
function onMouseClick(event) {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Play btn clicks
    const intersectsPlayButton = raycaster.intersectObject(menuPlayPlane);

    // Sound icon clicks
    const intersectsSoundIcon = raycaster.intersectObject(soundIconPlane);

    if((gameState == "not-started" || gameState == "ended") && intersectsPlayButton.length > 0){
         const clickedPlauPlane = intersectsPlayButton[0].object;

         scene.remove(clickedPlauPlane);
         scene.remove(menuLogoPlane);
         scene.remove(menuBGPlane);

         scene.remove(menuEndPlane);

          const soundLetter = new THREE.Audio(listener);
          const audioLoader = new THREE.AudioLoader();
          audioLoader.load(`sounds/start.ogg`, (buffer) => {
             soundLetter.setBuffer(buffer);
             soundLetter.setVolume(0.5);
             soundLetter.play();
          });

         backgroundMusic.play();

         if(gameState == 'not-started'){
            gameState = "running";
         }else{
            location.reload();
         }

    } else if (intersectsSoundIcon.length > 0) {
        const clickedSoundPlane = intersectsSoundIcon[0].object;

        soundLetterObj = letterSounds[letterToFind];
        soundLetterObj.play();
    }else{
        // Balloons clicks
        const intersects = raycaster.intersectObjects(balloonPlanes);

        if (intersects.length > 0 && bigLetterShowing==false) {
            const clickedPlane = intersects[0].object;
            // Check if match with sound
            if(clickedPlane.name == letterToFind){
                score += 1;

//                soundLetterObj = letterSounds[letterToFind];

                const index = balloonPlanes.indexOf(clickedPlane);
                if (index > -1) { // only splice array when item is found
                    balloonPlanes.splice(index, 1); // 2nd parameter means remove one item only
                }

                const tmpBalloonPlanes = balloonPlanes;
                // Remove other balloon with this letter

                // Play the sound
//                if (soundLetterObj.isPlaying) {
//                    soundLetterObj.stop(); // Stop sound if already playing
//                }
//                soundLetterObj.play();
                scene.remove(clickedPlane);
                scene.remove(soundIconPlane);

                // Color letter on the right
                for(let alphabetBox of alphabetBoxes){
                    if(alphabetBox.name == letterToFind){
                        scene.remove(alphabetBox);
                    }
                }

                for(let balloonPlane of tmpBalloonPlanes){
                    if(balloonPlane.name == letterToFind){
                        const indexOther = balloonPlanes.indexOf(balloonPlane);
                        if (indexOther > -1) { // only splice array when item is found
                            balloonPlanes.splice(indexOther, 1); // 2nd parameter means remove one item only
                        }
                    }
                    scene.remove(balloonPlane);
                }

                // Show letter in big at the middle of the screen

                soundWinLetter.play();


                bigLetterShowing = true;

                let plane = bigLetters[letterToFind];

                scene.add(plane);

                setTimeout(() => {
                    scene.remove(plane);
                    bigLetterShowing = false;
                }, "1000");

                randomXPosition = -10;
                randomYPosition = 10;

                // Reorganize next balloon to come

                for(let i = 0; i < balloonPlanes.length; i++){
                    const balloonPlane = balloonPlanes[i];
                    scene.remove(balloonPlane);

                    if(columnCounter == balloonCountPerRow){
                        randomXPosition = -10;
                        columnCounter = 0;
                    }

                    columnCounter += 1;

                    randomXPosition += 4;
                    randomYPosition += 1.5;

                    balloonPlane.position.y = -randomYPosition;
                    balloonPlane.position.x = randomXPosition;

                    scene.add(balloonPlane);
                }

                // Choose a new letter to find

                if(lettersToFind.length >= 1){

                    letterToFind = lettersToFind.shift();

                    const newSoundIconTexture = balloonTextureLoader.load('assets/volume.png');
                    const newSoundIconMaterial = new THREE.MeshBasicMaterial({ map: newSoundIconTexture, transparent: true});

                    soundIconPlane = new THREE.Mesh(soundIconGeometry, newSoundIconMaterial);
                    soundIconPlane.position.x = 0;
                    soundIconPlane.position.y -= 4.5;
                    scene.add(soundIconPlane);

                }else{

                    gameState = "ended";

                    scene.remove(plane);

                    backgroundMusic.stop();

                    soundWinGame.play();

//                    let myText = new SpriteText(`SCORE: ${score}`,0.7);
//                    myText.color = "black";
//                    myText.position.x = 0;
//                    myText.position.y -= 1.5;
//                    scene.add(myText);

                    scene.add(menuBGPlane);
                    scene.add(menuEndPlane);
                    scene.add(menuPlayPlane);
                }


            }else{
                console.log("Does not match");
            }

        }
    }
}

// Add Menu at the top of everything
const menuBGPlaneWidth = 50;  // Width of each plane
const menuBGPlaneHeight = 50;  // Height of each plane
const menuBGGeometry = new THREE.PlaneGeometry(menuBGPlaneWidth, menuBGPlaneHeight);
const menuBGTexture = balloonTextureLoader.load('assets/menu-background.png');
const menuBGMaterial = new THREE.MeshBasicMaterial({ map: menuBGTexture, transparent: true});
const menuBGPlane = new THREE.Mesh(menuBGGeometry, menuBGMaterial);
menuBGPlane.position.x = 0;
menuBGPlane.position.y -= 4.5;

scene.add(menuBGPlane);

// Build image plane with logo
const menuLogoPlaneWidth = 7.6;  // Width of each plane desktop
const menuLogoPlaneHeight = 7.6;  // Height of each plane desktop

const menuLogoGeometry = new THREE.PlaneGeometry(menuLogoPlaneWidth, menuLogoPlaneHeight);
const menuLogoTexture = balloonTextureLoader.load('assets/logo.png');
const menuLogoPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuLogoTexture, transparent: true});
const menuLogoPlane = new THREE.Mesh(menuLogoGeometry, menuLogoPlaneMaterial);


menuLogoPlane.position.y = 1.5;

scene.add(menuLogoPlane);

// Build play Button

const menuPlayPlaneWidth = 4;  // Width of each plane
const menuPlayPlaneHeight = 2;  // Height of each plane

const menuPlayGeometry = new THREE.PlaneGeometry(menuPlayPlaneWidth, menuPlayPlaneHeight);
const menuPlayTexture = balloonTextureLoader.load('assets/play-button.png');
const menuPlayPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuPlayTexture, transparent: true});
const menuPlayPlane = new THREE.Mesh(menuPlayGeometry, menuPlayPlaneMaterial);

menuPlayPlane.position.y = -3;

scene.add(menuPlayPlane);

// Build End menu

const menuEndPlaneWidth = 6;  // Width of each plane
const menuEndPlaneHeight = 3;  // Height of each plane

const menuEndGeometry = new THREE.PlaneGeometry(menuEndPlaneWidth, menuEndPlaneHeight);
const menuEndTexture = balloonTextureLoader.load('assets/menu-end.png');
const menuEndPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuEndTexture, transparent: true});
const menuEndPlane = new THREE.Mesh(menuEndGeometry, menuEndPlaneMaterial);

menuEndPlane.position.y = 1;

// Build Game over menu

const menuGameOverPlaneWidth = 6;  // Width of each plane
const menuGameOverPlaneHeight = 4;  // Height of each plane

const menuGameOverGeometry = new THREE.PlaneGeometry(menuGameOverPlaneWidth, menuGameOverPlaneHeight);
const menuGameOverTexture = balloonTextureLoader.load('assets/game-over.webp');
const menuGameOverPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuGameOverTexture, transparent: true});
const menuGameOverPlane = new THREE.Mesh(menuGameOverGeometry, menuGameOverPlaneMaterial);

menuGameOverPlane.position.y = 1;




// Create a plane geometry
const geometry = new THREE.PlaneGeometry(16, 9); // Aspect ratio of 16:9
// Add event listener for clicks
window.addEventListener('click', onMouseClick);

let shakerCount = 0;
let soundLetterObj;

function shakeLetter(){
    if(letterState == "non-shaking" && bigLetterShowing == false && gameState != "ended"){
        letterState = "shaking";
        soundIconPlane.position.x = 0;
        soundLetterObj = letterSounds[letterToFind];
        soundLetterObj.play();
    }
}

setInterval( function() {
    setTimeout(() => {
        letterState = "non-shaking";
        soundLetterObj.stop();
    }, "1000");
    shakeLetter();
}, 5000);

function animate() {

    if(balloonPlanes.length == 0){

        if(gameState == "running"){
            gameState = "ended";

            scene.add(menuBGPlane);
            scene.add(menuGameOverPlane);
            scene.add(menuPlayPlane);
            let myText = new SpriteText(`SCORE: ${score}`,0.7);
            myText.color = "black";
            myText.position.x = 0;
            myText.position.y -= 1.5;
            scene.add(myText);

        }else if(gameState == "not-started"){
            location.reload();
        }
    }

    for(let i = 0; i < balloonPlanes.length; i++){
        const balloonPlane = balloonPlanes[i];
        balloonPlane.position.y += 0.06;
        if(balloonPlane.position.y >= 9){
            scene.remove(balloonPlane);
            const index = balloonPlanes.indexOf(balloonPlane);
            if (index > -1) { // only splice array when item is found
                balloonPlanes.splice(index, 1); // 2nd parameter means remove one item only
            }
        }
     }

     if(letterState == "shaking"){
        if(soundIconPlane.position.x > -0.2 && soundIconPlane.position.x < 0.2){
            soundIconPlane.position.x += (Math.random() - 0.5) * shakeIntensity;
        }else{
            letterState = "non-shaking";
            soundIconPlane.position.x = 0;
            soundIconPlane.position.y = -4.5;
        }
    }

	renderer.render( scene, camera );
//	requestAnimationFrame(animate);
}
renderer.shadowMap.enabled = false;
renderer.setAnimationLoop( animate );