'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const networks_1 = require('../networks');
const bscript = require('../script');
const vaultair = require('../templates/vaultair');
const index_1 = require('./index');
const lazy = require('./lazy');
const OPS = bscript.OPS;
const typef = require('typeforce');
const ecc = require('tiny-secp256k1');
const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1
function stacksEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((x, i) => {
    return x.equals(b[i]);
  });
}
// input: OP_0 signature_1 [signature2, signature3] [OP_0/0x01] OP_0/0x01
// output: OP_IF 1 OP_ELSE OP_IF 2 OP_ELSE 3 OP_ENDIF OP_ENDIF pubKey1 pubKey2 pubKey3 3 OP_CHECKMULTISIG
function p2air(a, opts) {
  if (!a.input && !a.output && !a.pubkeys && !a.signatures)
    throw new TypeError('Not enough data');
  if (a.vaultTxType === undefined) a.vaultTxType = index_1.VaultTxType.Alert;
  opts = Object.assign({ validate: true }, opts || {});
  function isAcceptableSignature(x) {
    return (
      bscript.isCanonicalScriptSignature(x) ||
      (opts.allowIncomplete && x === OPS.OP_0) !== undefined
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
  const network = a.network || networks_1.bitcoin;
  const o = { network };
  let chunks = [];
  let decoded = false;
  function decode(output) {
    if (decoded) return;
    decoded = true;
    chunks = bscript.decompile(output);
    o.pubkeys = chunks.slice(9, 12);
  }
  lazy.prop(o, 'output', () => {
    if (!a.pubkeys) return;
    return bscript.compile(
      [].concat(
        OPS.OP_IF,
        OP_INT_BASE + 1,
        OPS.OP_ELSE,
        OPS.OP_IF,
        OP_INT_BASE + 2,
        OPS.OP_ELSE,
        OP_INT_BASE + 3,
        OPS.OP_ENDIF,
        OPS.OP_ENDIF,
        a.pubkeys,
        OP_INT_BASE + 3,
        OPS.OP_CHECKMULTISIG,
      ),
    );
  });
  lazy.prop(o, 'm', () => {
    switch (o.vaultTxType) {
      case index_1.VaultTxType.Alert:
        return 1;
      case index_1.VaultTxType.Instant:
        return 2;
      case index_1.VaultTxType.Recovery:
      default:
        return 3;
    }
  });
  lazy.prop(o, 'n', () => {
    return 3;
  });
  lazy.prop(o, 'pubkeys', () => {
    if (!a.output) return;
    decode(a.output);
    return o.pubkeys;
  });
  lazy.prop(o, 'signatures', () => {
    if (!a.input) return;
    const lastSignaturePos =
      a.vaultTxType === index_1.VaultTxType.Alert ? -1 : -2;
    return bscript.decompile(a.input).slice(1, lastSignaturePos);
  });
  lazy.prop(o, 'input', () => {
    if (!a.signatures) return;
    let flags;
    switch (o.vaultTxType) {
      case index_1.VaultTxType.Alert:
        flags = [OPS.OP_1];
        break;
      case index_1.VaultTxType.Instant:
        flags = [OPS.OP_1, OPS.OP_0];
        break;
      case index_1.VaultTxType.Recovery:
      default:
        flags = [OPS.OP_0, OPS.OP_0];
    }
    return bscript.compile([OPS.OP_0].concat(a.signatures).concat(flags));
  });
  lazy.prop(o, 'witness', () => {
    if (!o.input) return;
    return [];
  });
  lazy.prop(o, 'name', () => {
    return `p2air(${index_1.VaultTxType[o.vaultTxType]})`;
  });
  lazy.prop(o, 'vaultTxType', () => {
    o.vaultTxType = a.vaultTxType;
    return o.vaultTxType;
  });
  // extended validation
  if (opts.validate) {
    if (a.output) {
      if (!vaultair.output.check(a.output, opts.allowIncomplete))
        throw new TypeError('Output is invalid');
      if (a.pubkeys && !stacksEqual(a.pubkeys, o.pubkeys))
        throw new TypeError('Pubkeys mismatch');
    }
    if (a.pubkeys) {
      if (a.pubkeys.length !== 3)
        throw new TypeError('Pubkey count should be equal 3');
    }
    if (a.vaultTxType) {
      if (!Object.values(index_1.VaultTxType).includes(a.vaultTxType))
        throw new TypeError('Unrecognized VaultTxType');
    }
    if (a.signatures) {
      if (
        (a.vaultTxType === index_1.VaultTxType.Alert &&
          a.signatures.length !== 1) ||
        (a.vaultTxType === index_1.VaultTxType.Instant &&
          a.signatures.length !== 2) ||
        (a.vaultTxType === index_1.VaultTxType.Recovery &&
          a.signatures.length !== 3)
      )
        throw new TypeError('Not enough or too many signatures provided');
    }
    if (a.input) {
      if (!vaultair.input.check(a.input, opts.allowIncomplete))
        throw new TypeError('Input is invalid');
      if (
        o.signatures.length === 0 ||
        !o.signatures.every(isAcceptableSignature)
      )
        throw new TypeError('Input has invalid signature(s)');
      if (a.signatures && !stacksEqual(a.signatures, o.signatures))
        throw new TypeError('Signature mismatch');
    }
  }
  return Object.assign(o, a);
}
exports.p2air = p2air;
