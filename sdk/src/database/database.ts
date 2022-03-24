import { AccountId, AliasHash } from '@aztec/barretenberg/account_id';
import { GrumpkinAddress } from '@aztec/barretenberg/address';
import { TxId } from '@aztec/barretenberg/tx_id';
import { CoreAccountTx, CoreClaimTx, CoreDefiTx, CorePaymentTx, CoreUserTx } from '../core_tx';
import { Note } from '../note';
import { UserData } from '../user';

// export interface SigningKey {
//   accountId: AccountId;
//   key: Buffer; // only contains x coordinate of a grumpkin address.
//   treeIndex: number;
// }

// export interface Alias {
//   aliasHash: AliasHash;
//   address: GrumpkinAddress;
//   latestNonce: number;
// }

// Temporary workaround. Parcel can't find Alias and SigningKey if they are declared as interfaces :/
export class SigningKey {
  constructor(
    public accountId: AccountId,
    public key: Buffer, // only contains x coordinate of a grumpkin address.
    public treeIndex: number,
  ) {}
}

export class Alias {
  constructor(public aliasHash: AliasHash, public address: GrumpkinAddress, public latestNonce: number) {}
}

export interface Database {
  init(): Promise<void>;
  close(): Promise<void>;
  clear(): Promise<void>;

  addNote(note: Note): Promise<void>;
  getNote(commitment: Buffer): Promise<Note | undefined>;
  getNoteByNullifier(nullifier: Buffer): Promise<Note | undefined>;
  nullifyNote(nullifier: Buffer): Promise<void>;
  getUserNotes(userId: AccountId): Promise<Note[]>;
  getUserPendingNotes(userId: AccountId): Promise<Note[]>;
  removeNote(nullifier: Buffer): Promise<void>;

  getUser(userId: AccountId): Promise<UserData | undefined>;
  getUsers(): Promise<UserData[]>;
  addUser(user: UserData): Promise<void>;
  updateUser(user: UserData): Promise<void>;
  removeUser(userId: AccountId): Promise<void>;
  resetUsers(): Promise<void>;

  addPaymentTx(tx: CorePaymentTx): Promise<void>;
  getPaymentTx(txId: TxId, userId: AccountId): Promise<CorePaymentTx | undefined>;
  getPaymentTxs(userId): Promise<CorePaymentTx[]>;
  settlePaymentTx(txId: TxId, userId: AccountId, settled: Date): Promise<void>;

  addAccountTx(tx: CoreAccountTx): Promise<void>;
  getAccountTx(txId: TxId): Promise<CoreAccountTx | undefined>;
  getAccountTxs(userId): Promise<CoreAccountTx[]>;
  settleAccountTx(txId: TxId, settled: Date): Promise<void>;

  getDefiTxsByNonce(userId, interactionNonce: number): Promise<CoreDefiTx[]>;
  updateDefiTxWithNonce(txId: TxId, interactionNonce: number, isAsync: boolean): Promise<void>;
  updateDefiTx(txId: TxId, outputValueA: bigint, outputValueB: bigint, result?: boolean): Promise<void>;
  addDefiTx(tx: CoreDefiTx): Promise<void>;
  getDefiTx(txId: TxId): Promise<CoreDefiTx | undefined>;
  getDefiTxs(userId): Promise<CoreDefiTx[]>;
  settleDefiTx(txId: TxId, settled: Date): Promise<void>;

  addClaimTx(tx: CoreClaimTx): Promise<void>;
  getClaimTx(nullifier: Buffer): Promise<CoreClaimTx | undefined>;

  getUserTxs(userId: AccountId): Promise<CoreUserTx[]>;
  isUserTxSettled(txId: TxId): Promise<boolean>;
  getUnsettledUserTxs(userId: AccountId): Promise<TxId[]>;
  removeUserTx(txId: TxId, userId: AccountId): Promise<void>;

  addUserSigningKey(signingKey: SigningKey): Promise<void>;
  addUserSigningKeys(signingKeys: SigningKey[]): Promise<void>;
  getUserSigningKeys(accountId: AccountId): Promise<SigningKey[]>;
  getUserSigningKeyIndex(accountId: AccountId, signingKey: GrumpkinAddress): Promise<number | undefined>;
  removeUserSigningKeys(accountId: AccountId): Promise<void>;

  setAlias(alias: Alias): Promise<void>;
  setAliases(alias: Alias[]): Promise<void>;
  getAlias(aliasHash: AliasHash, address: GrumpkinAddress): Promise<Alias | undefined>;
  getAliases(aliasHash: AliasHash): Promise<Alias[]>;
  getLatestNonceByAddress(address: GrumpkinAddress): Promise<number | undefined>;
  getLatestNonceByAliasHash(aliasHash: AliasHash): Promise<number | undefined>;
  getAliasHashByAddress(address: GrumpkinAddress, nonce?: number): Promise<AliasHash | undefined>;
  getAccountId(aliasHash: AliasHash, nonce?: number): Promise<AccountId | undefined>;

  deleteKey(name: string): Promise<void>;
  addKey(name: string, value: Buffer): Promise<void>;
  getKey(name: string): Promise<Buffer | undefined>;
}
