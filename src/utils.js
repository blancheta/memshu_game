import * as THREE from 'three';

export function shuffleString(word){
    var shuffledWord = '';
    word = word.split('');
    while (word.length > 0) {
      shuffledWord +=  word.splice(word.length * Math.random() << 0, 1);
    }
    return shuffledWord;
}

export function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

export function transformScoreNumberToGameScore(number){
    return number.toString().padStart(4, '0');
}

export function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}


export function removeElement(array, obj){
    const index = array.indexOf(obj);
    if (index !== -1) {
        return array.splice(index, 1); // Removes obj2
    }
}