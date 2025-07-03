import SpriteText from 'three-spritetext';
import * as THREE from 'three';
import fs from 'fs';

import {shuffle, removeElement} from './utils';


const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 0.1, 100 );
window.addEventListener( 'resize', onWindowResize, false );

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

import cards_stack from './fruits.json';
console.log(cards_stack);

let column_size = 4;
let row_size = 4;

let boxPlaneInitX = -11;
let boxPlaneInitY = -4.5;

let textureLoader = new THREE.TextureLoader();


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

const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

const boxGeometry = new THREE.PlaneGeometry(4, 2.4);

const boxGeometryImage = new THREE.PlaneGeometry(2.2, 1.7);

/* Game over menu */
const menuGameOverPlaneWidth = 6;  // Width of each plane
const menuGameOverPlaneHeight = 4;  // Height of each plane

const menuGameOverGeometry = new THREE.PlaneGeometry(menuGameOverPlaneWidth, menuGameOverPlaneHeight);
const menuGameOverTexture = textureLoader.load('assets/game-over.webp');
const menuGameOverPlaneMaterial = new THREE.MeshBasicMaterial({ map: menuGameOverTexture, transparent: true});
const menuGameOverPlane = new THREE.Mesh(menuGameOverGeometry, menuGameOverPlaneMaterial);

menuGameOverPlane.position.y = 1;
menuGameOverPlane.position.z = 0.001; // Slight offset to avoid Z-fighting


// Raycaster and Mouse
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

/* Define textures for planes animals */
let cardPlanes = [];

const cards = shuffle(cards_stack);

/* Build yellow cards */
for(var card of cards.slice(0, 8)){
    console.log(card[0]);
    var card_name = card[0];
    const cardTexture = textureLoader.load(`assets/${card_name}.png`);
    cardTexture.colorSpace = THREE.SRGBColorSpace;

    const cardMaterialImage = new THREE.MeshBasicMaterial({
        map: cardTexture,
        side: THREE.DoubleSide,
    });

   let cardPlaneFaceDown = new THREE.Mesh(boxGeometry, cardMaterialYellow);
   cardPlaneFaceDown.name = card_name;

   let cardPlaneImageFaceUp = new THREE.Mesh(boxGeometryImage, cardMaterialImage);

   let cardPlaneFaceUp = new THREE.Mesh(boxGeometry, whiteMaterial);
   cardPlaneFaceUp.name = card_name;

   cardPlanes.push([cardPlaneFaceDown, cardPlaneFaceUp, cardPlaneImageFaceUp, card_name]);
}

/* Build blue cards */
for(var card of cards.slice(0, 8)){

    var card_name = card[0];

    const cardTexture = textureLoader.load(`assets/${card}.png`);
    cardTexture.colorSpace = THREE.SRGBColorSpace;

    let myText = new SpriteText(card[0], 0.8);
    myText.color = "black";

   let cardPlaneFaceDown = new THREE.Mesh(boxGeometry, cardMaterialBlue);
   cardPlaneFaceDown.name = card_name;


   let cardPlaneFaceUp = new THREE.Mesh(boxGeometry, whiteMaterial);
   cardPlaneFaceDown.name = card_name;

   cardPlanes.push([cardPlaneFaceDown, cardPlaneFaceUp, myText, card_name]);
}


cardPlanes = shuffle(cardPlanes);

camera.position.z = 5;

const boxMaterialBlue = new THREE.MeshBasicMaterial({
  map: boxTextureBlue,
  side: THREE.DoubleSide,
});

let card_count = 0;

let boxMaterial = null;

var cardMatrix = [];

for(var i=0; i<row_size;i++){

    /* Yellow cards */
    for(var j=0; j< column_size; j++){

        let cardPlaneDown = cardPlanes[card_count][0];
        let cardPlaneUp = cardPlanes[card_count][1];
        let cardImagePlaneUp = cardPlanes[card_count][2];

        card_count += 1;

        if(j == 0){
            boxPlaneInitX = -7;
        }else{
            boxPlaneInitX += 4.5;
        }

        cardPlaneDown.position.set(0, 0, 0);
        cardPlaneDown.position.x = boxPlaneInitX;
        cardPlaneDown.position.y = boxPlaneInitY;
        cardPlaneDown.position.z = 0.001; // Slight offset to avoid Z-fighting

        cardPlaneUp.position.set(0, 0, 0);
        cardPlaneUp.position.x = boxPlaneInitX;
        cardPlaneUp.position.y = boxPlaneInitY;


        cardImagePlaneUp.position.set(0, 0, 0);
        cardImagePlaneUp.position.x = boxPlaneInitX;
        cardImagePlaneUp.position.y = boxPlaneInitY;

        cardPlaneUp.visible = true;
        cardImagePlaneUp.visible = true;
        cardPlaneDown.visible = true;

        scene.add(cardPlaneUp);
        scene.add(cardImagePlaneUp);
        scene.add(cardPlaneDown);

        /* cardMatrix[card_name] = "hidden"; */
        console.log(cardPlanes[card_count]);

        cardMatrix.push(cardPlaneDown);

    }

    boxPlaneInitY += 3;

}

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
    console.log("click!!!");

    if(cardCurrentlySelected.length == 2){
        return
    }

      // Convert mouse position to normalized device coordinates (-1 to +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

     // Balloons clicks
     const intersects = raycaster.intersectObjects(cardMatrix);
     let clickedPlane;

     if (intersects.length > 0) {
        clickedPlane = intersects[0].object;
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
            console.log("Match");

            foundPairs.push(firstCard);
            foundPairs.push(secondCard);

         }else if(has_match == false){

            console.log("Pas match");

            setTimeout(() => {
              console.log("Delayed for 1 second.");
              firstCard.visible = true;
               secondCard.visible = true;
            }, "1000");

         }

         cardCurrentlySelected = []

         if(foundPairs.length == 16){
            scene.add(menuGameOverPlane);
         }
     }
}

window.addEventListener('click', onMouseClick);


function animate() {
	renderer.render( scene, camera );
}
renderer.shadowMap.enabled = true;
renderer.setAnimationLoop( animate );

