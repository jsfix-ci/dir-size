import { default as ora } from "ora";

const spinner = ora();

export const start = (text?: string) => spinner.start(text);
export const stop = () => spinner.stop();
export const setText = (text: string) => {
    spinner.text = text;
    spinner.render();
};
