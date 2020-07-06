import { Network } from './networks';

export const bitcoinvault: Network = {
  messagePrefix: '\x18Bitcoin Signed Message:\n',
  bech32: 'royale',
  bip32: {
    public: 0x0488b21e,
    private: 0x0488ade4,
  },
  pubKeyHash: 0x4e, // 78 dec => Y
  scriptHash: 0x3c, // 60 dec => R
  wif: 0x80,
};
export const bitcoinvaultTestnet: Network = {
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
export const bitcoinvaultRegtest: Network = {
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
