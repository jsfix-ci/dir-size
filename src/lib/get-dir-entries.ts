import * as fs from 'fs';
import * as path from 'path';
import { pluck, propEq } from 'ramda';
import { promisify } from 'util';
import { getEntryType } from '../lib/get-entry-type';
import { DirEntries } from '../types';

const readDir = promisify(fs.readdir);

export async function getDirEntries(dir: string): Promise<DirEntries> {
    try {
        const dirEntries = await readDir(dir);
        const entriesWithType = await Promise.all(dirEntries.map(async entry => {
            const fullPath = path.join(dir, entry);
            return {
                entry: fullPath,
                type: await getEntryType(fullPath)
            };
        }));
        const files = entriesWithType.filter(propEq('type', 'file'));
        const dirs = entriesWithType.filter(propEq('type', 'dir'));
        return {
            files: pluck('entry', files),
            dirs: pluck('entry', dirs)
        };
    } catch (e) {
        return {
            dirs: [],
            files: []
        };
    }
}
