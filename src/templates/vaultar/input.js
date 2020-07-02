'use strict';
// OP_0 signature_1 [signature2] OP_0/0x01
Object.defineProperty(exports, '__esModule', { value: true });
const bscript = require('../../script');
const script_1 = require('../../script');
function partialSignature(value) {
  return (
    value === script_1.OPS.OP_0 || bscript.isCanonicalScriptSignature(value)
  );
}
function isOne(value) {
  return value === script_1.OPS.OP_1 || value === 1;
}
function check(script, allowIncomplete) {
  const chunks = bscript.decompile(script);
  if (chunks.length < 3 || chunks.length > 4) return false;
  // multisig bug
  if (chunks[0] !== script_1.OPS.OP_0) return false;
  const alertFlag = chunks[chunks.length - 1];
  if (!isOne(alertFlag) && alertFlag !== script_1.OPS.OP_0) return false;
  // recovery tx and two signatures
  if (alertFlag === script_1.OPS.OP_0 && chunks.length === 3) return false;
  if (allowIncomplete) {
    return chunks.slice(1, -1).every(partialSignature);
  }
  return chunks.slice(1, -1).every(bscript.isCanonicalScriptSignature);
}
exports.check = check;
check.toJSON = () => {
  return 'vaultar input';
};
