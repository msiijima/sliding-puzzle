'use strict';

import { config } from "../main.js";

/**
 * Background Object.
 *
 * To set and draw the layer for the puzzle background and frame.
 *
 * @param layer
 */
const Background = function (layer) {

  this.frame = null;
  this.innerFrame = null;
  this.frameColour = "#86E7B8";
  this.frameLineColour = "#93FF96";
  this.bottomPlateColour = "#D0FFB7";

  this.getLayer = () => layer;

};

Background.prototype = {

  /**
   * Initialisation.
   *
   * Setting canvas size, frame size, and inner frame size.
   *
   * @returns Background object
   */
  init() {
    const { canvasSize, frameSize } = { ...config }

    this.frame = [0, 0, canvasSize, canvasSize];
    this.innerFrame = [frameSize, frameSize, canvasSize - frameSize * 2, canvasSize - frameSize * 2];

    return this;
  },

  /**
   * Draw the background and frame.
   */
  draw() {
    this.getLayer().clearRect(this.frame)
      .drawRect(this.frame, this.frameColour, null)
      .drawRect(this.innerFrame, this.bottomPlateColour, this.frameLineColour);
  },

};

export { Background };
