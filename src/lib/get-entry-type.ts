import { lstat } from 'fs-extra';

import { EntryInfo } from '../types';

export async function getEntryType(filePath: string): Promise<EntryInfo> {
    try {
        const stats = await lstat(filePath);

        const type = stats.isFile() || stats.isSymbolicLink() ? 'file' : 'dir';
        const size = type === 'file' ? stats.size : 0;
        return { name: filePath, type, size };
    } catch {
        // Probably a symlink with invalid destination
        return {
            name: filePath,
            type: 'symlink',
            size: 0
        };
    }
}
