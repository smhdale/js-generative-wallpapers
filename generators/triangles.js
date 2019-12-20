const { createCanvas } = require('canvas')
const { makeRandomGradient } = require('../lib/gradient')
const draw = require('../lib/draw')

const CELL_SIZE = 128
const CORNERS = [
	[0, 0],
	[CELL_SIZE, 0],
	[CELL_SIZE, CELL_SIZE],
	[0, CELL_SIZE]
]

function makeGrid(width, height) {
	const grid = []
	for (let y = 0; y < height; y++) {
		const row = []
		for (let x = 0; x < width; x++) {
			// Choose corner and add to row
			const corner = Math.floor(Math.random() * CORNERS.length)
			row.push({ x, y, corner })
		}
		grid.push(row)
	}
	return grid
}

function drawTriangle(ctx, x, y, { corner, alpha }) {
	// Create corners
	const [first, ...rest] = [...CORNERS]
		.filter((_, i) => i !== corner)
		.map(([cx, cy]) => [cx + x, cy + y])

	// Draw triangle
	ctx.beginPath()
	ctx.moveTo(...first)
	for (const cnr of rest) ctx.lineTo(...cnr)
	ctx.closePath()
	ctx.fill()
}

draw(ctx => {
	const { width, height } = ctx.canvas

	const cols = Math.ceil(width / CELL_SIZE)
	const rows = Math.ceil(height / CELL_SIZE)
	const grid = makeGrid(cols, rows)

	const mazeWidth = cols * CELL_SIZE
	const mazeHeight = rows * CELL_SIZE

	const xStart = (width - mazeWidth) / 2
	const yStart = (height - mazeHeight) / 2

	// Create a buffer canvas
	const buffer = createCanvas(width, height)
	const bufferCtx = buffer.getContext('2d')

	// Draw triangles
	bufferCtx.fillStyle = 'black'

	for (const row of grid) {
		for (const cell of row) {
			const x = xStart + cell.x * CELL_SIZE
			const y = yStart + cell.y * CELL_SIZE
			drawTriangle(bufferCtx, x, y, cell)
		}
	}

	bufferCtx.globalCompositeOperation = 'source-in'
	bufferCtx.fillStyle = makeRandomGradient(bufferCtx, width, height)
	bufferCtx.fillRect(0, 0, width, height)

	// Draw buffer canvas onto main canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)
	ctx.drawImage(buffer, 0, 0, width, height, 0, 0, width, height)
})
