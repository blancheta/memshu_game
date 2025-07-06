import SpriteText from 'three-spritetext';
import * as THREE from 'three';

import {shuffle, removeElement} from './utils';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
window.addEventListener( 'resize', onWindowResize, false );

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

import cards_stack from './fruits.json';

let wait = false;

let column_size = 4;
let row_size = 4;
let total_cards = 8;

let boxPlaneInitXMin = -5;

let boxPlaneInitX = -5;
let boxPlaneInitY = -4.5;

let cards = cards_stack.splice(0, 8);

let scaleFactorVideo = 3.2;

let visitShopButtonX = 0;
let visitShopButtonY = -3;

let exitButtonX = 0;
let exitButtonY = -4.8;

let countdown = 60;

let spaceBetweenCards = 3.5;
let spaceBetweenCardsY = 2.5;

let scaleVisitButton = 1;


let cardScaleX = 3;
let cardScaleY = 2;

const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;
const verySmallScreen = window.matchMedia("(max-width: 430px)").matches;

if (isSmallScreen) {
  console.log("Small screen, likely mobile");
  boxPlaneInitY = -4.2
  boxPlaneInitXMin = -1.9;
  column_size = 2;
  row_size = 4;
  total_cards = 4;
  cards = cards_stack.splice(0, 4);
  scaleFactorVideo = 1.6;

  visitShopButtonX = 0;
  visitShopButtonY = -1.8;

  exitButtonX = 0;
  exitButtonY = -3.8;

  countdown = 15;

  scaleVisitButton = 1.3;

}
if(verySmallScreen){
     boxPlaneInitY = -3;
     boxPlaneInitXMin = -1.3;
     spaceBetweenCards = 2.5;
     cardScaleX = 2.3;
     cardScaleY = 1.53;
     spaceBetweenCardsY = 2;
}

let textureLoader = new THREE.TextureLoader();

let location_href = "https://www.memshu.com/product/animales-en-ingles-para-ninos-juego-cartas?utm-source=game";
let exit_href = "https://www.memshu.com?utm-source=game";


function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

    if(camera.aspect > 1){

    }
}

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const loader = new THREE.TextureLoader();
scene.background = loader.load("assets/sky.jpg");

const cardTextureYellow = textureLoader.load("assets/YELLOW_CARD.jpg");
cardTextureYellow.colorSpace = THREE.SRGBColorSpace;

const cardMaterialYellow = new THREE.MeshBasicMaterial({
    map: cardTextureYellow,
    side: THREE.DoubleSide,
});

const boxTextureBlue = textureLoader.load("assets/BLUE_CARD.jpg");
boxTextureBlue.colorSpace = THREE.SRGBColorSpace;

const cardMaterialBlue = new THREE.MeshBasicMaterial({
    map: boxTextureBlue,
    side: THREE.DoubleSide,
});

const boxGeometry = new THREE.PlaneGeometry(cardScaleX, cardScaleY);
const boxGeometryImage = new THREE.PlaneGeometry(cardScaleX, cardScaleY);

/* Game over menu */

// Get video element
const video = document.getElementById('videostart');
video.play(); // Ensure autoplay works with muted + playsinline

// Create video texture
const videoTexture = new THREE.VideoTexture(video);
videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBFormat;

const material = new THREE.MeshBasicMaterial({ map: videoTexture });

const geometry = new THREE.PlaneGeometry(3.9, 2.25); // Adjust aspect ratio for your video
const plane = new THREE.Mesh(geometry, material);
plane.scale.set(scaleFactorVideo, scaleFactorVideo,scaleFactorVideo);
plane.position.z = 0.007;
plane.position.x = 0 ;
plane.position.y = 2;
scene.add(plane);

// Create video end plane

