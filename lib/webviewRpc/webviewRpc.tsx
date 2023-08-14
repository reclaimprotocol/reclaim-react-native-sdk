import { createContext, PropsWithChildren, useCallback, useRef } from 'react'
import { View } from 'react-native'
import WebView from 'react-native-webview'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RPCResult = { result: any } | { error: string; stack?: string }
type RPCMessage =
  | ({ id: string } & RPCResult)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: 'console'; level: 'log' | 'info' | 'warn' | 'error'; data: any[] }

type WebViewRPCState = {
  rpc<T>(code: string): Promise<T>
}

const initialState: WebViewRPCState = {
  async rpc() {
    throw new Error('not initialized')
  },
}

export const WebViewRPCContext = createContext(initialState)

// eslint-disable-next-line @typescript-eslint/ban-types
export function WebViewRPCProvider({ children }: PropsWithChildren<{}>) {
  const { rpc, webview } = useWebviewZkOperator()

  return (
    <WebViewRPCContext.Provider value={{ rpc }}>
      {/**
       * hide the webview,
       * this will just run in the background
       * and allow communication between the webview
       * & the react-native app
       * */}
      <View
        // eslint-disable-next-line react-native/no-inline-styles
        style={{ height: 0 }}
      >
        {webview}
      </View>
      {children}
    </WebViewRPCContext.Provider>
  )
}

/**
 * Since snarkjs doesn't work directly on RN,
 * we need to use a webview to do the work.
 */
export function useWebviewZkOperator() {
  const webviewRef = useRef<WebView | null>()
  const pendingRpcs = useRef<{ [_: string]: (r: RPCResult) => void }>({})

  /**
   * Execute some code in the webview & expect a result.
   * @param code the code to execute
   * For eg. `snarkjs.groth16.fullProve(...)`
   * @returns the result of the code
   */
  const rpc = useCallback(async (code: string) => {
    const requestId = Math.random().toString(16).replace('.', '')
    // unique function name
    const rpcName = `rpc_${requestId}`
    // generate code to execute in the webview
    const fullCode = `
				async function ${rpcName}() {
					try {
						const result = await ${code}
						window.ReactNativeWebView.postMessage(JSON.stringify({
							id: '${requestId}',
							result
						}))
					} catch(err) {
						console.error('err in RPC: ' + err.stack)
						window.ReactNativeWebView.postMessage(JSON.stringify({
							id: '${requestId}',
							error: err.message,
							stack: err.stack
						}))
					}
				}
	
				${rpcName}()
				// some weird requirement from react-native-webview
				// to add true to the end of the injected code
				true
			`
    // create a promise that will be resolved when the webview
    // sends a message with the result
    const promise = new Promise<RPCResult>((resolve) => {
      pendingRpcs.current[requestId] = resolve
    })

    // execute the code in the webview

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    webviewRef.current!.injectJavaScript(fullCode)

    // wait for the result
    // and return the result or throw an error
    const result = await promise
    delete pendingRpcs.current[requestId]

    if ('error' in result) {
      const err = new Error(`RPC error: '${result.error}'`)
      err.stack = result.stack
      throw err
    }

    return result.result
  }, [])

  return {
    rpc,
    webview: (
      <WebView
        ref={(r) => (webviewRef.current = r)}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        source={{
          html: HTML,
          // https allows execution of crypto code
          baseUrl: 'https://localhost',
        }}
        onMessage={(data) => {
          const rpcResult = data.nativeEvent.data
          const parsed = JSON.parse(rpcResult) as RPCMessage
          // log console messages from the webview
          if ('type' in parsed && parsed.type === 'console') {
            // eslint-disable-next-line no-console
            console[parsed.level]('[WebView]', ...parsed.data)
            return
          } else if ('id' in parsed) {
            const { id } = parsed
            const callback = pendingRpcs.current[id]
            callback?.(parsed)
          }
        }}
      />
    ),
  }
}

const HTML = `
<html>
<head>
	<script>
		// load async, because raw github content type is text/plain
		// which prevents the browser from executing it
		async function loadSnarkJs() {
			const result = await fetch(
				'https://raw.githubusercontent.com/iden3/snarkjs/v0.7.0/build/snarkjs.min.js'
			)
			const txt = await result.text()
			
			const elem = document.createElement('script')
			elem.innerText = txt
			document.body.appendChild(elem)

			console.log('loaded snarkjs')
		}

		loadSnarkJs()
	</script>

	<script>
		// from: https://stackoverflow.com/a/21797381
		function base64ToArrayBuffer(base64) {
			var binary_string = window.atob(base64)
			var len = binary_string.length
			var bytes = new Uint8Array(len)
			for (var i = 0; i < len; i++) {
				bytes[i] = binary_string.charCodeAt(i)
			}
			return bytes
		}

		// load ZK params from a hosted JSON
		// as the JSON is too large to be included in the HTML directly
		async function loadZkParams() {
			const result = await fetch(
				// tmp url till we make the repo public,
				// then we'll use the github url
				'https://s3.ap-east-1.amazonaws.com/chatdaddy-media-store/938e3450c3f324b1'
			)
			const json = await result.json()
			window.zkParams = {
				wasm: base64ToArrayBuffer(json.wasm),
				zkey: base64ToArrayBuffer(json.zkey.data),
			}
			console.log('got zk params')
		}

		loadZkParams()
	</script>

	<script>
		/**
		 * Code to serialise/deserialise data
		 * for transfer between the webview and the RN app
		 */
		const KEY_MAP = {}

		function serialiseCryptoArg(arg) {
			return JSON.stringify(arg, cryptoReplacer)
		}

		function cryptoReplacer(key, value) {
			if(value instanceof ArrayBuffer || value instanceof Uint8Array) {
				return {
					__type: 'ArrayBuffer',
					data: window.btoa(value)
				}
			}

			const localStr = value.toLocaleString()
			const isCryptoKey = localStr === "[object CryptoKey]"
				|| localStr === "[object Key]"
			if(isCryptoKey) {
				// instead of serialising the key,
				// we generate a random keyId
				// and store the key in a map.
				// We then send the keyId to the RN app
				// which will use it to retrieve the key from the map
				const keyId = genKeyId()
				KEY_MAP[keyId] = value
				return {
					__type: 'CryptoKey',
					keyId,
					algorithm: value.algorithm,
					extractable: value.extractable,
					usages: value.usages,
					type: value.type,
				}
			}

			return value
		}

		function genKeyId() {
			return Math.random().toString(36).substring(2, 15)
		}
	</script>

	<script>
		// code to send logs to RN
		const consoleLog = (level, log) => 
			window.ReactNativeWebView.postMessage(
				JSON.stringify({ 'type': 'console', level, 'data': [log] })
			)
		console = {
			log: (log) => consoleLog('log', log),
			debug: (log) => consoleLog('debug', log),
			info: (log) => consoleLog('info', log),
			warn: (log) => consoleLog('warn', log),
			error: (log) => consoleLog('error', log),
		};

		window.onunhandledrejection = (err) => {
			console.error(\`unhandled reject: $\{err}\`)
		}
	</script>
</head>
<body>
	WebView RPC, SnarkJS runner
</body>
</html>
`
