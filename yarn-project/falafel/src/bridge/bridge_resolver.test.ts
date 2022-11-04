import { Blockchain } from '@aztec/barretenberg/blockchain';
import { BridgeConfig } from '@aztec/barretenberg/rollup_provider';
import { BridgeResolver } from './bridge_resolver.js';
import { jest } from '@jest/globals';

const bridgeConfigs: BridgeConfig[] = [
  {
    bridgeCallData: 1n,
    numTxs: 5,
    gas: 500000,
    rollupFrequency: 2,
  },
  {
    bridgeCallData: 2n,
    numTxs: 10,
    gas: 0,
    rollupFrequency: 4,
  },
  {
    bridgeCallData: 3n,
    numTxs: 40,
    gas: 500000,
    rollupFrequency: 2,
  },
  {
    bridgeCallData: 4n,
    numTxs: 40,
    gas: 250000,
    rollupFrequency: 4,
  },
  {
    bridgeCallData: 5n,
    numTxs: 3,
    gas: 100000,
    rollupFrequency: 4,
  },
];

type Mockify<T> = {
  [P in keyof T]: ReturnType<typeof jest.fn>;
};

const DEFAULT_BRIDGE_GAS_LIMIT = 200000;

describe('Bridge Resolver', () => {
  let blockchain: Mockify<Blockchain>;
  let bridgeResolver: BridgeResolver;
  const defaultDeFiBatchSize = 10;
  const thirdPartyBridgeCallData = 123n;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});

    blockchain = {
      getBridgeGas: jest.fn().mockReturnValue(DEFAULT_BRIDGE_GAS_LIMIT),
      getBlockchainStatus: jest.fn().mockReturnValue({
        allowThirdPartyContracts: false,
      }),
    } as any;

    bridgeResolver = new BridgeResolver(bridgeConfigs, blockchain as any, defaultDeFiBatchSize);
  });

  it('returns correct bridge config', () => {
    expect(bridgeResolver.getBridgeConfig(bridgeConfigs[0].bridgeCallData)).toEqual(bridgeConfigs[0]);
    expect(bridgeResolver.getBridgeConfig(bridgeConfigs[1].bridgeCallData)).toEqual(bridgeConfigs[1]);
  });

  it('returns all bridge configs', () => {
    expect(bridgeResolver.getBridgeConfigs()).toEqual(bridgeConfigs);
  });

  it('returns correct full bridge gas', () => {
    expect(bridgeResolver.getFullBridgeGas(bridgeConfigs[0].bridgeCallData)).toEqual(bridgeConfigs[0].gas);
    expect(bridgeResolver.getFullBridgeGas(bridgeConfigs[1].bridgeCallData)).toEqual(bridgeConfigs[1].gas);
    expect(bridgeResolver.getFullBridgeGas(thirdPartyBridgeCallData)).toEqual(DEFAULT_BRIDGE_GAS_LIMIT);
  });

  it('returns correct single tx gas in the bridge config', () => {
    for (const bridgeConfig of bridgeConfigs) {
      expect(bridgeResolver.getMinBridgeTxGas(bridgeConfig.bridgeCallData)).toEqual(
        Math.ceil(bridgeConfig.gas / bridgeConfig.numTxs),
      );
    }
  });

  it('returns correct single tx gas NOT in the bridge config and when the allowThirdPartyContracts flag is set', () => {
    const unregisteredBridgeGas = 100000;
    blockchain.getBridgeGas.mockReturnValueOnce(unregisteredBridgeGas);
    blockchain.getBlockchainStatus.mockReturnValueOnce({ allowThirdPartyContracts: true });

    expect(bridgeResolver.getMinBridgeTxGas(thirdPartyBridgeCallData)).toEqual(
      unregisteredBridgeGas / defaultDeFiBatchSize,
    );
  });

  it('throws for a tx NOT in the bridge config and when the allowThirdPartyContracts flag is FALSE', () => {
    blockchain.getBlockchainStatus.mockReturnValue({ allowThirdPartyContracts: false });
    expect(() => bridgeResolver.getMinBridgeTxGas(BigInt(bridgeConfigs.length + 1))).toThrow(
      'Cannot get gas. Unrecognised DeFi-bridge',
    );
  });
});