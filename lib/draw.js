const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

const cw = 3840
const ch = 2160

/**
 * Draws generative art defined in callback function to a canvas,
 * then saves to a file and logs the filename.
 *
 * @param {Function} callback Draw callback to execute.
 */
async function draw(callback) {
  // Init canvas
	const canvas = createCanvas(cw, ch)
	const ctx = canvas.getContext('2d')

	// Run drawcode
	await callback(ctx)
  const filename = Date.now() + '.png'

  // Save to file
	const target = path.join(__dirname, '../out', filename)
	const buffer = canvas.toBuffer()
	fs.writeFileSync(target, buffer)

	// Return filename so old files can be cleared
	return filename
}

module.exports = draw
