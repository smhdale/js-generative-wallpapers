const Gradients = require('../data/gradients.json')
const { choose } = require('./helpers')

/**
 * Enum for gradient directions.
 *
 * @readonly
 * @enum {Number[]}
 */
const Direction = {
	left: [0, -1],
	topLeft: [0, 1],
	top: [-1, 1],
	topRight: [2, 1],
	right: [2, -1],
	bottomRight: [2, 3],
	bottom: [-1, 3],
	bottomLeft: [0, 3]
}

/**
 * Picks a random gradient palette from ../data/gradients.json.
 *
 * @returns {Object} The chosen gradient.
 */
function getRandomPalette() {
	return choose(Gradients)
}

/**
 * Picks a random gradient direction from Direction enum.
 *
 * @returns {Number[]} A random direction.
 */
function getRandomDirection() {
	return choose(Object.values(Direction))
}

/**
 * Generates a gradient based on specified palette, dimensions and direction.
 *
 * @param {CanvasRenderingContext2D} ctx Canvas 2D context.
 * @param {Number} width Width of gradient.
 * @param {Number} height Height of gradient.
 * @param {Object} gradient The gradient palette to draw.
 * @param {Number[]} dir Gradient direction from Direction enum.
 * @returns {CanvasGradient} The gradient.
 */
function makeGradient(ctx, width, height, { colors }, dir = Direction.left) {
	// Determine coordinates
	const args = [0, 0, 0, 0]
	dir.forEach((p, i) => p >= 0 && (args[p] = [width, height][i]))

	// Create gradient
	const gradient = ctx.createLinearGradient(...args)
	const step = 1 / (colors.length - 1)
	colors.forEach((c, i) => gradient.addColorStop(i * step, c))
	return gradient
}

/**
 * Generates a gradient, randomly choosing palette and direction.
 *
 * @param {CanvasRenderingContext2D} ctx Canvas 2D context.
 * @param {Number} width Width of gradient.
 * @param {Number} height Height of gradient.
 * @returns {CanvasGradient} The gradient.
 */
function makeRandomGradient(ctx, width, height) {
	const palette = getRandomPalette()
	const dir = getRandomDirection()
	return makeGradient(ctx, width, height, palette, dir)
}

module.exports = {
	Gradients,
	Direction,
	makeGradient,
	getRandomPalette,
	getRandomDirection,
	makeRandomGradient
}
