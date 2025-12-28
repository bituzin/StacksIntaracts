import { callReadOnlyFunction, stringAsciiCV, cvToValue } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

export async function checkNameAvailable(name: string) {
  const network = new StacksMainnet();
  const result = await callReadOnlyFunction({
    contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
    contractName: 'get-name-01',
    functionName: 'is-username-available',
    functionArgs: [
      stringAsciiCV(name.toLowerCase()),
    ],
    network,
    senderAddress: 'ST000000000000000000002AMW42H',
  });
  if (!result || typeof result.value === 'undefined') {
    throw new Error('Contract did not return a valid value. Check contract deployment and parameters.');
  }
  return cvToValue(result.value);
}
