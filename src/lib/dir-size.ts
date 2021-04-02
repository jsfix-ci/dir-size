import os from 'os';
import pLimit from 'p-limit';
import { pluck, sum } from 'ramda';

import { getDirEntries } from '../lib/get-dir-entries';
import { DirStat, ProgressCallback, ProgressType } from '../types';

const cpuCount = os.cpus().length;
const limit = pLimit(cpuCount);

export default async function dirSize(dir: string, callback?: ProgressCallback, depth = 0): Promise<DirStat> {
    // Limit concurrent calls dependent on the depth
    const one = pLimit(Math.max(1, Math.pow(2, 5 - depth)));

    if (callback) {
        callback({
            type: ProgressType.Enter,
            name: dir,
            depth,
            size: 0
        });
    }

    // Get directory entries (including file sizes)
    const entries = await limit(() => getDirEntries(dir));

    const fileSizes = pluck('size', entries.files);

    // Recursive calls to subdirectories
    const subdirs = await Promise.all(entries.dirs.map(dir => one(() => dirSize(dir.name, callback, depth + 1))));

    const sizeOwnFiles = sum(fileSizes);
    const totalDirSize = total(subdirs);
    const size = sizeOwnFiles + totalDirSize;
    const result: DirStat = {
        name: dir,
        size,
        sizeOwnFiles,
        subdirs
    };

    if (callback) {
        callback({
            type: ProgressType.Exit,
            name: dir,
            depth,
            size: sizeOwnFiles
        });
    }

    return result;
}

const total = (stats: DirStat[]): number => stats.reduce((acc, stat) => acc + stat.size, 0);
