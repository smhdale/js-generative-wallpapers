const Gradients = require('../data/gradients.json')
const { choose } = require('./helpers')

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

function getRandomPalette() {
	return choose(Gradients)
}

function getRandomDirection() {
	return choose(Object.values(Direction))
}

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
