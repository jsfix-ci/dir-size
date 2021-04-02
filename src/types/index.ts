export interface DirStat {
    name: string;
    size: number;
    sizeOwnFiles: number;
    subdirs: DirStat[];
}

export interface EntryInfo {
    name: string;
    type: 'symlink' | 'file' | 'dir';
    size: number;
}

export interface DirEntries {
    files: EntryInfo[];
    dirs: EntryInfo[];
}

export enum ProgressType {
    Enter = 'ENTER',
    Exit = 'EXIT'
}

export interface ProgressCallbackOptions {
    type: ProgressType;
    name: string;
    depth: number;
    size: number;
}

export type ProgressCallback = (opts: ProgressCallbackOptions) => void;
