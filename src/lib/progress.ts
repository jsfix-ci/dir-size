import { default as ora } from 'ora';

const spinner = ora();

export const start = (text?: string): ora.Ora => spinner.start(text);
export const stop = (): ora.Ora => spinner.stop();
export const setText = (text: string): ora.Ora => {
    spinner.text = text;
    spinner.render();
    return spinner;
};
