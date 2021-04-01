#!/usr/bin/env node
import chalk from "chalk";
import * as program from "commander";
import * as prettyBytes from "pretty-bytes";
import { sortBy } from "ramda";

import { dirSize } from "../lib/dir-size";
import * as spinner from "../lib/progress";
import { ProgressCallback, ProgressType } from "../types";

const MAX_LOG_DEPTH = 10;

const cmd = program
    .version("1.0.0")
    .description("calculates diskspace per folder")
    .option("--bytes", "Output in bytes")
    .option("-s,--size", "Sorts by size", false)
    .parse(process.argv);

const args = cmd.args;
const sort = cmd.size;
const outputBytes = cmd.bytes ?? false;

const format: (size: number) => string = outputBytes
    ? (size) => `${size} bytes`
    : (size) => prettyBytes(size);

if (args.length === 0) {
    console.log("ERROR: missing directory");
    process.exit(1);
}

spinner.start("Reading folders...");

let total = 0;

const callback: ProgressCallback = (
    type: ProgressType,
    name: string,
    depth: number,
    size: number
) => {
    if (depth > MAX_LOG_DEPTH) {
        return;
    }
    total += size;
    switch (type) {
        case ProgressType.Enter:
            spinner.setText(`${format(total)}: ${name}`);
        case ProgressType.Exit:
            spinner.setText(`${format(total)}: ${name}`);
            break;
    }
};

const dir = args[0];

dirSize(dir, callback)
    .then((output) => {
        spinner.stop();

        console.log(
            `Total: ${chalk.bold(dir)}: ${chalk.cyan(format(output.size))}`
        );
        console.log(
            `${chalk.bold("files")}: ${chalk.cyan(format(output.sizeOwnFiles))}`
        );

        const subdirs = sort
            ? sortBy((x) => -x.size, output.subdirs)
            : output.subdirs;

        subdirs.forEach((subDir) => {
            const pct = ((100 * subDir.size) / output.size).toFixed(1);
            console.log(
                `${chalk.bold(subDir.name)}: ${chalk.cyan(
                    format(subDir.size)
                )} (${pct}%)`
            );
        });
    })
    .catch((err) => {
        spinner.stop();
        console.error(err.stack);
        process.exit(1);
    });
