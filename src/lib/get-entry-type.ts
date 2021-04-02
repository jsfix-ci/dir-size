import { lstat } from 'fs-extra';

export async function getEntryType(filePath: string): Promise<'symlink' | 'file' | 'dir'> {
    try {
        const stats = await lstat(filePath);

        return stats.isFile() || stats.isSymbolicLink() ? 'file' : 'dir';
    } catch {
        // Probably a symlink with invalid destination
        return 'symlink';
    }
}
