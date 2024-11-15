import { toNano, Address } from '@ton/core';
import { Contract4 } from '../wrappers/Contract4';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const contract4 = provider.open(await Contract4.fromInit());

    await contract4.send(
        provider.sender(),
        {
            value: toNano('0.01'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(contract4.address);
    // run methods on `contract4` EQBzIBverzenYwgR5Vqih4Je9--TVTdTWol2_0PD6-nnWuFP

}
