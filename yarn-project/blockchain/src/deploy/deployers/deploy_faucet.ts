import { EthAddress } from '@aztec/barretenberg/address';
import { ContractFactory, Signer } from 'ethers';
import { AztecFaucetJson } from '../../abis.js';

export async function deployAztecFaucet(signer: Signer, faucetOperator?: EthAddress) {
  console.log('Deploying AztecFaucet...');
  const faucetLibrary = new ContractFactory(AztecFaucetJson.abi, AztecFaucetJson.bytecode, signer);
  const faucet = await faucetLibrary.deploy();
  console.log(`AztecFaucet contract address: ${faucet.address}.`);

  if (faucetOperator) {
    console.log(`Enabling faucet operator with address ${faucetOperator}`);
    await faucet.updateApprovedOperator(faucetOperator.toString(), true);
  }

  return faucet;
}
