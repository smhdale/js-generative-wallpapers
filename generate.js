#!/usr/bin/env node

const { readdirSync, unlink } = require('fs')
const { resolve } = require('path')
const { choose } = require('./lib/helpers')
const draw = require('./lib/draw')

// Choice of generators to run
const GENERATORS = [
	'maze',
	'triangles',
	'circles',
	'fractal'
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
 * Generates a background, removing all old backgrounds.
 */
async function generate() {
	// Pick a generator
	const generatorName = choose(GENERATORS)
	const generator = require(`./generators/${generatorName}`)

	// Generate file
	const file = await draw(generator)

	// Remove old generated files
	await cleanExcept(file)
}

// Run generator when script is called
generate()
