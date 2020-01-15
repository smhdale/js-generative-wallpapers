// Your generator should export a single function
// that receives a 2D canvas context to draw on
// and CLI arguments parsed with minimist.
module.exports = (ctx, argv) => {
	// Example: fill the canvas with a white or grey background
	// depending on if a '--dark' flag was passed
	const { width, height } = ctx.canvas
	const { dark } = argv
	ctx.fillStyle = dark ? '#464646' : 'white'
	ctx.fillRect(0, 0, width, height)

	// Your draw code goes here ...
}
