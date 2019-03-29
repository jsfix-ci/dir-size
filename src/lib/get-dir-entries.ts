import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { getEntryType } from '../lib/get-entry-type';
import { DirEntries } from '../types';

const readDir = promisify(fs.readdir);

export async function getDirEntries(dir: string): Promise<DirEntries> {
    const dirEntries = await readDir(dir);
    const entriesWithType = await Promise.all(dirEntries.map(async entry => {
        const fullPath = path.join(dir, entry);
        return {
            entry: fullPath,
            type: await getEntryType(fullPath)
        };
    }));
    const files = entriesWithType.filter(entry => entry.type === 'file');
    const dirs = entriesWithType.filter(entry => entry.type === 'dir');
    return {
        files: files.map(f => f.entry),
        dirs: dirs.map(d => d.entry)
    };
}
