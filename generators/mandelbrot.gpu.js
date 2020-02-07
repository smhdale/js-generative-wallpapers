const GPU = require('gpu.js')
const converter = require('hsl-to-rgb-for-reals')
const { rand, randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')

const X_MIN = -3
const X_MAX = 1
const Y_MIN = -1.5
const Y_MAX = 1.5
const SCALE_MIN = 5
const SCALE_MAX = 250

const CIRCLE = 360
const DEGREES_MIN = CIRCLE / 4
const DEGREES_MAX = CIRCLE

const RAY_SPEED = 0.01
const RENDER_SCALE = 0.5
const FIDELITY = 180
const BOUND = 4

function toComplexGenerator(canvas, bounds) {
	const { x, y, width, height } = bounds
	const { width: cw, height: ch } = canvas

	return function toComplex() {
		return [
			x + width * (this.thread.x / cw),
			y + height * (this.thread.y / ch)
		]
	}
}

function getEscapeSteps(r, i) {
	let step = 0
	let x = r	// Real component
	let y = i // Imaginary component
	while (x ** 2 + y ** 2 < BOUND && ++step < FIDELITY) {
		let xTmp = x ** 2 - y ** 2 + r
		y = 2 * x * y * i
		x = xTmp
	}
}

function inSet(r, i) {
	return getEscapeSteps(r, i) === FIDELITY
}

function init() {
	// Compute origin
}

module.exports = ctx => {
	// Adjust width and height based on RENDER_SCALE constant
	const canvas = ctx.canvas
	const width = Math.ceil(canvas.width * RENDER_SCALE)
	const height = Math.ceil(canvas.height * RENDER_SCALE)

	// Scale canvas context
	const scaleInv = 1 / RENDER_SCALE
	ctx.scale(scaleInv, scaleInv)

	// Init GPU renderer
	const toComplex = toComplexGenerator(canvas, bounds)
	const gpu = new GPU({ canvas })
	const render = gpu.createKernel()
		.addFunction(toComplex)
		.setGraphical(true)
		.setOutput([width, height])

	// Run render
	render()
}
