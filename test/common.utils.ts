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
  },
  require('../src/networks'),
  require('../src/alt_networks'),
);
