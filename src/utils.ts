import * as liquid from 'liquidjs-lib';
//import * as regtestUtils from './_regtest';
import { ECPair } from './ecc';

export function createPayment(
  _type: string,
  myKeys?: any[],
  network?: any,
  confidential?: boolean,
): any {
  network = network || liquid.networks.regtest;
  const splitType = _type.split('-').reverse();
  const isMultisig = splitType[0].slice(0, 4) === 'p2ms';
  const keys = myKeys || [];
  const blindingKeys: Buffer[] = [];
  let m: number | undefined;
  if (isMultisig) {
    const match = splitType[0].match(/^p2ms\((\d+) of (\d+)\)$/);
    m = parseInt(match![1], 10);
    let n = parseInt(match![2], 10);
    if (keys.length > 0 && keys.length !== n) {
      throw new Error('Need n keys for multisig');
    }
    while (!myKeys && n > 1) {
      keys.push(ECPair.makeRandom({ network }));
      n--;
    }
  }
  if (!myKeys) keys.push(ECPair.makeRandom({ network }));
  if (confidential)
    blindingKeys.push(ECPair.makeRandom({ network }).privateKey!);

  let payment: any;
  splitType.forEach((type) => {
    if (type.slice(0, 4) === 'p2ms') {
      payment = liquid.payments.p2ms({
        m,
        pubkeys: keys.map((key) => key.publicKey).sort(),
        network,
      });
    } else if (['p2sh', 'p2wsh'].indexOf(type) > -1) {
      const blindkey =
        confidential && (type === 'p2sh' || splitType.indexOf('p2sh') < 0)
          ? ECPair.fromPrivateKey(blindingKeys[0]).publicKey
          : undefined;
      payment = (liquid.payments as any)[type]({
        redeem: payment,
        network,
        blindkey,
      });
    } else {
      const blindkey =
        confidential && splitType.length === 1
          ? ECPair.fromPrivateKey(blindingKeys[0]).publicKey
          : undefined;
      payment = (liquid.payments as any)[type]({
        pubkey: keys[0].publicKey,
        network,
        blindkey,
      });
    }
  });

  return {
    payment,
    keys,
    blindingKeys,
  };
}
