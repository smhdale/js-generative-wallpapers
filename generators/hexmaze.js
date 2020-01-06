const { randInt } = require('../lib/helpers')
const { toCartesian } = require('../lib/trig')

const CELL_SIDES = 6
const CELL_ANGLE = 2 * Math.PI / CELL_SIDES
const CELL_RAD = 64
const CELL_SIDE = CELL_RAD * 2 * Math.tan(CELL_ANGLE / 2)

const pickRotation = () => randInt(0, 5) * CELL_ANGLE

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
			const angle = pickRotation()
			grid.push({ x, y, angle })
		}
	}
	return grid
}

function drawHex(ctx, hex) {
	const getVertex = dir => {
		const offset = toCartesian(CELL_SIDE, dir + CELL_ANGLE / 2)
		return [hex.x + offset.x, hex.y + offset.y]
	}

	// Draw hexagon outline
	ctx.beginPath()
	for (let i = 0; i < CELL_SIDES; i++) {
		const vertex = getVertex(i * CELL_ANGLE)
		if (i) ctx.lineTo(...vertex)
		else ctx.moveTo(...vertex)
	}
	ctx.closePath()
	ctx.stroke()
}

module.exports = ctx => {
	// White bg
	const { width, height } = ctx.canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)

	// Set up drawing
	ctx.lineCap = 'round'
	ctx.lineWidth = 10
	ctx.strokeStyle = 'black'

	// Draw hex grid
	const grid = makeGrid(width, height)
	for (const hex of grid) {
		drawHex(ctx, hex)
	}
}
