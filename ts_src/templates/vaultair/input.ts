// OP_0 signature_1 [signature2, signature3] [OP_0/0x01] OP_0/0x01

import { Stack } from '../../payments';
import * as bscript from '../../script';
import { OPS } from '../../script';

function partialSignature(value: number | Buffer): boolean {
  return (
    value === OPS.OP_0 || bscript.isCanonicalScriptSignature(value as Buffer)
  );
}

function isOne(value: number | Buffer): boolean {
  return value === OPS.OP_1 || value === 1;
}

export function check(
  script: Buffer | Stack,
  allowIncomplete?: boolean,
): boolean {
  const chunks = bscript.decompile(script) as Stack;
  if (chunks.length < 3 || chunks.length > 6) return false;
  // multisig bug
  if (chunks[0] !== OPS.OP_0) return false;

  let lastSignaturePos;
  const alertFlag = chunks[chunks.length - 1];
  if (alertFlag === OPS.OP_0) {
    lastSignaturePos = -2;
    const instantFlag = chunks[chunks.length - 2];
    if (!isOne(instantFlag) && instantFlag !== OPS.OP_0) return false;
    // instant tx and two signatures
    if (isOne(instantFlag) && chunks.length < 5) return false;
    // recovery tx and three signatures
    if (instantFlag === OPS.OP_0 && chunks.length < 6) return false;
  } else if (isOne(alertFlag)) {
    lastSignaturePos = -1;
    // alert flag and redundant instant/recovery flag
    if (chunks.length > 5) return false;
  } else {
    return false;
  }

  if (allowIncomplete) {
    return chunks.slice(1, lastSignaturePos).every(partialSignature);
  }

  return (chunks.slice(1, lastSignaturePos) as Buffer[]).every(
    bscript.isCanonicalScriptSignature,
  );
}
check.toJSON = (): string => {
  return 'vaultair input';
};
