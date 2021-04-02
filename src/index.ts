import { dirSize } from './lib/dir-size';
import { DirStat, ProgressCallback } from './types';

export default dirStat;

function dirStat(dir: string, callback: ProgressCallback): Promise<DirStat> {
    return dirSize(dir, callback, 0);
}
