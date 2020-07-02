'use strict';
// OP_IF 1 OP_ELSE OP_IF 2 OP_ELSE 3 OP_ENDIF OP_ENDIF pubKey1 pubKey2 pubKey3 3 OP_CHECKMULTISIG
Object.defineProperty(exports, '__esModule', { value: true });
const bscript = require('../../script');
const script_1 = require('../../script');
const types = require('../../types');
const OP_INT_BASE = script_1.OPS.OP_RESERVED; // OP_1 - 1
function check(script, allowIncomplete) {
  const chunks = bscript.decompile(script);
  if (chunks.length !== 14) return false;
  if (chunks[chunks.length - 1] !== script_1.OPS.OP_CHECKMULTISIG) return false;
  if (!types.Number(chunks[1])) return false;
  if (!types.Number(chunks[4])) return false;
  if (!types.Number(chunks[6])) return false;
  if (!types.Number(chunks[12])) return false;
  const alertRequired = chunks[1] - OP_INT_BASE;
  const instantRequired = chunks[4] - OP_INT_BASE;
  const recoveryRequired = chunks[6] - OP_INT_BASE;
  const maxSignatures = chunks[12] - OP_INT_BASE;
  if (alertRequired !== 1) return false;
  if (instantRequired !== 2) return false;
  if (recoveryRequired !== 3) return false;
  if (maxSignatures !== 3) return false;
  if (allowIncomplete) return true;
  const keys = chunks.slice(9, 12);
  return keys.every(bscript.isCanonicalPubKey);
}
exports.check = check;
check.toJSON = () => {
  return 'vaultair output';
};
