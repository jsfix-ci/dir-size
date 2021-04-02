import { stat } from 'fs-extra';

export async function getEntryType(filePath: string): Promise<'symlink' | 'file' | 'dir'> {
    try {
        const stats = await stat(filePath);

        if (stats.isSymbolicLink()) {
            return 'symlink';
        }
        return stats.isFile() ? 'file' : 'dir';
    } catch {
        // Probably a symlink with invalid destination
        return 'symlink' as const;
    }
}
