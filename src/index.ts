import dirSize from './lib/dir-size';
import { DirStat, ProgressCallback } from './types';

export default (dir: string, callback?: ProgressCallback): Promise<DirStat> => dirSize(dir, callback, 0);
