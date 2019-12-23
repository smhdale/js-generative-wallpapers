/**
 * @typedef {Object} CartesianCoordinate
 * @property {Number} x X coordinate.
 * @property {Number} y Y coordinate.
 */

/**
 * @typedef {Object} PolarCoordinate
 * @property {Number} vel Point velocity.
 * @property {Number} dir Point direction in radians.
 */

/**
 * Converts cartesian to polar coordinates.
 *
 * @param {Number} x X coordinate.
 * @param {Number} y Y coordinate.
 * @returns {PolarCoordinate} Converted coordinate.
 */
function toPolar(x, y) {
	const vel = (x ** 2 + y ** 2) ** 0.5
	const dir = Math.atan2(y, x)
	return { vel, dir }
}

/**
 * Converts polar to cartesian coordinates.
 *
 * @param {Number} vel Point velocity.
 * @param {Number} dir Point direction in radians.
 * @returns {CartesianCoordinate} Converted coordinate.
 */
function toCartesian(vel, dir) {
	const x = vel * Math.cos(dir)
	const y = vel * Math.sin(dir)
	return { x, y }
}

/**
 * Calculates the apothem of a regular polygon.
 *
 * @param {Number} sideLength Length of side of polygon.
 * @param {Number} numSides Number of sides of polygon.
 * @returns {Number} The polygon's apothem.
 */
function apothem(sideLength, numSides) {
	return sideLength / (2 * Math.tan(Math.PI / numSides))
}

/**
 * Calculates the distance between two points.
 *
 * @param {Number} x1 P1 x coordinate.
 * @param {Number} y1 P1 y coordinate.
 * @param {Number} x2 P2 x coordinate.
 * @param {Number} y2 P2 y coordinate.
 * @returns {Number} Distance between P1 and P2.
 */
function pointDistance(x1, y1, x2, y2) {
	return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5
}

/**
 * Calculates the direction between two points.
 *
 * @param {Number} x1 P1 x coordinate.
 * @param {Number} y1 P1 y coordinate.
 * @param {Number} x2 P2 x coordinate.
 * @param {Number} y2 P2 y coordinate.
 * @returns {Number} Angle from P2 to P1 in radians.
 */
function pointDirection(x1, y1, x2, y2) {
	return Math.atan2(y2 - y1, x2 - x1)
}

module.exports = {
	toPolar,
	toCartesian,
	apothem,
	pointDistance,
	pointDirection
}
