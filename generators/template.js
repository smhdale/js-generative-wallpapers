// Import the draw function
const draw = require('../lib/draw')

// The draw callback function receives a 2D canvas context.
// Draw to this context using regular canvas methods!
draw(ctx => {
	// Example: fill the canvas with a white background
	const { width, height } = ctx.canvas
	ctx.fillStyle = 'white'
	ctx.fillRect(0, 0, width, height)

	// Your draw code goes here ...
})
