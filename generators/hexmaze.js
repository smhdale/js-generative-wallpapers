const { createCanvas } = require('canvas')
const { randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')
const { makeRandomGradient } = require('../lib/gradient')

const LINE_WIDTH = 32
const CELL_SIDES = 6
const CELL_ANGLE = 2 * Math.PI / CELL_SIDES
const CELL_RAD = 160
const CELL_SIDE = CELL_RAD * 2 * Math.tan(CELL_ANGLE / 2)

// Determines how edges connect to each other
const CELL_LINES = [
	[0, 1],
	[2, 5],
	[3, 4]
]

function makeGrid(width, height) {
	const cw = CELL_RAD * 2
	const ch = CELL_SIDE * 1.5

	// Determine number of rows and columns in grid
	const cols = Math.ceil(width / cw)
	const rows = Math.ceil(height / ch)

	// Determine x and y origin of grid
	const ox = (width - cw * (cols - 1)) / 2
	const oy = (height - ch * (rows - 1)) / 2

	// Create and return grid
	const grid = []
	for (let cy = 0; cy < rows; cy++) {
		// Every second row has one extra column
		// and starts offset from the x origin
		const rowCols = cy % 2 ? cols : cols + 1
		const rowOx = cy % 2 ? ox : ox - CELL_RAD

		// Generate row
		for (let cx = 0; cx < rowCols; cx++) {
			const x = rowOx + cx * cw
			const y = oy + cy * ch
			const angle = randInt(0, 5) * CELL_ANGLE
			grid.push({ x, y, angle })
		}
	}
	return grid
}

/**
 * Draws a hexagonal maze tile.
 *
 * @param {CanvasRenderingContext2D} ctx Context to draw to.
 * @param {Object} hex Hexagon positional data to draw.
 */
function drawHex(ctx, hex) {
	const getPoint = angle => {
		const offset = toCartesian(CELL_RAD, angle + hex.angle)
		return [hex.x + offset.x, hex.y + offset.y]
	}

	// Draw hexagon tile
	for (const line of CELL_LINES) {
		const [a, b] = line.map(dir => getPoint(dir * CELL_ANGLE))
		ctx.beginPath()
		ctx.moveTo(...a)
		ctx.lineTo(...b)
		ctx.stroke()
	}
}

module.exports = ctx => {
	// White background
	const { width, height } = ctx.canvas

	// Create buffer canvas
	const buffer = createCanvas(width, height)
	const bufferCtx = buffer.getContext('2d')
	bufferCtx.lineCap = 'round'
	bufferCtx.lineWidth = LINE_WIDTH
	bufferCtx.strokeStyle = 'black'

	// Generate grid and draw maze
	const grid = makeGrid(width, height)
	for (const hex of grid) drawHex(bufferCtx, hex)

	// Draw gradient over buffer canvas
	bufferCtx.globalCompositeOperation = 'source-in'
	bufferCtx.fillStyle = makeRandomGradient(bufferCtx, width, height)
	bufferCtx.fillRect(0, 0, width, height)

	// Draw buffer canvas to main canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)
	ctx.drawImage(buffer, 0, 0, width, height, 0, 0, width, height)
}
