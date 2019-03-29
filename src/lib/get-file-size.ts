import * as fs from 'fs';
import { promisify } from 'util';

const stat = promisify(fs.stat);

export async function getFileSize(file: string) {
    return stat(file)
        .then(stat => stat.size);
}
