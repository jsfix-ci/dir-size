import pLimit from 'p-limit';
import { sum } from 'ramda';

import { getDirEntries } from '../lib/get-dir-entries';
import { getFileSize } from '../lib/get-file-size';
import { DirStat, ProgressCallback, ProgressType } from '../types';

export async function dirSize(dir: string, callback?: ProgressCallback, depth = 0): Promise<DirStat> {
    const limit = pLimit(2);
    if (callback) {
        callback({
            type: ProgressType.Enter,
            name: dir,
            depth,
            size: 0
        });
    }

    const entries = await getDirEntries(dir);
    const fileSizes = await Promise.all(entries.files.map(getFileSize));
    const dirStat = await Promise.all(entries.dirs.map(dir => limit(() => dirSize(dir, callback, depth + 1))));

    const totalFileSize = sum(fileSizes);
    const totalDirSize = total(dirStat);
    const totalSize = totalFileSize + totalDirSize;
    const result: DirStat = {
        name: dir,
        size: totalSize,
        sizeOwnFiles: totalFileSize,
        subdirs: dirStat
    };

    if (callback) {
        callback({
            type: ProgressType.Exit,
            name: dir,
            depth,
            size: totalFileSize
        });
    }

    return result;
}

const total = (stats: DirStat[]): number => stats.reduce((acc, stat) => acc + stat.size, 0);
