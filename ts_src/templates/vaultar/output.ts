// OP_IF 1 OP_ELSE 2 OP_ENDIF pubKey1 pubKey2 2 OP_CHECKMULTISIG

import { Stack } from '../../payments';
import * as bscript from '../../script';
import { OPS } from '../../script';
import * as types from '../../types';
const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1

export function check(
  script: Buffer | Stack,
  allowIncomplete?: boolean,
): boolean {
  const chunks = bscript.decompile(script) as Stack;

  if (chunks.length !== 9) return false;
  if (
    chunks[8] !== OPS.OP_CHECKMULTISIG ||
    chunks[0] !== OPS.OP_IF ||
    !types.Number(chunks[1]) ||
    chunks[2] !== OPS.OP_ELSE ||
    !types.Number(chunks[3]) ||
    chunks[4] !== OPS.OP_ENDIF ||
    !types.Number(chunks[7])
  )
    return false;

  const alertRequired = (chunks[1] as number) - OP_INT_BASE;
  const recoveryRequired = (chunks[3] as number) - OP_INT_BASE;
  const maxSignatures = (chunks[7] as number) - OP_INT_BASE;

  if (alertRequired !== 1) return false;
  if (recoveryRequired !== 2) return false;
  if (maxSignatures !== 2) return false;
  if (allowIncomplete) return true;

  const keys = chunks.slice(5, 7) as Buffer[];
  return keys.every(bscript.isCanonicalPubKey);
}
check.toJSON = (): string => {
  return 'vaultar output';
};
