#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2))
const { readdirSync, existsSync, unlink } = require('fs')
const { resolve } = require('path')
const { choose } = require('./lib/helpers')
const draw = require('./lib/draw')

// Choice of generators to run
const GENERATORS = [
	'maze',
	'triangles',
	'circles',
	'fractal',
	'hexmaze',
	'balls',
	'mandelbrot'
]

const outdir = (...args) => resolve(__dirname, 'out', ...args)
const unlinkAsync = path => new Promise(r => unlink(path, r))

/**
 * Deletes all PNG files from the output directory,
 * except a file matching a given name.
 *
 * @param {String} fileToIgnore A file to not delete.
 * @returns {Promise} Resolves after all files have been deleted.
 */
function cleanExcept(fileToIgnore) {
	const files = readdirSync(outdir())
	const removals = files
		.filter(f => f.endsWith('.png') && f !== fileToIgnore)
		.map(f => unlinkAsync(outdir(f)))
	return Promise.all(removals)
}

/**
 * Pulls generator from process args, or otherwise randomly chooses one.
 */
function pickGenerator() {
	const specified = argv._[0]
	const name = specified || choose(GENERATORS)
	const dev = Boolean(specified)
	const path = resolve(__dirname, `generators/${name}.js`)

	// Check generator exists
	if (existsSync(path)) return { name, fn: require(path), dev }

	// Generator not found
	console.log(`Couldn't find the "${name}" generator.`)
	process.exit(0)
}

/**
 * Generates a background, removing all old backgrounds.
 */
async function generate() {
	// Generate new background and remove old ones
	const generator = pickGenerator()
	const file = await draw(generator, argv)
	if (!generator.dev) await cleanExcept(file)
}

// Run generator when script is called
generate()
