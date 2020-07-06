'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.bitcoinvault = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'royale',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x4e,
  scriptHash: 0x3c,
  wif: 0x80,
};
exports.bitcoinvaultTestnet = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'troyale',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
exports.bitcoinvaultRegtest = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'rtroyale',
  bip32: {
    public: 0x043587cf,
    private: 0x04358394,
  },
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};
