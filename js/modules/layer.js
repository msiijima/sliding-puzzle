'use strict';

/**
 * Layer Object.
 *
 * To create a layer for a canvas.
 *
 * @param canvas
 * @param zindex
 */

const Layer = function (canvas, zindex) {

  const context = canvas.getContext('2d');

  let beforeIndex = zindex;

  this.getCanvas = () => canvas;
  this.getContext = () => context;

  this.setIndex = index => {
    beforeIndex = canvas.style.zIndex;
    canvas.style.zIndex = index;
  }

  this.resetIndex = () => canvas.style.zindex = beforeIndex;

};

Layer.prototype = {

  /**
   * Set layer style.
   *
   *  @param styleObj e.g : { width, top, left }
   */
  setStyle(styleObj) {
    const canvas = this.getCanvas();
    Object.keys(styleObj).forEach(e => canvas.style[e] = styleObj[e]);
  },

  /**
   * Set layer's width and height
   *
   * @param w : width
   * @param h : height
   */
  setSize(w, h) {
    const canvas = this.getCanvas();
    canvas.setAttribute('width', w);
    canvas.setAttribute('height', h);
  },

  /**
   * Draw rectangle on a canvas.
   *
   * @param rect e.g : { x, y, width, height}
   * @param fillColour
   * @param strokeColour
   * @returns Layer object
   */
  drawRect(rect, fillColour = null, strokeColour = null) {
    const context = this.getContext();
    context.save();

    if (fillColour !== null) {
      context.fillStyle = fillColour;
      context.fillRect(...rect);
    }

    if (strokeColour !== null) {
      context.strokeStyle = strokeColour;
      context.strokeRect(...rect);
    }

    context.restore();

    return this;
  },

  /**
   * Put text on a canvas
   *
   * @param styleObj
   * @param textStr
   * @param x
   * @param y
   * @returns Layer object
   */
  text(styleObj, textStr, x, y) {
    const context = this.getContext();
    context.save();

    Object.keys(styleObj).forEach(e => context[e] = styleObj[e]);

    context.strokeText(textStr, x, y);
    context.fillText(textStr, x, y);
    context.restore();

    return this;
  },

  /**
   * Get image on the canvas.
   *
   * @param rect
   * @returns Image data
   */
  getImageData(rect) {
    return this.getContext().getImageData(...rect);
  },

  /**
   * Put image on canvas.
   *
   * @param image
   * @param x
   * @param y
   * @returns Image data
   */
  putImageData(image, x, y) {
    this.getContext().putImageData(image, x, y);
    return this;
  },

  /**
   * Clear canvas.
   */
  clear() {
    const canvas = this.getCanvas();
    this.getContext().clearRect(0, 0, canvas.width, canvas.height);
  },

  /**
   * Clear the canvas.
   *
   * @param rect
   * @returns Layer object
   */
  clearRect(rect) {
    this.getContext().clearRect(...rect);
    return this;
  },

  /**
   * Get scales of the browser.
   *
   * @returns scales
   */
  getScale() {
    const canvas = this.getCanvas();
    return canvas.clientWidth / canvas.width;
  },

};

export { Layer };
