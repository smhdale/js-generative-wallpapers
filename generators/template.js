// Your generator should export a single function
// that receives a 2D canvas context to draw on.
module.exports = ctx => {
	// Example: fill the canvas with a white background
	const { width, height } = ctx.canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)

	// Your draw code goes here ...
}
