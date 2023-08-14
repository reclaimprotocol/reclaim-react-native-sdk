import { ReclaimWalletBackendClient } from '@reclaimprotocol/reclaim-client-sdk/'

let client: ReclaimWalletBackendClient | null = null

export function getClient(privateKey?: string, refresh = false) {
  if ((!client || refresh) && privateKey) {
    client = new ReclaimWalletBackendClient(privateKey)
  }

  return client
}

export function getNewClientInstance(privateKey: string) {
  const client = new ReclaimWalletBackendClient(privateKey)
  return client
}