// Get video element
const videoEnd = document.getElementById('videoend');
// Create video texture
const videoTextureEnd = new THREE.VideoTexture(videoEnd);
videoTextureEnd.minFilter = THREE.LinearFilter;
videoTextureEnd.magFilter = THREE.LinearFilter;
videoTextureEnd.format = THREE.RGBFormat;

const materialEnd = new THREE.MeshBasicMaterial({ map: videoTextureEnd});
const geometryEnd = new THREE.PlaneGeometry(4, 2.25); // Adjust aspect ratio for your video
const planeVideoEnd = new THREE.Mesh(geometryEnd, materialEnd);
planeVideoEnd.scale.set(scaleFactorVideo, scaleFactorVideo, scaleFactorVideo);
planeVideoEnd.position.z = 0.007;
planeVideoEnd.position.y = 2;

const listener = new THREE.AudioListener();

const cardPop = new THREE.Audio(listener);


const audioLoader = new THREE.AudioLoader();

audioLoader.load('sounds/pop.wav', (buffer) => {
    cardPop.setBuffer(buffer);
    cardPop.setVolume(0.5);
});

// WIn sounds

const winSound = new THREE.Audio(listener);
audioLoader.load('sounds/win.wav', (buffer) => {
    winSound.setBuffer(buffer);
    winSound.setVolume(0.5);
});

// Background Music
const backgroundMusic = new THREE.Audio(listener);
const audioBackgroundLoader = new THREE.AudioLoader();
audioBackgroundLoader.load('sounds/Colorful-World.mp3', (buffer) => { // Replace with your music path
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true); // Enable looping for background music
    backgroundMusic.setVolume(0.1); // Set an appropriate volume level
});


// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* Define textures for planes animals */
let cardPlanes = [];

let cardSongs = {};

for(var card of cards){
    let cardSong = new THREE.Audio(listener);

    audioBackgroundLoader.load(`sounds/${card}.ogg`, (buffer) => { // Replace with your music path
        cardSong.setBuffer(buffer);
        cardSong.setVolume(0.4); // Set an appropriate volume level
    });

    cardSongs[card] = cardSong;
}

for(var card of cards){

    /* Build yellow cards */

    var card_name = card;
    console.log(`Yellow card: ${card_name}`);
    const cardTexture = textureLoader.load(`assets/cards/${card_name}.webp`);
    cardTexture.colorSpace = THREE.SRGBColorSpace;

    const cardMaterialImage = new THREE.MeshBasicMaterial({
        map: cardTexture,
        side: THREE.DoubleSide,
    });

   let cardPlaneFaceDown = new THREE.Mesh(boxGeometry, cardMaterialYellow);
   cardPlaneFaceDown.name = card_name;

   let cardPlaneImageFaceUp = new THREE.Mesh(boxGeometryImage, cardMaterialImage);

   cardPlanes.push([cardPlaneFaceDown, cardPlaneImageFaceUp, card_name]);

   console.log(`Blue card: ${card_name}`);

    var card_name = card;

  /* Draw blue cards */

      const cardTextureWord = textureLoader.load(`assets/cards/${card_name}-text.webp`);
    cardTextureWord.colorSpace = THREE.SRGBColorSpace;

 const cardMaterialWord = new THREE.MeshBasicMaterial({
    map: cardTextureWord,
    side: THREE.DoubleSide,
});

   let cardPlaneFaceDownBlue = new THREE.Mesh(boxGeometry, cardMaterialBlue);
   cardPlaneFaceDownBlue.name = card_name;

   let cardPlaneFaceUpBlue = new THREE.Mesh(boxGeometry, cardMaterialWord);
   cardPlaneFaceUpBlue.name = card_name;

   cardPlanes.push([cardPlaneFaceDownBlue, cardPlaneFaceUpBlue, card_name]);

}

cardPlanes = shuffle(cardPlanes);

camera.position.z = 5;

const boxMaterialBlue = new THREE.MeshBasicMaterial({
  map: boxTextureBlue,
  side: THREE.DoubleSide,
});

