function toPolar(x, y) {
	const vel = (x ** 2 + y ** 2) ** 0.5
	const dir = Math.atan2(y, x)
	return { vel, dir }
}

function toCartesian(vel, dir) {
	const x = vel * Math.cos(dir)
	const y = vel * Math.sin(dir)
	return { x, y }
}

function apothem(sideLength, numSides) {
	return sideLength / (2 * Math.tan(Math.PI / numSides))
}

module.exports = {
	toPolar,
	toCartesian,
	apothem
}
