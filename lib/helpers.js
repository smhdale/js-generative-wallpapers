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
  choose,
  chooseWeighted,
  flip
}
