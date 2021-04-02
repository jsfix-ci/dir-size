#!/usr/bin/env node
import chalk from 'chalk';
import program from 'commander';
import prettyBytes from 'pretty-bytes';
import { sortBy } from 'ramda';

import { dirSize } from '../lib/dir-size';
import * as spinner from '../lib/progress';
import { ProgressCallback, ProgressType } from '../types';

const MAX_LOG_DEPTH = 10;

const cmd = program
    .version('1.0.0')
    .description('calculates diskspace per folder')
    .option('-b, --bytes', 'Output in bytes')
    .option('-s, --size', 'Sorts by size', false)
    .parse(process.argv);

const options = cmd.opts();

const args = program.args;
const sort = options.size;
const outputBytes = options.bytes ?? false;

const format = (size: number): string => (outputBytes ? `${size} B` : prettyBytes(size));

if (args.length === 0) {
    console.log('ERROR: missing directory');
    process.exit(1);
}

spinner.start('Reading folders...');

let total = 0;

const callback: ProgressCallback = (type: ProgressType, name: string, depth: number, size: number) => {
    if (depth > MAX_LOG_DEPTH) {
        return;
    }
    total += size;
    switch (type) {
        case ProgressType.Enter:
        case ProgressType.Exit:
            spinner.setText(`${format(total)}: ${name}`);
            break;
    }
};

const dir = args[0];

dirSize(dir, callback)
    .then(output => {
        spinner.stop();

        const subdirs = sort ? sortBy(x => -x.size, output.subdirs) : output.subdirs;

        const longestSubdirName = Math.max(
            5,
            subdirs.reduce((acc, subdir) => Math.max(acc, subdir.name.length), 0)
        );
        const filesPct = ((100 * output.sizeOwnFiles) / output.size).toFixed(1);

        console.log(`${chalk.bold('Total'.padEnd(longestSubdirName))} ${chalk.cyan(format(output.size).padStart(14))}`);
        console.log();
        console.log(
            `${chalk.bold('files'.padEnd(longestSubdirName))} ${chalk.cyan(
                format(output.sizeOwnFiles).padStart(14)
            )} ${filesPct.padStart(5)}%`
        );

        const subdirLines = subdirs.map(subDir => {
            const pct = ((100 * subDir.size) / output.size).toFixed(1);
            return `${chalk.bold(subDir.name.padEnd(longestSubdirName))} ${chalk.cyan(
                format(subDir.size).padStart(14)
            )} ${pct.padStart(5)}%`;
        });
        console.log(subdirLines.join('\n'));
    })
    .catch(err => {
        spinner.stop();
        console.error(err.stack);
        process.exit(1);
    });
