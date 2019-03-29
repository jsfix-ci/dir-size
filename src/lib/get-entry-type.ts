import { stat as fsStat } from 'fs';
import { promisify } from 'util';

const stat = promisify(fsStat);

export async function getEntryType(fullPath: string): Promise<'symlink' | 'file' | 'dir'> {
    return stat(fullPath)
        .then(stat => {
            if (stat.isSymbolicLink()) {
                return 'symlink';
            }
            return stat.isFile() ? 'file' : 'dir';
        })
        .catch(err => {
            // Probably a symlink with invalid destination
            return 'symlink' as 'symlink';
        });
}
