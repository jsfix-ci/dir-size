import { stat } from 'fs-extra';

export async function getFileSize(file: string): Promise<number> {
    return (await stat(file)).size;
}