let card_count = 0;

let boxMaterial = null;

let gameState = "not-started";
//let gameState = "running";



let myText = new SpriteText(countdown,1);
myText.color = "black";
myText.position.x = 0;
myText.position.y = 5;
scene.add(myText);

let exitGame = new SpriteText("exit", 0.5);
exitGame.color = "black";

exitGame.position.x = exitButtonX;
exitGame.position.y = exitButtonY;
exitGame.position.z = 0.002;

var cardMatrix = [];

for(var i=0; i<row_size;i++){

    /* Yellow cards */
    for(var j=0; j< column_size; j++){

        let cardPlaneDown = cardPlanes[card_count][0];
        let cardPlaneUp = cardPlanes[card_count][1];

        card_count += 1;

        if(j == 0){
            boxPlaneInitX = boxPlaneInitXMin;
        }else{
            boxPlaneInitX += spaceBetweenCards;
        }

        cardPlaneDown.position.set(0, 0, 0);
        cardPlaneDown.position.x = boxPlaneInitX;
        cardPlaneDown.position.y = boxPlaneInitY;
        cardPlaneDown.position.z = 0.001; // Slight offset to avoid Z-fighting

        cardPlaneUp.position.set(0, 0, 0);
        cardPlaneUp.position.x = boxPlaneInitX;
        cardPlaneUp.position.y = boxPlaneInitY;

        cardPlaneUp.visible = true;
        cardPlaneDown.visible = true;

        scene.add(cardPlaneUp);
        scene.add(cardPlaneDown);

        cardMatrix.push(cardPlaneDown);

    }

    boxPlaneInitY += spaceBetweenCardsY;

}

let menuBGPlane;
let menuPlayPlane;
let menuGameOverPlane;

function addBackgroundMenu(){

    // Add Menu at the top of everything
    const menuBGPlaneWidth = 50;  // Width of each plane
    const menuBGPlaneHeight = 50;  // Height of each plane
    const menuBGGeometry = new THREE.PlaneGeometry(menuBGPlaneWidth, menuBGPlaneHeight);
    const menuBGTexture = loader.load('assets/menu-background.png');
    const menuBGMaterial = new THREE.MeshBasicMaterial({ map: menuBGTexture, transparent: true});
    menuBGPlane = new THREE.Mesh(menuBGGeometry, menuBGMaterial);
    menuBGPlane.position.x = 0;
    menuBGPlane.position.y -= 4.5;
    menuBGPlane.position.z = 0.001;

    scene.add(menuBGPlane);
}

function addStartButtonMenu(){

    const menuPlayPlaneWidth = 4;  // Width of each plane
    const menuPlayPlaneHeight = 2;  // Height of each plane

    const menuPlayGeometry = new THREE.PlaneGeometry(menuPlayPlaneWidth, menuPlayPlaneHeight);
    const menuPlayTexture = loader.load('assets/play-button.png');
    const menuPlayPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuPlayTexture, transparent: true});
    menuPlayPlane = new THREE.Mesh(menuPlayGeometry, menuPlayPlaneMaterial);

    menuPlayPlane.position.y = -3;
    menuPlayPlane.position.z = 0.001; // Slight offset to avoid Z-fighting

    scene.add(menuPlayPlane);

}

let menuVisitPlane;

function addVisitShopButtonMenu(){

    const menuVisitPlaneWidth = 4;  // Width of each plane
    const menuVisitPlaneHeight = 2;  // Height of each plane

    const menuVisitGeometry = new THREE.PlaneGeometry(menuVisitPlaneWidth, menuVisitPlaneHeight);
    const menuVisitTexture = loader.load('assets/visit_shop.png');
    const menuVisitPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuVisitTexture, transparent: true});
    menuVisitPlane = new THREE.Mesh(menuVisitGeometry, menuVisitPlaneMaterial);

    menuVisitPlane.scale.set(1.3, 1.3, 1.3);

    menuVisitPlane.position.x = visitShopButtonX;
    menuVisitPlane.position.y = visitShopButtonY;
    menuVisitPlane.position.z = 0.001; // Slight offset to avoid Z-fighting

    scene.add(menuVisitPlane);

}

