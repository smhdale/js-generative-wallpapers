/**
 * Generates a random number between a minimum (inclusive)
 * and a maximum (exclusive).
 *
 * @param {Number} min Minimum value, inclusive.
 * @param {Number} max Maximum value, exclusive.
 * @returns {Number} The random number.
 */
function rand(min, max) {
  return min + Math.random() * (max - min)
}

/**
 * Generates a random integer between a minimum (inclusive)
 * and a maximum (inclusive).
 *
 * @param {Number} min Minimum value, inclusive.
 * @param {Number} max Maximum value, inclusive.
 * @returns {Number} The random integer.
 */
function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

/**
 * Naïve skewed random number generator using a fall-off function.
 * Values closer to 1 are less likely to be generated.
 *
 * @param {Function} [skewFn=x => -(x ** 2) + 1] The function to skew with.
 * @returns {Number} A random number between 0 (inclusive) and 1 (exclusive).
 */
function randSkewed(skewFn = x => -(x ** 2) + 1) {
  return Math.random() * skewFn(Math.random())
}

/**
 * Clamps a value between a minimum and maximum.
 *
 * @param {Number} n The number to clamp.
 * @param {Number} min The minimum value.
 * @param {Number} max The maximum value.
 * @returns {Number} The clamped number.
 */
function clamp(n, min, max) {
  return Math.max(min, Math.min(n, max))
}

/**
 * Randomly chooses an item from an array.
 *
 * @param {*[]} arr The array to pick from.
 * @returns {*} The random array element.
 */
function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Chooses one of a set of values based on their weights.
 *
 * @param {Object[]} arr Options to choose from.
 * @param {*} arr[].value An option's value, returned if chosen.
 * @param {Number} arr[].weight An option's relative weight.
 * @returns {*} The chosen option's value.
 */
function chooseWeighted(arr) {
  const total = arr.reduce((acc, obj) => acc + obj.weight, 0)
  const chance = Math.random()
  let sum = 0
  for (const { weight, value } of arr) {
    sum += weight
    if (sum / total > chance) return value
  }
}

/**
 * Simulates a coin flip.
 *
 * @returns {Boolean} True or false.
 */
function flip() {
  return choose([true, false])
}

module.exports = {
  rand,
  randInt,
  randSkewed,
  clamp,
  choose,
  chooseWeighted,
  flip
}
