import { callReadOnlyFunction, stringAsciiCV, cvToValue } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

export async function checkNameAvailable(name: string) {
  const network = new StacksMainnet();
  const result = await callReadOnlyFunction({
    contractAddress: 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2',
    contractName: 'get-name-02',
    functionName: 'is-username-available',
    functionArgs: [
      stringAsciiCV(name.toLowerCase()),
    ],
    network,
    senderAddress: 'ST000000000000000000002AMW42H',
  });
  // Obsługa obu formatów odpowiedzi: ClarityValue i hex
  if (result && typeof result.value !== 'undefined') {
    return cvToValue(result.value);
  }
  if (result && typeof result.result === 'string') {
    return result.result === '0x01';
  }
  throw new Error('Contract did not return a valid value. Check contract deployment and parameters.');
}