addBackgroundMenu();
addStartButtonMenu();

function findPlanesByName(scene, nameToFind) {
  const matchingPlanes = [];

  scene.traverse((object) => {
    // Check if it's a Mesh and has PlaneGeometry
    if (object.isMesh && object.geometry.type === 'PlaneGeometry') {
      if (object.name === nameToFind) {
        matchingPlanes.push(object);
      }
    }
  });

  return matchingPlanes;
}

let cardCurrentlySelected = [];

let foundPairs = [];

function onMouseClick(event) {

    // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    if(gameState == "not-started"){
        scene.remove(menuBGPlane);
        scene.remove(plane);
        scene.remove(menuPlayPlane);
        gameState = "running";
        backgroundMusic.play();

    }else if(gameState == "gameover" && countdown <= 0){
        const intersectsVisitShop = raycaster.intersectObjects([menuVisitPlane]);
        const intersectsExit = raycaster.intersectObjects([exitGame]);

        if(intersectsVisitShop.length > 0){
            window.location.href = location_href;
        }else if(intersectsExit.length > 0){
           window.location.href = exit_href;
        }
    }else if(gameState == "running"){

     // Balloons clicks
     const intersects = raycaster.intersectObjects(cardMatrix);
     let clickedPlane;

     if (intersects.length > 0) {
        cardPop.play();
        clickedPlane = intersects[0].object;
        console.log(clickedPlane.name);
        let cardS = cardSongs[clickedPlane.name];
        console.log(cardS);
        cardS.play();
        if(clickedPlane.visible == true){
            clickedPlane.visible = false;
            cardCurrentlySelected.push(clickedPlane);
        }else{
            clickedPlane.visible = true;
        }
     }

     if(cardCurrentlySelected.length == 2){

         let firstCard = cardCurrentlySelected[0];
         let secondCard = cardCurrentlySelected[1];

         let has_match = false;

         if(firstCard.name == secondCard.name){

            has_match = true;

            wait = true;

            winSound.play();

            foundPairs.push(firstCard);
            console.log(foundPairs.length);

         }else if(has_match == false){

            setTimeout(() => {
              wait = false;
              firstCard.visible = true;
               secondCard.visible = true;
            }, "1000");

         }

         if(foundPairs.length == total_cards){
            gameState = "gameover";
            addBackgroundMenu()
            addVisitShopButtonMenu();
            scene.add(exitGame);
            videoEnd.play();
            scene.add(planeVideoEnd);
         }

         cardCurrentlySelected = []
     }

  }
}

function displayPlayUnlimited(){
    myText = new SpriteText(countdown,1);
    myText.color = "black";
    myText.position.y = 5;
    scene.add(myText);

}


function updateTimerTexture(countdown) {
    myText = new SpriteText(countdown,1);
    myText.color = "black";
    myText.position.y = 5;
    scene.add(myText);
}

window.addEventListener('click', onMouseClick);

let interval = setInterval(() => {
    if(gameState == "running"){
        countdown--;
        if (countdown < 0) {
//                  addBackgroundMenu();
          clearInterval(interval);

        } else {
          scene.remove(myText);
          updateTimerTexture(countdown);
        }
    }
  }, 1000);


var showMenuOff = false;

function animate() {

    if(countdown == 0 && showMenuOff == false){
       gameState = "gameover";

       console.log("End of the game");
       addBackgroundMenu()
       addVisitShopButtonMenu();
       scene.add(exitGame);
       videoEnd.play();
       scene.add(planeVideoEnd);
       showMenuOff = true;
    }

	renderer.render( scene, camera );
}
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop( animate );

