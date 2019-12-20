function rand(min, max) {
  return min + Math.random() * (max - min)
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function choose(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function flip() {
  return choose([true, false])
}

function chooseWeighted(arr) {
  const total = arr.reduce((acc, obj) => acc + obj.weight, 0)
  const chance = Math.random()
  let sum = 0
  for (const { weight, value } of arr) {
    sum += weight
    if (sum / total > chance) return value
  }
}

function arrayOf(length, cb) {
  return Array.from({ length }, (_, i) => cb(i))
}

module.exports = {
  rand,
  randInt,
  choose,
  flip,
  chooseWeighted,
  arrayOf
}
