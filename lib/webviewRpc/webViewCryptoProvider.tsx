/* eslint-disable @typescript-eslint/no-explicit-any */
import { getWebCrypto } from '@reclaimprotocol/reclaim-node'
import { PropsWithChildren, useCallback, useContext, useEffect } from 'react'
import { WebViewRPCContext } from './webviewRpc'

type WebCrypto = ReturnType<typeof getWebCrypto>['subtle']

/**
 * Provides a WebCrypto API that
 * uses the webview RPC to call the native crypto API
 *
 * This is done by setting the `subtle` property
 * on the global `crypto` object
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function WebViewCryptoProvider({ children }: PropsWithChildren<{}>) {
  const { rpc } = useContext(WebViewRPCContext)

  const subtleCryptoRpc = useCallback(
    async function subtleCryptoRpc(method: string, ...args: any[]) {
      const argString = args.map(serialiseCryptoArg).join(', ')
      const returnVal = await rpc<any>(`(async() => {
				const subtle = window.crypto.subtle || window.crypto.webkitSubtle
				const result = await subtle['${method}'](${argString})
				return serialiseCryptoArg(result)
			})();`)
      return deserialiseCryptoArg(returnVal)
    },
    [rpc]
  )

  useEffect(() => {
    const subtle = METHODS_TO_POLYFILL.reduce((cryptoObj, method) => {
      cryptoObj[method] = (...args: any[]) => subtleCryptoRpc(method, ...args)
      return cryptoObj
    }, {} as WebCrypto)

    const anyGlobal = global as any
    if (typeof anyGlobal.crypto === 'undefined') {
      anyGlobal.crypto = {}
    }

    if (typeof anyGlobal.crypto.subtle === 'undefined') {
      anyGlobal.crypto.subtle = {}
    }

    Object.assign(anyGlobal.crypto.subtle, subtle)
    // eslint-disable-next-line no-console
    console.log('set subtle polyfill')
  }, [subtleCryptoRpc])

  return <>{children}</>
}

const METHODS_TO_POLYFILL: (keyof WebCrypto)[] = ['importKey', 'verify']

function serialiseCryptoArg(arg: any): string {
  const result = JSON.stringify(arg, cryptoReplacer)
  return (
    result
      // JSON stringify re-stringifies strings
      // so we need to undo that
      .replace(/"base64ToArrayBuffer\('(.*)'\)"/g, 'base64ToArrayBuffer("$1")')
      .replace(/"KEY_MAP\['(.*)'\]"/g, 'KEY_MAP["$1"]')
  )
}

function cryptoReplacer(key: string, value: any) {
  if (value?.type === 'Buffer' && Array.isArray(value.data)) {
    return `base64ToArrayBuffer('${Buffer.from(value.data).toString('base64')}')`
  }

  if (value instanceof ArrayBuffer || value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return `base64ToArrayBuffer('${Buffer.from(value).toString('base64')}')`
  }

  if (value?.__type === 'CryptoKey') {
    return `KEY_MAP['${value.keyId}']`
  }

  return value
}

function deserialiseCryptoArg(arg: any): any {
  return JSON.parse(arg, cryptoReviver)
}

function cryptoReviver(key: string, value: any) {
  if (value?.__type === 'ArrayBuffer') {
    return Buffer.from(value.data, 'base64')
  }

  return value
}
