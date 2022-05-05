'use strict';

import { config } from "../main.js";

/**
 * Piece Object
 *
 * @param {*} layer
 * @param {*} animeLayer
 */
const Piece = function (layer, animeLayer) {
  this.puzzleSize;
  this.pieceSize;
  this.pieceTotal;
  this.pieceData;
  this.pieceImage;
  this.pieceFillColour = "#F2F5DE";
  this.pieceStrokeColour = "dimgray";

  this.textStyle = {
    fillStyle: "black",
    strokeStyle: "white",
    textAlign: "center",
    textBaseline: "middle",
    lineWidth: 4,
    font: "20px 'arial'",
  };

  this.getLayer = () => layer;
  this.getAnimeLayer = () => animeLayer;
}

Piece.prototype = {

  /**
   * Initialisation.
   *
   * Set every piece information.
   */
  init() {
    const layer = this.getLayer();
    layer.setIndex(0);

    const { canvasSize, frameSize, pieceNum, animationTime } = { ...config };
    const topLeftPos = frameSize;

    this.clear();

    this.puzzleSize = canvasSize - frameSize * 2;

    const pieceSize = Math.round(this.puzzleSize / pieceNum);

    this.pieceSize = pieceSize;
    this.pieceTotal = pieceNum * pieceNum;

    const pieceHalfSize = Math.round(pieceSize / 2);
    const pieceRect = [0, 0, pieceSize, pieceSize];

    this.pieceData = [];
    this.pieceImage = [];

    for (let i = 0; i < pieceNum; i++) {
      const topPos = topLeftPos + i * pieceSize;

      for (let j = 0; j < pieceNum; j++) {
        const leftPos = topLeftPos + j * pieceSize;

        layer.clearRect(pieceRect)
          .drawRect(pieceRect, this.pieceFillColour, this.pieceStrokeColour)
          .text(this.textStyle, (i * 4 + j + 1).toString(), pieceHalfSize, pieceHalfSize);

        // Store position.
        this.pieceData.push({
          topLeftPos: [leftPos, topPos],
          rect: [leftPos, topPos, pieceSize, pieceSize]
        });

        // Store image.
        this.pieceImage.push(layer.getImageData(pieceRect));
      }
    }

    layer.clearRect([0, 0, canvasSize, canvasSize]);

    layer.resetIndex();
  },

  /**
   * Draw piece on canvas.
   *
   * @param piecePos
   * @param pieceNumber
   * @param animation
   * @returns
   */
  draw(piecePos, pieceNumber, animation = false) {
    if (pieceNumber === null) return;

    if (piecePos > this.pieceTotal - 1 || pieceNumber >= this.pieceTotal - 1) {
      throw new Error("piecePos Max Over");
    }

    const piecePosData = this.pieceData[piecePos];
    const pieceImageData = this.pieceImage[pieceNumber];

    const posX = piecePosData.topLeftPos[0];
    const posY = piecePosData.topLeftPos[1];

    ((animation) ? this.getAnimeLayer() : this.getLayer()).clearRect(piecePosData.rect).putImageData(pieceImageData, posX, posY);
  },

  /**
   * Clear pieces on the canvas.
   */
  clear() {
    this.getLayer().clearRect([0, 0, config.canvasSize, config.canvasSize]);
  },

  /**
   * Get information of the piece that has been clicked.
   *
   * @param e
   * @returns position of the piece that has been clicked.
   */
  getClickedPieceInfo(e) {
    const pieceSize = this.pieceSize;
    const { frameSize, pieceNum } = { ...config };

    const rect = e.target.getBoundingClientRect();
    const scale = this.getLayer().getScale();

    let x = (e.clientX - rect.left) * scale;
    let y = (e.clientY - rect.top) * scale;

    if (x >= this.puzzleSize || y >= this.puzzleSize) return null;

    x -= frameSize;
    y -= frameSize;

    return Math.floor(x / pieceSize) + Math.floor(y / pieceSize) * pieceNum;
  },

  /**
   * Move the piece onto specific position.
   *
   * @param fromPiece
   * @param toPiece
   * @param dir
   * @param pieceNumber
   * @returns
   */
  move(fromPiece, toPiece, dir, pieceNumber) {
    const layer = this.getLayer();
    const fromData = this.pieceData[fromPiece];

    // Decide the direction.
    const dirY = { 'up': -1, 'down': 1 };
    const dirX = { 'left': -1, 'right': 1 };
    const moveX = dir in dirX ? dirX[dir] : 0;
    const moveY = dir in dirY ? dirY[dir] : 0;

    // Move the piece.
    this.draw(fromPiece, pieceNumber, true);

    // Clear the piece that has been replaced.
    layer.clearRect(fromData.rect);

    return new Promise((resolve, reject) => {

      const animationTime = config.animationTime;

      const animeLayer = this.getAnimeLayer();
      const animeStyle = animeLayer.getCanvas().style;
      animeStyle.top = animeStyle.left = 0;

      const scale = animeLayer.getScale();
      const pieceSize = Math.floor(this.pieceSize / scale);

      let animationStartTime = null;

      const animate = time => {

        if (animationStartTime === null) {
          animationStartTime = time;
          window.requestAnimationFrame(animate);
          return;
        }

        const currentTime = time - animationStartTime;

        if (currentTime >= animationTime) {
          this.draw(toPiece, pieceNumber);
          animeLayer.clear();
          animeStyle.top = animeStyle.left = 0;
          resolve(true);
          return;
        }

        const step = currentTime / animationTime;

        // Calculate the distance.
        const cX = Math.floor(moveX * step * pieceSize);
        const cY = Math.floor(moveY * step * pieceSize);

        animeStyle.left = cX + "px";
        animeStyle.top = cY + "px";

        window.requestAnimationFrame(animate);

      };

      window.requestAnimationFrame(animate);

    });

  },

}

export { Piece };
