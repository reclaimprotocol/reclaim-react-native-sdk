import { useContext, useMemo } from 'react'
import { makeQueue } from '@reclaimprotocol/reclaim-node/lib/utils/make-queue'
import type { ZKOperator } from '@reclaimprotocol/circom-chacha20'
import { WebViewRPCContext } from './webviewRpc'

/**
 * Queue to make sure only one zk operation is running at a time.
 * This is because snarkjs running multiple Zk ops at the same time
 * isn't supported.
 */
const zkQueue = makeQueue()
/**
 * Since snarkjs doesn't work directly on RN,
 * we need to use a webview to do the work.
 */
export function useWebviewZkOperator() {
  const { rpc } = useContext(WebViewRPCContext)

  const operator = useMemo<ZKOperator>(() => {
    return {
      groth16FullProve(input) {
        return zkQueue.enqueue(() =>
          zkRpc(`snarkjs.groth16.fullProve(
							${JSON.stringify(input)},
							window.zkParams.wasm,
							window.zkParams.zkey,
							console
						)`)
        )
      },
      groth16Verify() {
        throw new Error('Not implemented')
      },
    }

    function zkRpc<T>(code: string) {
      return rpc<T>(
        `(async() => {
          // in case snarkjs or the zkparams are not ready
          // wait for them to be ready
          while(!window.snarkjs) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          while(!window.zkParams) {
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          return ${code}
        })();`
      )
    }
  }, [rpc])

  return operator
}
