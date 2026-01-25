import { StacksMainnet, StacksNetwork } from '@stacks/network';
import { callReadOnlyFunction, cvToValue, standardPrincipalCV, stringAsciiCV, ClarityType } from '@stacks/transactions';

export const NAME_CONTRACT_ADDRESS = 'SP2Z3M34KEKC79TMRMZB24YG30FE25JPN83TPZSZ2';
export const NAME_CONTRACT_NAME = 'get-name-003';
const DEFAULT_SENDER = 'ST000000000000000000002AMW42H';
const defaultNetwork = new StacksMainnet();

const resolveNetwork = (network?: StacksNetwork) => network ?? defaultNetwork;

export async function checkNameAvailable(name: string, network?: StacksNetwork) {
  const clarityValue = await callReadOnlyFunction({
    contractAddress: NAME_CONTRACT_ADDRESS,
    contractName: NAME_CONTRACT_NAME,
    functionName: 'is-username-available',
    functionArgs: [
      stringAsciiCV(name.toLowerCase()),
    ],
    network: resolveNetwork(network),
    senderAddress: DEFAULT_SENDER,
  });
  const result = cvToValue(clarityValue);
  if (typeof result !== 'boolean') {
    throw new Error('Unexpected response while checking availability');
  }
  return result;
}

export async function fetchOwnedName(owner: string, network?: StacksNetwork) {
  const clarityValue = await callReadOnlyFunction({
    contractAddress: NAME_CONTRACT_ADDRESS,
    contractName: NAME_CONTRACT_NAME,
    functionName: 'get-address-username',
    functionArgs: [standardPrincipalCV(owner)],
    network: resolveNetwork(network),
    senderAddress: owner || DEFAULT_SENDER,
  });

  if (clarityValue.type === ClarityType.OptionalNone) {
    return null;
  }

  if (clarityValue.type === ClarityType.OptionalSome) {
    const inner = clarityValue.value;
    if (inner.type === ClarityType.StringASCII || inner.type === ClarityType.StringUTF8) {
      return inner.data;
    }
  }

  const value = cvToValue(clarityValue);
  if (value === null) {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    const extracted = (value as any).value ?? (value as any).data;
    if (typeof extracted === 'string') {
      return extracted;
    }
  }
  throw new Error('Unexpected response while reading current username');
}
