// OP_IF 1 OP_ELSE OP_IF 2 OP_ELSE 3 OP_ENDIF OP_ENDIF pubKey1 pubKey2 pubKey3 3 OP_CHECKMULTISIG

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

  if (chunks.length !== 14) return false;
  if (chunks[chunks.length - 1] !== OPS.OP_CHECKMULTISIG) return false;
  if (!types.Number(chunks[1])) return false;
  if (!types.Number(chunks[4])) return false;
  if (!types.Number(chunks[6])) return false;
  if (!types.Number(chunks[12])) return false;
  const alertRequired = (chunks[1] as number) - OP_INT_BASE;
  const instantRequired = (chunks[4] as number) - OP_INT_BASE;
  const recoveryRequired = (chunks[6] as number) - OP_INT_BASE;
  const maxSignatures = (chunks[12] as number) - OP_INT_BASE;

  if (alertRequired !== 1) return false;
  if (instantRequired !== 2) return false;
  if (recoveryRequired !== 3) return false;
  if (maxSignatures !== 3) return false;

  if (allowIncomplete) return true;

  const keys = chunks.slice(9, 12) as Buffer[];
  return keys.every(bscript.isCanonicalPubKey);
}
check.toJSON = (): string => {
  return 'vaultair output';
};
