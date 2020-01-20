const { createCanvas } = require('canvas')
const { makeRandomGradient } = require('../lib/gradient')
const { clamp, randInt, randSkewed } = require('../lib/helpers')
const { toCartesian, pointDistance, pointDirection } = require('../lib/trig')

const BALL_COUNT_MIN = 150
const BALL_COUNT_MAX = 200
const BALL_RAD_MIN = 50
const BALL_RAD_MAX = 400
const SIMULATION_STEPS = 50

class Ball {
	constructor(x, y, rad, bounds) {
		this.x = x
		this.y = y
		this.rad = rad
		this.bounds = bounds
	}

	get arc() {
		return [this.x, this.y, this.rad, 0, 2 * Math.PI]
	}

	push(vel, dir) {
		const { x, y } = toCartesian(vel, dir)
		this.x = clamp(this.x + x, this.bounds.left, this.bounds.right)
		this.y = clamp(this.y + y, this.bounds.top, this.bounds.bottom)
	}

	getOverlap(ball) {
		const distance = pointDistance(this.x, this.y, ball.x, ball.y)
		return Math.max(0, this.rad + ball.rad - distance)
	}

	repel(ball, vel) {
		const dir = pointDirection(this.x, this.y, ball.x, ball.y)
		ball.push(vel, dir)
		this.push(-vel, dir)
	}

	draw(ctx, colour) {
		if (colour) ctx.fillStyle = colour
		ctx.beginPath()
		ctx.arc(...this.arc)
		ctx.fill()
	}
}

class BallSim {
	constructor(count, bounds) {
		this.balls = []
		for (let i = 0; i < count; i++) {
			const rad = BallSim.generateRadius()
			const x = randInt(bounds.left + rad, bounds.right - rad)
			const y = randInt(bounds.top + rad, bounds.bottom - rad)
			this.balls.push(new Ball(x, y, rad, bounds))
		}
	}

	forEach(callback) {
		for (const ball of this.balls) callback(ball)
	}

	step() {
		this.forEach(ball => {
			// Find all overlapping balls
			for (const other of this.balls) {
				const overlap = ball.getOverlap(other)
				if (overlap) ball.repel(other, overlap / 2)
			}
		})
	}

	static generateRadius() {
		return BALL_RAD_MIN + randSkewed() * (BALL_RAD_MAX - BALL_RAD_MIN + 1)
	}
}

class GradientBuffer {
	constructor(width, height) {
		this.canvas = createCanvas(width, height)
		this.ctx = this.canvas.getContext('2d')
		this.ctx.fillStyle = makeRandomGradient(this.ctx, width, height)
		this.ctx.fillRect(0, 0, width, height)
	}

	sample(x, y) {
		const { data: [r, g, b] } = this.ctx.getImageData(x, y, 1, 1)
		return `rgb(${r},${g},${b})`
	}
}

module.exports = (ctx, { dark }) => {
	const { width, height } = ctx.canvas
	const bounds = {
		top: 0,
		left: 0,
		right: width,
		bottom: height
	}
	const count = randInt(BALL_COUNT_MIN, BALL_COUNT_MAX)

	// Fill canvas with background colour
	ctx.fillStyle = dark ? '#464646' : 'white'
	ctx.fillRect(0, 0, width, height)

	// Simulate balls for a few steps to space them out
	const sim = new BallSim(count, bounds)
	for (let i = 0; i < SIMULATION_STEPS; i++) sim.step()

	// Create gradient buffer canvas for sampling purposes
	const gradient = new GradientBuffer(width, height)

	// Draw balls onto main canvas, sampling colours from gradient buffer
	sim.forEach(ball => {
		const { x, y } = ball
		const samplePoint = [clamp(x, 0, width - 1), clamp(y, 0, height - 1)]
		ctx.fillStyle = gradient.sample(...samplePoint)
		ball.draw(ctx)
	})
}
