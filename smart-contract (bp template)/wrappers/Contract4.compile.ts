import { CompilerConfig } from '@ton/blueprint';

export const compile: CompilerConfig = {
    lang: 'tact',
    target: 'contracts/contract4.tact',
    options: {
        debug: true,
    },
};
