import { dirSize } from './lib/dir-size';
import { ProgressCallback } from './types';

export = function(dir: string, callback: ProgressCallback) {
    return dirSize(dir, callback, 0);
}
