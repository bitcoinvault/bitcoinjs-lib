'use strict';
// OP_IF 1 OP_ELSE 2 OP_ENDIF pubKey1 pubKey2 2 OP_CHECKMULTISIG
Object.defineProperty(exports, '__esModule', { value: true });
const bscript = require('../../script');
const script_1 = require('../../script');
const types = require('../../types');
const OP_INT_BASE = script_1.OPS.OP_RESERVED; // OP_1 - 1
function check(script, allowIncomplete) {
  const chunks = bscript.decompile(script);
  if (chunks.length !== 9) return false;
  if (
    chunks[8] !== script_1.OPS.OP_CHECKMULTISIG ||
    chunks[0] !== script_1.OPS.OP_IF ||
    !types.Number(chunks[1]) ||
    chunks[2] !== script_1.OPS.OP_ELSE ||
    !types.Number(chunks[3]) ||
    chunks[4] !== script_1.OPS.OP_ENDIF ||
    !types.Number(chunks[7])
  )
    return false;
  const alertRequired = chunks[1] - OP_INT_BASE;
  const recoveryRequired = chunks[3] - OP_INT_BASE;
  const maxSignatures = chunks[7] - OP_INT_BASE;
  if (alertRequired !== 1) return false;
  if (recoveryRequired !== 2) return false;
  if (maxSignatures !== 2) return false;
  if (allowIncomplete) return true;
  const keys = chunks.slice(5, 7);
  return keys.every(bscript.isCanonicalPubKey);
}
exports.check = check;
check.toJSON = () => {
  return 'vaultar output';
};
