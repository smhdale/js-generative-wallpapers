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
 * @param {Object} argv Parsed CLI args from minimist.
 */
async function draw({ name, fn, dev }, argv) {
  // Init canvas
	const canvas = createCanvas(cw, ch)
	const ctx = canvas.getContext('2d')

	// Run drawcode
	await fn(ctx, argv)
	const filename = (dev ? name : Date.now()) + '.png'

	// Choose output directory (and create it if missing)
	const outdir = path.join(__dirname, '..', dev ? 'dev' : 'out')
	if (!fs.existsSync(outdir)) fs.mkdirSync(outdir)

	// Save to file
	const target = path.join(outdir, filename)
	const buffer = canvas.toBuffer()
	fs.writeFileSync(target, buffer)

	// Return filename so old files can be cleared
	return filename
}

module.exports = draw
