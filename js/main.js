'use strict';

import { Game } from './modules/game.js';

export const config = {
  canvasSize: 500,
  frameSize: 20,
  pieceNum: 4,
  animationTime: 50,
};

window.addEventListener('DOMContentLoaded', () => {

  // Preparing the game.
  const puzzle = new Game('puzzle');

  // Shuffle event.
  const shuffle = count => {
    return () =>
      puzzle.shuffle(count)
        .then(shuffled => {
          if (shuffled) {
            puzzle.gameEnabled = true;
          }
        });
  };

  // Reset event.
  const reset = () => {
    return () =>
      puzzle.reset();
  }

  // Adding event to buttons.
  const shuffleBtn = document.getElementById("shuffle");
  const resetBtn = document.getElementById("reset");

  shuffleBtn.addEventListener("click", shuffle(50));
  resetBtn.addEventListener("click", reset());
});
