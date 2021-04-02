import { lstat } from 'fs-extra';

export const getFileSize = async (file: string): Promise<number> => (await lstat(file)).size;
