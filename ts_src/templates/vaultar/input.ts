// OP_0 signature_1 [signature2] OP_0/0x01

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
  if (chunks.length < 3 || chunks.length > 4) return false;
  // multisig bug
  if (chunks[0] !== OPS.OP_0) return false;

  const alertFlag = chunks[chunks.length - 1];
  if (!isOne(alertFlag) && alertFlag !== OPS.OP_0) return false;
  // recovery tx and two signatures
  if (alertFlag === OPS.OP_0 && chunks.length === 3) return false;

  if (allowIncomplete) {
    return chunks.slice(1, -1).every(partialSignature);
  }

  return (chunks.slice(1, -1) as Buffer[]).every(
    bscript.isCanonicalScriptSignature,
  );
}
check.toJSON = (): string => {
  return 'vaultar input';
};
