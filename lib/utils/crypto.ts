import { makeBeacon, NODEJS_TLS_CRYPTO, TLSCrypto } from '@reclaimprotocol/reclaim-node'
import { AUTH_TAG_BYTE_LENGTH } from '@reclaimprotocol/reclaim-node/lib/tls/constants'
import { Beacon, signatures } from '@reclaimprotocol/crypto-sdk'
import { ChaCha20Poly1305 } from '@stablelib/chacha20poly1305'
import crypto from 'crypto'
import { ethers, Wallet } from 'ethers'
import 'react-native-get-random-values'
import '@ethersproject/shims'

export const generateWallet = async () => {
  const bytes = crypto.randomBytes(32)
  const wallet = new Wallet(bytes)

  const publicKey = await signatures.getPublicKey(wallet.privateKey)
  const pubKey = Buffer.from(publicKey).toString('hex')
  // Buffer.from(pubKey, 'hex')

  return {
    publicKey: pubKey,
    privateKey: wallet.privateKey,
  }
}

export const getWalletFromPrivateKey = (privateKey: string) => {
  const wallet = new ethers.Wallet(privateKey)
  return wallet
}

export const REACT_NATIVE_TLS_CRYPTO: TLSCrypto = {
  encrypt(cipherSuite, opts) {
    if (cipherSuite === 'TLS_CHACHA20_POLY1305_SHA256') {
      const cipher = new ChaCha20Poly1305(opts.key)
      const total = cipher.seal(opts.iv, opts.data, opts.aead)
      return {
        ciphertext: Buffer.from(total.slice(0, total.length - AUTH_TAG_BYTE_LENGTH)),
        authTag: Buffer.from(total.slice(total.length - AUTH_TAG_BYTE_LENGTH)),
      }
    }

    return NODEJS_TLS_CRYPTO.encrypt(cipherSuite, opts)
  },
  decrypt(cipherSuite, opts) {
    if (cipherSuite === 'TLS_CHACHA20_POLY1305_SHA256') {
      const cipher = new ChaCha20Poly1305(opts.key)
      if (!opts.authTag) {
        throw new Error('authTag is required for chacha20poly1305')
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const total = Buffer.concat([opts.data, opts.authTag!])
      const plaintext = cipher.open(opts.iv, total, opts.aead)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return { plaintext: Buffer.from(plaintext!) }
    }

    return NODEJS_TLS_CRYPTO.decrypt(cipherSuite, opts)
  },
}

let beacon: null | Beacon = null

export const getBeacon = () => {
  if (beacon) return beacon
  return (beacon = makeBeacon())
}
