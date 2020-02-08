const { GPU } = require('gpu.js')
const converter = require('hsl-to-rgb-for-reals')
const { rand, randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')

const X_MIN = -3
const X_MAX = 1
const Y_MIN = -1.5
const Y_MAX = 1.5
const ZOOM_MIN = 50
const ZOOM_MAX = 1000
const CIRCLE = 360

const RAY_SPEED = 0.01
const RENDER_SCALE = 0.5
const FIDELITY = 1000

function escapeSteps(r, i, fidelity) {
	const BOUND = 4

	let x = r
	let y = i

	for (let step = 0; step < fidelity; step++) {
		let xsq = Math.pow(x, 2)
		let ysq = Math.pow(y, 2)

		// Return early if we have passed the bound
		if (xsq + ysq > BOUND) return step

		// Otherwise iterate
		y = 2 * x * y + i
		x = xsq - ysq + r
	}
	
	return fidelity
}

function inSet(r, i, fidelity) {
	return escapeSteps(r, i, fidelity) === fidelity
}

function initOrigin() {
	// Pick an origin point in the set
	let ox = 0
	let oy = 0
	do {
		ox = rand(X_MIN, X_MAX)
		oy = rand(Y_MIN, Y_MAX)
	} while (!inSet(ox, oy, FIDELITY))

	// Move along a ray until we escape the set
	const dir = rand(0, 2 * Math.PI)
	const delta = toCartesian(RAY_SPEED, dir)
	do {
		ox += delta.x
		oy += delta.y
	} while (inSet(ox, oy, FIDELITY))

	return [ox, oy]
}

function initBounds(width, height, origin, zoom) {
	const [ox, oy] = origin
	const wHalf = (X_MAX - X_MIN) / (2 * zoom)
	const hHalf = height / width * wHalf
	return {
		x: ox - wHalf,
		y: oy - hHalf,
		width: wHalf * 2,
		height: hHalf * 2
	}
}

const easeOutExp = x => x === 1 ? 1 : 1 - Math.pow(2, x * -10)

function initPalette(fidelity) {
	const hueRange = CIRCLE
	const hueOffset = randInt(0, CIRCLE)
	return Array
		.from({ length: fidelity })
		.map((_, index) => {
			const hue = hueOffset + easeOutExp(index / fidelity) * hueRange
			const [r, g, b] = converter(hue % CIRCLE, 1, 0.5)
			return `rgb(${r},${g},${b})`
		})
		.concat(['black'])
}

module.exports = ctx => {
	// Adjust width and height based on RENDER_SCALE constant
	const canvas = ctx.canvas
	const width = Math.ceil(canvas.width * RENDER_SCALE)
	const height = Math.ceil(canvas.height * RENDER_SCALE)

	// Scale canvas context
	const scaleInv = 1 / RENDER_SCALE
	ctx.scale(scaleInv, scaleInv)

	// Choose origin point and zoom scale, then init bounds
	const origin = initOrigin()
	const zoom = rand(ZOOM_MIN, ZOOM_MAX)
	const bounds = initBounds(width, height, origin, zoom)
	const palette = initPalette(FIDELITY)

	// Init GPU
	const gpu = new GPU()
		.addFunction(
			escapeSteps,
			{
				argumentTypes: { r: 'Number', i: 'Number', fidelity: 'Number' },
				returnType: 'Number'
			}
		)

	const compute = gpu
		.createKernel(function () {
			// Destructure required values
			const { x, y } = this.thread
			const { cw, ch, bx, by, bw, bh, fidelity } = this.constants

			// Convert pixel coord to complex number
			const r = bx + bw * (x / cw)
			const i = by + bh * (y / ch)

			// Return escape steps for this coordinate
			return escapeSteps(r, i, fidelity)
		})
		.setConstants({
			cw: width,
			ch: height,
			bx: bounds.x,
			by: bounds.y,
			bw: bounds.width,
			bh: bounds.height,
			fidelity: FIDELITY
		})
		.setLoopMaxIterations(FIDELITY)
		.setOutput([width, height])

	// Compute on GPU then draw to canvas
	const result = compute()
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			ctx.fillStyle = palette[result[y][x]]
			ctx.fillRect(x, y, 1, 1)
		}
	}
}