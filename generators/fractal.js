const { createCanvas } = require('canvas')
const { rand, randInt, choose, chooseWeighted } = require('../lib/helpers')
const { toCartesian, apothem } = require('../lib/trig')
const { makeRandomGradient } = require('../lib/gradient')
const draw = require('../lib/draw')

const PI = Math.PI
const CIRCLE = 2 * PI

const SIDE_PCT_MIN = 1 / 5
const SIDE_PCT_MAX = 1 / 3
const SIZE_MOD_MIN = 2
const SIZE_MOD_MAX = 5
const DEPTH = 6
const EDGE_PAD = 600
const LINE_BASE = 128

const pickNumSides = () => choose([3, 5, 6, 7, 8])
const pickOutline = () => chooseWeighted([
	{ value: false, weight: 5 },
	{ value: true, weight: 1 }
])

class Cursor {
	constructor(x, y, dir) {
		this.x = x
		this.y = y
		this.dir = dir
	}

	get position() {
		return [this.x, this.y].map(n => Number(n.toFixed(2)))
	}

	rotate(dir) {
		this.dir += dir
		if (this.dir > CIRCLE) this.dir %= CIRCLE
		else if (this.dir < 0) this.dir += CIRCLE
	}

	move(vel) {
		const { x, y } = toCartesian(vel, this.dir)
		this.x += x
		this.y += y
	}

	clone() {
		return new Cursor(this.x, this.y, this.dir)
	}
}

class Fractal {
	constructor(ctx, sides, sidePct = 1 / 3, depth = DEPTH, outline = false) {
		this.ctx = ctx
		this.sides = sides
		this.angle = CIRCLE / sides
		this.sidePct = sidePct
		this.depth = depth
		this.outline = outline
	}

	draw(x, y, size, dir = PI, depth = 0) {
		// Side length of shape
		const sideLen = size * this.sidePct

		// Move backwards from initial direction to first coordinate
		const offsetLen = (size - sideLen) / 2
		const offset = toCartesian(-offsetLen, dir)
		const cursor = new Cursor(x + offset.x, y + offset.y, dir)

		// Map vertices of shape
		const points = []
		this.ctx.beginPath()
		for (let i = 0; i < this.sides; i++) {
			// Draw shape edge
			if (i === 0) this.ctx.moveTo(...cursor.position)
			else this.ctx.lineTo(...cursor.position)

			// Create subcursor for next shape, ignoring "bottom" side
			if (depth === 0 || i < this.sides - 1) {
				// Slight position adjustment for cleaner looking fractals
				const subCursor = cursor.clone()
				if (this.outline) {
					subCursor.rotate(this.angle - PI)
				} else {
					subCursor.rotate(-PI)
					subCursor.move(1)
					subCursor.rotate(this.angle)
				}
				points.push(subCursor)
			}

			// Move cursor to next vertex
			cursor.rotate(this.angle)
			cursor.move(sideLen)
		}

		// Fill or stroke shape
		this.ctx.closePath()
		if (this.outline) {
			this.ctx.lineWidth = LINE_BASE / 2 ** depth
			this.ctx.stroke()
		}
		else this.ctx.fill()

		// Recursively call self
		if (depth < this.depth) {
			for (const point of points) {
				this.draw(point.x, point.y, sideLen, point.dir, depth + 1)
			}
		}
	}
}

draw(ctx => {
	const { width, height } = ctx.canvas

	// Create a buffer canvas
	const buffer = createCanvas(width, height)
	const bufferCtx = buffer.getContext('2d')

	// Create fractal
	const outline = pickOutline()
	const numSides = pickNumSides()
	const sidePct = rand(SIDE_PCT_MIN, SIDE_PCT_MAX)
	const fractal = new Fractal(bufferCtx, numSides, sidePct, DEPTH, outline)

	// Compute properties
	const sizeMod = rand(SIZE_MOD_MIN, SIZE_MOD_MAX)
	const containerSideLength = height * sizeMod
	const shapeSideLength = containerSideLength * sidePct
	const shapeRad = apothem(shapeSideLength, numSides)

	// Normalise shape size
	const sizePenalty = shapeSideLength / (shapeRad * 2)
	const actualSize = containerSideLength * sizePenalty

	const x = rand(EDGE_PAD, width - EDGE_PAD) - actualSize / 2
	const y = rand(EDGE_PAD, height - EDGE_PAD) + shapeRad

	// Draw fractal
	if (outline) {
		bufferCtx.strokeStyle = 'black'
	} else {
		bufferCtx.fillStyle = 'black'
	}
	fractal.draw(x, y, containerSideLength * sizePenalty)

	bufferCtx.globalCompositeOperation = 'source-in'
	bufferCtx.fillStyle = makeRandomGradient(bufferCtx, width, height)
	bufferCtx.fillRect(0, 0, width, height)

	// Draw buffer canvas onto main canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)
	ctx.drawImage(buffer, 0, 0, width, height, 0, 0, width, height)
})
