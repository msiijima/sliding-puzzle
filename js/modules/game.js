'use strict';

import { config } from "../main.js";
import { Background } from "./background.js";
import { Layer } from './layer.js';
import { Piece } from "./piece.js";

/**
 * Game Object.
 *
 * @param id
 */
const Game = function (id) {

  const [backgroundLayer, puzzleLayer, animeLayer] = makeSlidePuzzle(id);

  this.puzzleData;
  this.pieceTotal;

  this.clickEnabled = true;
  this.shuffled = false;
  this.gameEnabled = false;

  this.background = new Background(backgroundLayer);
  this.piece = new Piece(puzzleLayer, animeLayer);

  // Draw the puzzle on canvas.
  this.init().reDraw();

  animeLayer.getCanvas()
    .addEventListener('click',
      e => {
        if (!this.clickEnabled || !this.gameEnabled || this.Shuffled) {
          return;
        }

        // Number of the piece that has been clicked.
        // Null for the blank piece.
        const clickNumber = this.piece.getClickedPieceInfo(e);

        if (clickNumber === null) {
          this.clickEnabled = true;
          return;
        }

        this.click(clickNumber);

        // When puzzle is completed.
        if (this.puzzleData.every((e, i) => (i === this.pieceTotal - 1 && e === null) || (e === i))) {
          this.onComplete();
        }
      }, false
    );

};

Game.prototype = {

  /**
   * Initialisation.
   *
   * Preparing the game.
   *
   * @returns Game object
   */
  init() {
    this.puzzleData = [];
    this.pieceTotal = config.pieceNum * config.pieceNum;

    for (let i = 0; i < this.pieceTotal - 1; i++) {
      this.puzzleData.push(i);
    }

    this.puzzleData[this.pieceTotal - 1] = null;

    this.background.init();
    this.piece.init();
    return this;
  },

  /**
   * Draw background and pieces.
   *
   * @returns Game object
   */
  reDraw() {
    this.background.draw();
    this.puzzleData.forEach((e, i) => {
      this.piece.draw(i, e);
    });
    return this;
  },

  /**
   * When the piece has been clicked.
   *
   * @param clickNumber
   * @returns
   */
  async click(clickNumber) {
    this.clickEnabled = false;

    const adjacents = this.getAdjacentsPiecesInfo(clickNumber);

    if (adjacents === false || adjacents.current === null) {
      this.clickEnabled = true;
      return;
    }

    const blankData = adjacents.data.filter(e => e.number === null);

    if (blankData.length <= 0) {
      this.clickEnabled = true;
      return;
    }

    [this.puzzleData[clickNumber], this.puzzleData[blankData[0].pos]] = [this.puzzleData[blankData[0].pos], this.puzzleData[clickNumber]];

    await this.piece.move(clickNumber, blankData[0].pos, blankData[0].dir, adjacents.current);

    this.clickEnabled = true;
  },

  /**
   * Get adjacent pieces information.
   *
   * @param pos
   * @returns [ { direction, position, number_of_the_piece }, ... ]
   */
  getAdjacentsPiecesInfo(pos) {
    const pInfo = this.getPieceInfo(pos);

    if (pInfo === false) {
      return false;
    }

    const { pieceNum } = { ...config };

    const x = pos % pieceNum, y = Math.floor(pos / pieceNum);

    return {
      current: pInfo,
      data: [
        { dir: "left", pos: pos - 1, number: x <= 0 ? false : this.getPieceInfo(pos - 1) },
        { dir: "right", pos: pos + 1, number: x >= pieceNum - 1 ? false : this.getPieceInfo(pos + 1) },
        { dir: "up", pos: pos - pieceNum, number: y <= 0 ? false : this.getPieceInfo(pos - pieceNum) },
        { dir: "down", pos: pos + pieceNum, number: y >= pieceNum - 1 ? false : this.getPieceInfo(pos + pieceNum) }
      ]
    };
  },

  /**
   * Get piece information.
   *
   * @param pos
   * @returns
   */
  getPieceInfo(pos) {
    if (pos < 0 || pos >= this.pieceTotal) { return false; }
    return this.puzzleData[pos];
  },

  /**
   * Called when you complete the puzzle.
   * Set the game enabled flag to false and show the message.
   */
  onComplete() {
    message.innerText = "You made it !!\nShuffle again to replay.";
    this.gameEnabled = false;
  },

  /**
   * Shuffle the puzzles.
   *
   * @param count : number of piece you want to move.
   * @returns boolean
   */
  async shuffle(count) {
    if (this.shuffled) {
      return false;
    }

    this.shuffled = true;

    let beforePiece = -1;

    const shuffleBtn = document.getElementById("shuffle");
    shuffleBtn.disabled = true;

    message.innerText = 'Shuffling !!';

    for (let i = 0; i < count; i++) {
      // Search for the blank space.
      const blankPiece = this.puzzleData.indexOf(null);

      // Get adjacents info of the blank space.
      const adjacents = this.getAdjacentsPiecesInfo(blankPiece);

      // Get movable piece info.
      const data = adjacents.data.filter(
        e => e.number !== false && e.number !== beforePiece
      );

      // Pick a piece randomly to be moved.
      const targetPiece = data[Math.floor(Math.random() * data.length)];

      beforePiece = targetPiece.number;

      await this.click(targetPiece.pos);
    }

    this.shuffled = false;

    shuffleBtn.disabled = false;


    message.innerText = 'Go !!';

    return true;
  },

  /**
   * Reset the game.
   *
   * @returns boolean
   */
  async reset() {
    if (!this.gameEnabled) {
      return false;
    }

    this.piece.clear();
    this.init().reDraw();
    this.gameEnabled = false;
    message.innerText = 'Shuffle to play !';
  },

};

/**
 * Make layers fro background, puzzle, and animation.
 *
 * @param divId : Element id of where you want to create the canvas
 * @returns [ Layer ]
 */
const makeSlidePuzzle = divId => {

  const parentDiv = document.getElementById(divId);

  if (parentDiv === null) {
    throw new Error(divId + ' does not exist.');
  }

  const viewSize = Math.min(parentDiv.clientWidth, parentDiv.clientHeight);

  const canvasStyle = {
    width: viewSize + 'px', height: viewSize + 'px',
    top: ((parentDiv.clientHeight - viewSize) / 2).toString() + 'px',
    left: ((parentDiv.clientWidth - viewSize) / 2).toString() + 'px'
  };

  return [1, 2, 3].map(
    zindex => {
      const canvas = document.createElement('canvas');
      const layer = new Layer(canvas, zindex);

      layer.setSize(config.canvasSize, config.canvasSize);
      layer.setStyle(canvasStyle);

      parentDiv.appendChild(canvas);

      return layer;
    }
  );

}

export { Game };
