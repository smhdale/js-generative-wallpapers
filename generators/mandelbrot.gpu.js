const { GPU } = require('gpu.js')
const converter = require('hsl-to-rgb-for-reals')
const { rand, randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')

const X_MIN = -3
const X_MAX = 1
const Y_MIN = -1.5
const Y_MAX = 1.5
const ZOOM_MIN = 5
const ZOOM_MAX = 750

const CIRCLE = 360
const DEGREES_MIN = CIRCLE / 4
const DEGREES_MAX = CIRCLE

const RAY_SPEED = 0.01
const RENDER_SCALE = 0.5
const COLOR_EXP = 10
const FIDELITY = 2000

/**
 * Calculates how many steps a complex number must take
 * before overflowing the bound of the Mandelbrot set.
 *
 * @param {number} r Real component of the complex number.
 * @param {number} i Imaginary component of the complex number.
 * @param {number} fidelity How many iterations to perform before giving up.
 * @returns {number} Steps taken before exiting or giving up.
 */
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

/**
 * Approximates whether a complex number belongs to the Mandelbrot set.
 *
 * @param {number} r Real component of the complex number.
 * @param {number} i Imaginary component of the complex number.
 * @param {number} fidelity How many iterations to perform before giving up.
 * @returns {boolean} True if the number is probably in the set.
 */
function inSet(r, i, fidelity) {
	return escapeSteps(r, i, fidelity) === fidelity
}

/**
 * Starts at a number probably in the Mandelbrot set and follows a straight
 * line until a point not in the set is found. Returns that point.
 *
 * @returns {number[]} Complex number not in the Mandelbrot set.
 */
function pickOrigin() {
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

/**
 * Computes viewport bounds based on canvas width & height, origin point
 * and zoom level, to use to convert canvas coordinates to viewport coordinates.
 *
 * @param {number} width Canvas width in pixels.
 * @param {number} height Canvas height in pixels.
 * @param {number} origin Complex number representing center of view.
 * @param {number} zoom Zoom level.
 * @returns {object} Viewport bounds.
 */
function setBounds(width, height, origin, zoom) {
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

/**
 * Normalised exponential easing function.
 *
 * @param {number} x Input value between 0 and 1.
 * @returns {number} Output value between 0 and 1 following exponential curve.
 */
const easeOutExp = x => x === 1 ? 1 : 1 - Math.pow(2, x * -COLOR_EXP)

/**
 * Creates a color palette of a given length to use for color-coding
 * escape step values computed for canvas pixels.
 *
 * @param {number} length Number of color stops to generate.
 * @param {string} [setColor=black] Color to use for numbers in the Mandelbrot set.
 * @returns {string[]} Array of CSS color values.
 */
function createPalette(length, setColor = 'black') {
	const hueRange = randInt(DEGREES_MIN, DEGREES_MAX)
	const hueOffset = randInt(0, CIRCLE)
	return Array
		.from({ length })
		.map((_, index) => {
			const hue = hueOffset + easeOutExp(index / length) * hueRange
			const [r, g, b] = converter(hue % CIRCLE, 1, 0.5)
			return `rgb(${r},${g},${b})`
		})
		.concat([setColor])
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
	const origin = pickOrigin()
	const zoom = rand(ZOOM_MIN, ZOOM_MAX)
	const bounds = setBounds(width, height, origin, zoom)

	// Use these bounds to draw the entire set.
	// const bounds = { x: -3, y: -1.5, width: 5.333, height: 3 }

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
			// Convert pixel coord to complex number
			const xpct = this.thread.x / this.constants.cw
			const ypct = this.thread.y / this.constants.ch
			const r = this.constants.bx + this.constants.bw * xpct
			const i = this.constants.by + this.constants.bh * ypct

			// Return escape steps for this coordinate
			return escapeSteps(r, i, this.constants.fidelity)
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

	// Compute on GPU
	const result = compute()

	// Find min and mode escape steps
	const { min, mode } = result.reduce(
		(acc, row) => {
			// Min
			acc.min = Math.min(acc.min, ...row)
			// Mode
			for (const elem of row) {
				const count = (acc.counts.get(elem) || 0) + 1
				acc.counts.set(elem, count)
				if (count > acc.highest) {
					acc.highest = count
					acc.mode = elem
				}
			}
			return acc
		},
		{
			min: FIDELITY,
			counts: new Map(),
			highest: 0,
			mode: 0
		}
	)

	// Generate palette
	const palette = createPalette(FIDELITY - min)

	// Use mode to draw most frequent color as background
	ctx.fillStyle = palette[mode - min]
	ctx.fillRect(0, 0, width, height)

	// Draw all other colors to canvas
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const steps = result[y][x]
			if (steps === mode) continue
			ctx.fillStyle = palette[steps - min]
			ctx.fillRect(x, y, 1, 1)
		}
	}
}
