'use strict';
const patternlab = require('@pattern-lab/core');
const ask = require('../ask');
const scaffold = require('../scaffold');
const installEdition = require('../install-edition');
const installStarterkit = require('../install-starterkit');
const replaceConfigPaths = require('../replace-config');
const ora = require('ora');
const path = require('path');
const wrapAsync = require('../utils').wrapAsync;
const writeJsonAsync = require('../utils').writeJsonAsync;

const defaultPatternlabConfig = patternlab.getDefaultConfig();

const init = options =>
	wrapAsync(function*() {
		const sourceDir = 'source';
		const publicDir = 'public';
		const exportDir = 'pattern_exports';
		const answers = options.projectDir ? options : yield ask(options);
		const projectDir = answers.projectDir || './';
		const edition = answers.edition;
		const starterkit = answers.starterkit;

		/**
		 * Process the init routines
		 * 1 Replace config paths
		 * 2. Scaffold the folder structure
		 * 3. If `edition` is present:
		 *    3.1 Install edition
		 *    3.2 Reassign adjustedconfig
		 * 4. If `starterkit` is present install it and copy over the mandatory starterkit files to sourceDir
		 * 5. Save patternlab-config.json in projectDir
		 */
		const spinner = ora(
			`Setting up PatternLab project in ${projectDir}`
		).start();
		let patternlabConfig = replaceConfigPaths(
			defaultPatternlabConfig,
			projectDir,
			sourceDir,
			publicDir,
			exportDir
		); // 1

		yield scaffold(projectDir, sourceDir, publicDir, exportDir); // 2

		if (edition) {
			spinner.text = `⊙ patternlab → Installing edition: ${edition}`;
			const newConf = yield installEdition(edition, patternlabConfig); // 3.1
			patternlabConfig = Object.assign(patternlabConfig, newConf); // 3.2
			spinner.succeed(`⊙ patternlab → Installed edition: ${edition}`);
		}
		if (starterkit) {
			spinner.text = `⊙ patternlab → Installing starterkit ${starterkit}`;
			spinner.start();
			yield installStarterkit(starterkit, patternlabConfig);
			spinner.succeed(`⊙ patternlab → Installed starterkit: ${starterkit}`);
		} // 4
		yield writeJsonAsync(
			path.resolve(projectDir, 'patternlab-config.json'),
			patternlabConfig
		); // 5

		spinner.succeed(
			`⊙ patternlab → Yay ☺. PatternLab Node was successfully initialised in ${projectDir}`
		);
		return true;
	});

module.exports = init;
