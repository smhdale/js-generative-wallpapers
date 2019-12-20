const { createCanvas } = require('canvas')
const { randInt } = require('../lib/helpers')
const { makeRandomGradient } = require('../lib/gradient')
const draw = require('../lib/draw')

const RAD_MIN = 20
const RAD_MAX = 600
const THICKNESS_MIN = 2
const THICKNESS_PCT_MAX = 0.3
const NUM_CIRCLES_MIN = 50
const NUM_CIRCLES_MAX = 100
const EDGE_PAD = -400

function drawCircle(ctx) {
	const { width, height } = ctx.canvas
	const radiusOuter = randInt(RAD_MIN, RAD_MAX)
	const thicknessMax = Math.max(THICKNESS_MIN, radiusOuter * THICKNESS_PCT_MAX)
	const thickness = randInt(THICKNESS_MIN, thicknessMax)
	const x = randInt(radiusOuter + EDGE_PAD, width - radiusOuter - EDGE_PAD)
	const y = randInt(radiusOuter + EDGE_PAD, height - radiusOuter - EDGE_PAD)

	// Determine actual radius
	const radius = radiusOuter - thickness / 2

	// Draw the circle
	ctx.lineWidth = thickness
	ctx.beginPath()
	ctx.arc(x, y, radius, 0, 2 * Math.PI)
	ctx.stroke()
}

draw(ctx => {
	const { width, height } = ctx.canvas

	// Create a buffer canvas
	const buffer = createCanvas(width, height)
	const bufferCtx = buffer.getContext('2d')

	// Draw circles
	bufferCtx.strokeStyle = 'black'
	const numCircles = randInt(NUM_CIRCLES_MIN, NUM_CIRCLES_MAX)
	for (let i = 0; i < numCircles; i++) drawCircle(bufferCtx)

	bufferCtx.globalCompositeOperation = 'source-in'
	bufferCtx.fillStyle = makeRandomGradient(bufferCtx, width, height)
	bufferCtx.fillRect(0, 0, width, height)

	// Draw buffer canvas onto main canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)
	ctx.drawImage(buffer, 0, 0, width, height, 0, 0, width, height)
})
