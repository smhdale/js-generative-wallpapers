const { createCanvas } = require('canvas')
const { choose } = require('../lib/helpers')
const { makeRandomGradient } = require('../lib/gradient')
const draw = require('../lib/draw')

const CELL_SIZE = 128
const LINE_WIDTH = 12

function makeGrid(width, height) {
	const grid = []
	for (let y = 0; y < height; y++) {
		const row = []
		for (let x = 0; x < width; x++) {
			// Choose diagonal direction
			const diag = choose([ 0, 1 ])
			let square = false

			// Determine if there should be a square here
			if (x > 0 && y > 0) {
				const lastRow = grid[y - 1]
				const tl = lastRow[x - 1].diag
				const tr = lastRow[x].diag
				const bl = row[x - 1].diag
				const br = diag
				square = !tl && tr && bl && !br
			}

			// Add cell to row
			row.push({ x, y, diag, square })
		}
		grid.push(row)
	}
	return grid
}

function drawDiagonal(ctx, x, y, dir) {
	// Set coordinates
	let x1 = 0
	let x2 = CELL_SIZE
	let y1 = dir ? 0 : CELL_SIZE
	let y2 = dir ? CELL_SIZE : 0
	// Draw line
	ctx.moveTo(x + x1, y + y1)
	ctx.lineTo(x + x2, y + y2)
	ctx.stroke()
}

function drawSquare(ctx, x, y) {
	ctx.moveTo(x + CELL_SIZE, y)
	ctx.lineTo(x, y - CELL_SIZE)
	ctx.lineTo(x - CELL_SIZE, y)
	ctx.lineTo(x, y + CELL_SIZE)
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

	// Draw maze
	bufferCtx.fillStyle = 'black'
	bufferCtx.strokeStyle = 'black'
	bufferCtx.lineWidth = LINE_WIDTH
	bufferCtx.lineCap = 'square'

	for (const row of grid) {
		for (const cell of row) {
			const x = xStart + cell.x * CELL_SIZE
			const y = yStart + cell.y * CELL_SIZE

			if (cell.square) {
				// Draw square
				drawSquare(bufferCtx, x, y)
			} else {
				// Draw diagonal
				drawDiagonal(bufferCtx, x, y, cell.diag)
			}
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
