const { clamp, randInt, randSkewed } = require('../lib/helpers')
const { toCartesian, pointDistance, pointDirection } = require('../lib/trig')

const BALL_COUNT_MIN = 100
const BALL_COUNT_MAX = 150
const BALL_RAD_MIN = 20
const BALL_RAD_MAX = 250
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

module.exports = ctx => {
	const { width, height } = ctx.canvas
	const bounds = {
		top: 0,
		left: 0,
		right: width,
		bottom: height
	}
	const count = randInt(BALL_COUNT_MIN, BALL_COUNT_MAX)

	// Simulate balls for a few steps to space them out
	const sim = new BallSim(count, bounds)
	for (let i = 0; i < SIMULATION_STEPS; i++) {
		sim.step()
	}

	// White background
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)

	// Draw all simulation balls
	ctx.fillStyle = 'black'
	sim.forEach(ball => ball.draw(ctx))
}
