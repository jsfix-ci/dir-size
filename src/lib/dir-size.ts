import pLimit from 'p-limit';
import { getDirEntries } from '../lib/get-dir-entries';
import { getFileSize } from '../lib/get-file-size';
import { sum } from '../lib/sum';
import { DirStat, ProgressCallback, ProgressType } from '../types';

export async function dirSize(dir: string, callback?: ProgressCallback, depth = 0): Promise<DirStat> {
    const limit = pLimit(2);
    if (callback) {
        callback(ProgressType.Enter, dir, depth, 0);
    }

    const entries = await getDirEntries(dir);
    const fileSizes = Promise.all(entries.files.map(getFileSize));
    const dirStat = Promise.all(entries.dirs.map(
        dir => limit(() => dirSize(dir, callback, depth + 1))
    ));

    const totalFileSize = sum(await fileSizes);
    const totalDirSize = total(await dirStat);
    const totalSize = totalFileSize + totalDirSize;
    const result: DirStat = {
        name: dir,
        size: totalSize,
        sizeOwnFiles: totalFileSize,
        subdirs: await dirStat
    };

    if (callback) {
        callback(ProgressType.Exit, dir, depth, totalFileSize);
    }

    return result;
}

export function total(stats: DirStat[]) {
    const sizes = stats.map(stat => stat.size);
    return sum(sizes);
}
