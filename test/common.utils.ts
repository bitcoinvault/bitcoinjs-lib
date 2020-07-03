export const NETWORKS = Object.assign(
  {
    litecoin: {
      messagePrefix: '\x19Litecoin Signed Message:\n',
      bip32: {
        public: 0x019da462,
        private: 0x019d9cfe,
      },
      pubKeyHash: 0x30,
      scriptHash: 0x32,
      wif: 0xb0,
    },
    bitcoinvault: {
      messagePrefix: '\x18Bitcoin Signed Message:\n',
      bech32: 'royale',
      bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
      },
      pubKeyHash: 0x4e, // 78 dec => Y
      scriptHash: 0x3c, // 60 dec => R
      wif: 0x80,
    },
  },
  require('../src/networks'),
);
