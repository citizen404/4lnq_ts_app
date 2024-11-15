import { toNano, Address } from '@ton/core';
import { Contract4 } from '../wrappers/Contract4';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();
    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Contract4 address'));
    const contract4 = provider.open(await Contract4.fromAddress(address));

    //input parameters
    const withdrawAmount = toNano('0.45');

    await contract4.send(
        provider.sender(),
        {
            value: toNano('0.5')
        },
        'increment'
     //   {
     //       $$type: 'Withdraw',
     //       amount: withdrawAmount
     //   }
    );

    ui.clearActionPrompt();
    ui.write("All done. Check contract!")
}
