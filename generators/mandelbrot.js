const converter = require('hsl-to-rgb-for-reals')
const { rand, randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')

const X_MIN = -3
const X_MAX = 1
const Y_MIN = -1.5
const Y_MAX = 1.5
const SCALE_MIN = 5
const SCALE_MAX = 250

const FIDELITY = 120
const RAY_SPEED = 0.01

const CIRCLE = 360
const DEGREES_MIN = CIRCLE / 4
const DEGREES_MAX = CIRCLE

const RENDER_SCALE = 0.5

class Mandelbrot {
	constructor(width, height, fidelity) {
		this.width = width
		this.height = height
		this.fidelity = fidelity
		this.scale = rand(SCALE_MIN, SCALE_MAX)

		this.setOrigin()
		this.setBounds()
		this.setPalette()
	}

	setOrigin() {
		// Choose a starting point in the Mandelbrot set
		this.origin = [0, 0]
		do {
			this.origin[0] = rand(X_MIN, X_MAX)
			this.origin[1] = rand(Y_MIN, Y_MAX)
		} while (!this.inSet(this.origin))

		// Move along a ray out until we're no longer in the set
		const dir = rand(0, 2 * Math.PI)
		const delta = toCartesian(RAY_SPEED, dir)
		do {
			this.origin[0] += delta.x
			this.origin[1] += delta.y
		} while (this.inSet(this.origin))
	}

	setBounds() {
		const [ox, oy] = this.origin
		const wHalf = (X_MAX - X_MIN) / (2 * this.scale)
		const hHalf = this.height / this.width * wHalf
		this.bounds = {
			x: [ox - wHalf, ox + wHalf],
			y: [oy - hHalf, oy + hHalf]
		}
	}

	setPalette() {
		const length = this.fidelity
		const hueRange = randInt(DEGREES_MIN, DEGREES_MAX)
		const hueOffset = randInt(0, CIRCLE)
		this.palette = Array
			.from({ length })
			.map((_, index) => {
				const hue = (hueOffset + index / length * hueRange) % CIRCLE
				const [r, g, b] = converter(hue, 1, 0.5)
				return `rgb(${r},${g},${b})`
			})
			.concat(['black'])
	}

	getEscapeSteps(complex) {
		let [x0, y0] = [...complex]
		let [x, y] = [...complex]
		let step = 0

		while (x ** 2 + y ** 2 < Mandelbrot.BOUND && ++step < this.fidelity) {
			[x, y] = [x ** 2 - y ** 2 + x0, 2 * x * y + y0]
		}

		return step
	}

	inSet(complex) {
		return this.getEscapeSteps(complex) === this.fidelity
	}

	toComplex(x, y) {
		const [xMin, xMax] = this.bounds.x
		const [yMin, yMax] = this.bounds.y
		return [
			xMin + (xMax - xMin) * (x / this.width),
			yMin + (yMax - yMin) * (y / this.height)
		]
	}

	colourAt(x, y) {
		const complex = this.toComplex(x, y)
		const steps = this.getEscapeSteps(complex)
		return this.palette[steps]
	}

	drawTo(ctx) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				ctx.fillStyle = this.colourAt(x, y)
				ctx.fillRect(x, y, 1, 1)
			}
		}
	}

	static get BOUND() {
		return 4
	}
}

module.exports = (ctx) => {
	// Draw at half resolution for speed
	const { width: origWidth, height: origHeight } = ctx.canvas
	const width = Math.ceil(origWidth * RENDER_SCALE)
	const height = Math.ceil(origHeight * RENDER_SCALE)
	const scaleInv = 1 / RENDER_SCALE
	ctx.scale(scaleInv, scaleInv)

	const fractal = new Mandelbrot(width, height, FIDELITY)
	fractal.drawTo(ctx)
}
