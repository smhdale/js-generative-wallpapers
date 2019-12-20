const { createCanvas } = require('canvas')
const { choose } = require('../lib/helpers')
const { makeRandomGradient } = require('../lib/gradient')
const draw = require('../lib/draw')

const cellSize = 128
const wd = 12

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
	let x2 = cellSize
	let y1 = dir ? 0 : cellSize
	let y2 = dir ? cellSize : 0
	// Draw line
	ctx.moveTo(x + x1, y + y1)
	ctx.lineTo(x + x2, y + y2)
	ctx.stroke()
}

function drawSquare(ctx, x, y) {
	ctx.moveTo(x + cellSize, y)
	ctx.lineTo(x, y - cellSize)
	ctx.lineTo(x - cellSize, y)
	ctx.lineTo(x, y + cellSize)
	ctx.closePath()
	ctx.fill()
}

draw(ctx => {
	const { width, height } = ctx.canvas

	const cols = Math.ceil(width / cellSize)
	const rows = Math.ceil(height / cellSize)
	const grid = makeGrid(cols, rows)

	const mazeWidth = cols * cellSize
	const mazeHeight = rows * cellSize

	const xStart = (width - mazeWidth) / 2
	const yStart = (height - mazeHeight) / 2

	// Create a buffer canvas
	const buffer = createCanvas(width, height)
	const bufferCtx = buffer.getContext('2d')

	// Draw maze
	bufferCtx.fillStyle = 'black'
	bufferCtx.strokeStyle = 'black'
	bufferCtx.lineWidth = wd
	bufferCtx.lineCap = 'square'

	for (const row of grid) {
		for (const cell of row) {
			const x = xStart + cell.x * cellSize
			const y = yStart + cell.y * cellSize

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
