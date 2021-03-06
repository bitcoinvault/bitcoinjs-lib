import { decompile } from './script';
import * as multisig from './templates/multisig';
import * as nullData from './templates/nulldata';
import * as pubKey from './templates/pubkey';
import * as pubKeyHash from './templates/pubkeyhash';
import * as scriptHash from './templates/scripthash';
import * as vaultair from './templates/vaultair';
import * as vaultar from './templates/vaultar';
import * as witnessCommitment from './templates/witnesscommitment';
import * as witnessPubKeyHash from './templates/witnesspubkeyhash';
import * as witnessScriptHash from './templates/witnessscripthash';

const types = {
  P2MS: 'multisig',
  P2AR: 'vaultar',
  P2AIR: 'vaultair',
  NONSTANDARD: 'nonstandard',
  NULLDATA: 'nulldata',
  P2PK: 'pubkey',
  P2PKH: 'pubkeyhash',
  P2SH: 'scripthash',
  P2WPKH: 'witnesspubkeyhash',
  P2WSH: 'witnessscripthash',
  WITNESS_COMMITMENT: 'witnesscommitment',
};

function classifyOutput(script: Buffer): string {
  if (witnessPubKeyHash.output.check(script)) return types.P2WPKH;
  if (witnessScriptHash.output.check(script)) return types.P2WSH;
  if (pubKeyHash.output.check(script)) return types.P2PKH;
  if (scriptHash.output.check(script)) return types.P2SH;

  // XXX: optimization, below functions .decompile before use
  const chunks = decompile(script);
  if (!chunks) throw new TypeError('Invalid script');

  if (vaultar.output.check(chunks)) return types.P2AR;
  if (vaultair.output.check(chunks)) return types.P2AIR;
  if (multisig.output.check(chunks)) return types.P2MS;
  if (pubKey.output.check(chunks)) return types.P2PK;
  if (witnessCommitment.output.check(chunks)) return types.WITNESS_COMMITMENT;
  if (nullData.output.check(chunks)) return types.NULLDATA;

  return types.NONSTANDARD;
}

function classifyInput(script: Buffer, allowIncomplete?: boolean): string {
  // XXX: optimization, below functions .decompile before use
  const chunks = decompile(script);
  if (!chunks) throw new TypeError('Invalid script');

  if (pubKeyHash.input.check(chunks)) return types.P2PKH;
  if (scriptHash.input.check(chunks, allowIncomplete)) return types.P2SH;
  if (vaultar.input.check(chunks, allowIncomplete)) return types.P2AR;
  if (vaultair.input.check(chunks, allowIncomplete)) return types.P2AIR;
  if (multisig.input.check(chunks, allowIncomplete)) return types.P2MS;
  if (pubKey.input.check(chunks)) return types.P2PK;

  return types.NONSTANDARD;
}

function classifyWitness(script: Buffer[], allowIncomplete?: boolean): string {
  // XXX: optimization, below functions .decompile before use
  const chunks = decompile(script);
  if (!chunks) throw new TypeError('Invalid script');

  if (witnessPubKeyHash.input.check(chunks)) return types.P2WPKH;
  if (witnessScriptHash.input.check(chunks as Buffer[], allowIncomplete))
    return types.P2WSH;

  return types.NONSTANDARD;
}

export {
  classifyInput as input,
  classifyOutput as output,
  classifyWitness as witness,
  types,
};
