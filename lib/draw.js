const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

const cw = 3840
const ch = 2160

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

	// Log filename for consumption by shell script
	fs.writeFileSync(target, buffer)
	console.log(filename)
}

module.exports = draw
