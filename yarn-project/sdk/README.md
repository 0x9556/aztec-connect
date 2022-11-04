# Aztec SDK

Aztec's SDK is the gateway for developers to access the Aztec network, and benefit from low gas fees and privacy on Ethereum. The SDK connects to our ZkRollup service and can be integrated with one line of code.

The SDK is designed to abstract away the complexities of Zero-knowledge proofs from the developer and end users. It provides a simple API for creating accounts, depositing and withdrawing tokens anonymously. The core transfer inside the SDK is private by default.

Under the hood the SDK keeps track of a users private balances across multiples assets and provides easy to use helper methods to the developer to create seamless private UI's.

## Installation

To install the SDK from NPM use the following command.

```
yarn add @aztec/sdk
```

## Development

Run in different terminals:

```
yarn build:if:dev
```

```
yarn build:sw:dev
```

Then, if making changes to a module outside the sdk (e.g. barretenberg.js), run:

```
touch ./package.json
```

This will force a rebuild.