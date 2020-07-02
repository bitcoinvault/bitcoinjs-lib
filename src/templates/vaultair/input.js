'use strict';
// OP_0 signature_1 [signature2, signature3] [OP_0/0x01] OP_0/0x01
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
  if (chunks.length < 3 || chunks.length > 6) return false;
  // multisig bug
  if (chunks[0] !== script_1.OPS.OP_0) return false;
  let lastSignaturePos;
  const alertFlag = chunks[chunks.length - 1];
  if (alertFlag === script_1.OPS.OP_0) {
    lastSignaturePos = -2;
    const instantFlag = chunks[chunks.length - 2];
    if (!isOne(instantFlag) && instantFlag !== script_1.OPS.OP_0) return false;
    // instant tx and two signatures
    if (isOne(instantFlag) && chunks.length < 5) return false;
    // recovery tx and three signatures
    if (instantFlag === script_1.OPS.OP_0 && chunks.length < 6) return false;
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
  return chunks
    .slice(1, lastSignaturePos)
    .every(bscript.isCanonicalScriptSignature);
}
exports.check = check;
check.toJSON = () => {
  return 'vaultair input';
};
