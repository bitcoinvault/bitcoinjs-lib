import { bitcoin as BITCOIN_NETWORK } from '../networks';
import * as bscript from '../script';
import * as vaultar from '../templates/vaultar';
import { Payment, PaymentOpts, Stack, VaultTxType } from './index';
import * as lazy from './lazy';

const OPS = bscript.OPS;
const typef = require('typeforce');
const ecc = require('tiny-secp256k1');

const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1

function stacksEqual(a: Buffer[], b: Buffer[]): boolean {
  if (a.length !== b.length) return false;

  return a.every((x, i) => {
    return x.equals(b[i]);
  });
}

// input: OP_0 signature_1 [signature2] OP_0/0x01
// output: OP_IF 1 OP_ELSE 2 OP_ENDIF pubKey1 pubKey2 2 OP_CHECKMULTISIG
export function p2ar(a: Payment, opts?: PaymentOpts): Payment {
  if (!a.input && !a.output && !a.pubkeys && !a.signatures)
    throw new TypeError('Not enough data');
  if (a.vaultTxType === undefined) a.vaultTxType = VaultTxType.Alert;

  opts = Object.assign({ validate: true }, opts || {});

  function isAcceptableSignature(x: Buffer | number): boolean {
    return (
      bscript.isCanonicalScriptSignature(x as Buffer) ||
      (opts!.allowIncomplete && (x as number) === OPS.OP_0) !== undefined
    );
  }

  typef(
    {
      network: typef.maybe(typef.Object),
      output: typef.maybe(typef.Buffer),
      pubkeys: typef.maybe(typef.arrayOf(ecc.isPoint)),
      signatures: typef.maybe(typef.arrayOf(isAcceptableSignature)),
      input: typef.maybe(typef.Buffer),
      vaultTxType: typef.maybe(typef.Number),
    },
    a,
  );

  const network = a.network || BITCOIN_NETWORK;
  const o: Payment = { network };

  let chunks: Stack = [];
  let decoded = false;
  function decode(output: Buffer | Stack): void {
    if (decoded) return;
    decoded = true;
    chunks = bscript.decompile(output) as Stack;
    o.pubkeys = chunks.slice(5, 7) as Buffer[];
  }

  lazy.prop(o, 'output', () => {
    if (!a.pubkeys) return;
    return bscript.compile(
      ([] as Stack).concat(
        OPS.OP_IF,
        OP_INT_BASE + 1,
        OPS.OP_ELSE,
        OP_INT_BASE + 2,
        OPS.OP_ENDIF,
        a.pubkeys,
        OP_INT_BASE + 2,
        OPS.OP_CHECKMULTISIG,
      ),
    );
  });
  lazy.prop(o, 'm', () => {
    return o.vaultTxType === VaultTxType.Alert ? 1 : 2;
  });
  lazy.prop(o, 'n', () => {
    return 2;
  });
  lazy.prop(o, 'pubkeys', () => {
    if (!a.output) return;
    decode(a.output);
    return o.pubkeys;
  });
  lazy.prop(o, 'signatures', () => {
    if (!a.input) return;
    return bscript.decompile(a.input)!.slice(1, -1);
  });
  lazy.prop(o, 'input', () => {
    if (!a.signatures) return;
    const alertFlag = a.vaultTxType === VaultTxType.Alert ? OPS.OP_1 : OPS.OP_0;
    return bscript.compile(
      ([OPS.OP_0] as Stack).concat(a.signatures).concat([alertFlag] as Stack),
    );
  });
  lazy.prop(o, 'witness', () => {
    if (!o.input) return;
    return [];
  });
  lazy.prop(o, 'name', () => {
    return `p2ar(${VaultTxType[o.vaultTxType as VaultTxType]})`;
  });
  lazy.prop(o, 'vaultTxType', () => {
    o.vaultTxType = a.vaultTxType;
    return o.vaultTxType;
  });

  // extended validation
  if (opts.validate) {
    if (a.output) {
      if (!vaultar.output.check(a.output, opts!.allowIncomplete))
        throw new TypeError('Output is invalid');
      if (a.pubkeys && !stacksEqual(a.pubkeys, o.pubkeys!))
        throw new TypeError('Pubkeys mismatch');
    }

    if (a.pubkeys) {
      if (a.pubkeys.length !== 2)
        throw new TypeError('Pubkey count should be equal 2');
    }

    if (a.vaultTxType) {
      if (!Object.values(VaultTxType).includes(a.vaultTxType))
        throw new TypeError('Unrecognized VaultTxType');
    }

    if (a.signatures) {
      if (
        (a.vaultTxType === VaultTxType.Alert && a.signatures.length !== 1) ||
        (a.vaultTxType === VaultTxType.Recovery && a.signatures.length !== 2)
      )
        throw new TypeError('Not enough or too many signatures provided');
    }

    if (a.input) {
      if (!vaultar.input.check(a.input, opts!.allowIncomplete))
        throw new TypeError('Input is invalid');

      if (
        o.signatures!.length === 0 ||
        !o.signatures!.every(isAcceptableSignature)
      )
        throw new TypeError('Input has invalid signature(s)');

      if (a.signatures && !stacksEqual(a.signatures, o.signatures!))
        throw new TypeError('Signature mismatch');
    }
  }

  return Object.assign(o, a);
}
