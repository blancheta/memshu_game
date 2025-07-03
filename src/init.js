import * as THREE from 'three';

export function createScoreGeometry(){
    let text = "0000";

    let parameters = {
        size: 80,
        depth: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    };

    let geometryText = THREE.TextGeometry( text, parameters );
    return geometryText;
}

export function playLetterPronunciation(letter, listener){
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(`../sounds/${letter}.wav`, (buffer) => {
        sound.setBuffer(buffer);
        sound.setVolume(0.5);
        sound.play();
    });
    return sound;
}