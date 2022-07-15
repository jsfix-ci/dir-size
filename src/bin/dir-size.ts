#!/usr/bin/env node
import chalk from 'chalk';
import { program } from 'commander';
import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import prettyBytes from 'pretty-bytes';
import { ascend, prop, sort } from 'ramda';

import dirSize from '..';
import { ProgressCallback, ProgressType } from '../types';

const MAX_LOG_DEPTH = 10;

const pkg = fs.readJsonSync(path.resolve(__dirname, '..', '..', 'package.json'));

const cmd = program
    .version(pkg.version)
    .description(pkg.description)
    .option('-b, --bytes', 'Output in bytes')
    .option('-s, --size', 'Sorts by size', false)
    .parse(process.argv);

const options = cmd.opts();

const args = program.args;
const sortBySize = options.size;
const outputBytes = options.bytes ?? false;

const spinner = ora();
spinner.start('Reading folders...');
main().catch(err => {
    spinner.stop();
    console.error(err);
    process.exit(1);
});

async function main(): Promise<void> {
    const format = (size: number): string => (outputBytes ? `${size} B` : prettyBytes(size));

    const dir = args[0] ?? process.cwd();

    let total = 0;

    const callback: ProgressCallback = ({ type, name, depth, size }) => {
        const relName = path.relative(dir, name);
        if (depth > MAX_LOG_DEPTH) {
            return;
        }
        total += size;
        switch (type) {
            case ProgressType.Enter:
            case ProgressType.Exit:
                spinner.text = `${format(total)}: ${relName}`;
                break;
        }
    };

    const output = await dirSize(dir, callback);

    spinner.stop();

    const subdirs = sortBySize ? sort(ascend(prop('size')), output.subdirs) : output.subdirs;

    const longestSubdirName = Math.max(
        5,
        subdirs.reduce((acc, subdir) => Math.max(acc, path.relative(dir, subdir.name).length), 0)
    );
    const filesPct = ((100 * output.sizeOwnFiles) / output.size).toFixed(1);

    console.log(`${chalk.bold('Total'.padEnd(longestSubdirName))} ${chalk.cyan(format(output.size).padStart(14))}`);
    console.log();
    console.log(
        `${chalk.gray('<files>'.padEnd(longestSubdirName))} ${chalk.cyan(
            format(output.sizeOwnFiles).padStart(14)
        )} ${filesPct.padStart(5)}%`
    );

    const subdirLines = subdirs.map(subDir => {
        const pct = ((100 * subDir.size) / output.size).toFixed(1);
        return `${chalk.bold(path.relative(dir, subDir.name).padEnd(longestSubdirName))} ${chalk.cyan(
            format(subDir.size).padStart(14)
        )} ${pct.padStart(5)}%`;
    });
    console.log(subdirLines.join('\n'));
}
