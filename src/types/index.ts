export interface DirStat {
    name: string;
    size: number;
    sizeOwnFiles: number;
    subdirs: DirStat[]
}

export interface DirEntries {
    files: string[];
    dirs: string[];
}

export enum ProgressType {
    Enter = 'ENTER',
    Exit = 'EXIT'
}

export type ProgressCallback = (type: ProgressType, name: string, depth: number, size: number) => void;
