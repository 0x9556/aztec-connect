import { GrumpkinAddress } from '../address';
import { toBigIntBE, toBufferBE } from '../bigint_buffer';
import { Grumpkin } from '../ecc/grumpkin';
import { numToUInt32BE } from '../serialize';
import { ViewingKey } from '../viewing_key';
import { DecryptedNote } from './decrypted_note';
import { deriveNoteSecret } from './derive_note_secret';

export class TreeNote {
  static EMPTY = new TreeNote(
    GrumpkinAddress.one(),
    BigInt(0),
    0,
    0,
    Buffer.alloc(32),
    Buffer.alloc(32),
    Buffer.alloc(32),
  );
  static SIZE = TreeNote.EMPTY.toBuffer().length;
  static LATEST_VERSION = 1;

  constructor(
    public ownerPubKey: GrumpkinAddress,
    public value: bigint,
    public assetId: number,
    public nonce: number,
    public noteSecret: Buffer,
    public creatorPubKey: Buffer,
    public inputNullifier: Buffer,
  ) {}

  toBuffer() {
    return Buffer.concat([
      toBufferBE(this.value, 32),
      numToUInt32BE(this.assetId),
      numToUInt32BE(this.nonce),
      this.ownerPubKey.toBuffer(),
      this.noteSecret,
      this.creatorPubKey,
      this.inputNullifier,
    ]);
  }

  createViewingKey(ephPrivKey: Buffer, grumpkin: Grumpkin) {
    const noteBuf = Buffer.concat([
      toBufferBE(this.value, 32),
      numToUInt32BE(this.assetId),
      numToUInt32BE(this.nonce),
      this.creatorPubKey,
    ]);
    return ViewingKey.createFromEphPriv(noteBuf, this.ownerPubKey, ephPrivKey, grumpkin);
  }

  static fromBuffer(buf: Buffer) {
    let dataStart = 0;
    const value = toBigIntBE(buf.slice(dataStart, dataStart + 32));
    dataStart += 32;
    const assetId = buf.readUInt32BE(dataStart);
    dataStart += 4;
    const nonce = buf.readUInt32BE(dataStart);
    dataStart += 4;
    const ownerPubKey = new GrumpkinAddress(buf.slice(dataStart, dataStart + 64));
    dataStart += 64;
    const noteSecret = buf.slice(dataStart, dataStart + 32);
    dataStart += 32;
    const creatorPubKey = buf.slice(dataStart, dataStart + 32);
    dataStart += 32;
    const inputNullifier = buf.slice(dataStart, dataStart + 32);
    return new TreeNote(ownerPubKey, value, assetId, nonce, noteSecret, creatorPubKey, inputNullifier);
  }

  /**
   * Note on how the noteSecret can be derived in two different ways (from ephPubKey or ephPrivKey):
   *
   * ownerPubKey := [ownerPrivKey] * G  (where G is a generator of the grumpkin curve, and `[scalar] * Point` is scalar multiplication).
   *                      ↑
   *         a.k.a. account private key
   *
   * ephPubKey := [ephPrivKey] * G    (where ephPrivKey is a random field element).
   *
   * sharedSecret := [ephPrivKey] * ownerPubKey = [ephPrivKey] * ([ownerPrivKey] * G) = [ownerPrivKey] * ([ephPrivKey] * G) = [ownerPrivKey] * ephPubKey
   *                  ^^^^^^^^^^                                                                                                               ^^^^^^^^^
   * noteSecret is then derivable from the sharedSecret.
   */
  static createFromEphPriv(
    ownerPubKey: GrumpkinAddress,
    value: bigint,
    assetId: number,
    nonce: number,
    inputNullifier: Buffer,
    ephPrivKey: Buffer,
    grumpkin: Grumpkin,
    noteVersion = 1,
    creatorPubKey: Buffer = Buffer.alloc(32),
  ) {
    const noteSecret = deriveNoteSecret(ownerPubKey, ephPrivKey, grumpkin, noteVersion);
    return new TreeNote(ownerPubKey, value, assetId, nonce, noteSecret, creatorPubKey, inputNullifier);
  }

  static createFromEphPub(
    ownerPubKey: GrumpkinAddress,
    value: bigint,
    assetId: number,
    nonce: number,
    inputNullifier: Buffer,
    ephPubKey: GrumpkinAddress,
    ownerPrivKey: Buffer,
    grumpkin: Grumpkin,
    noteVersion = 1,
    creatorPubKey: Buffer = Buffer.alloc(32),
  ) {
    const noteSecret = deriveNoteSecret(ephPubKey, ownerPrivKey, grumpkin, noteVersion);
    return new TreeNote(ownerPubKey, value, assetId, nonce, noteSecret, creatorPubKey, inputNullifier);
  }

  static recover({ noteBuf, noteSecret, inputNullifier }: DecryptedNote, ownerPubKey: GrumpkinAddress) {
    const value = toBigIntBE(noteBuf.slice(0, 32));
    const assetId = noteBuf.readUInt32BE(32);
    const nonce = noteBuf.readUInt32BE(36);
    const creatorPubKey = noteBuf.slice(40, 72);
    return new TreeNote(ownerPubKey, value, assetId, nonce, noteSecret, creatorPubKey, inputNullifier);
  }
}
