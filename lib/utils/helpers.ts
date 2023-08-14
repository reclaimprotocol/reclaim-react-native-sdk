import { Claim } from '@app/redux/links/types'
import CookieManager from '@react-native-cookies/cookies'
import { isEmpty, isNumber, isString } from 'lodash'
// eslint-disable-next-line react-native/split-platform-components
import { Image, ImageRequireSource, ImageURISource, Platform, ToastAndroid } from 'react-native'
import RNFetchBlob from 'rn-fetch-blob'

const UNKOWN_ERROR = 'Unknown Error'

export function truncateAddress(addr: string) {
  const first = addr.substring(0, 3)
  const last = addr.slice(-3)
  return first + '...' + last
}

export async function fetchUserContribution(accessToken: string | null) {
  return fetch('https://api.github.com/user/repos', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  }).then((res) => res.json())
}

export async function getUserContribution(accessToken: string | null) {
  const data = await fetchUserContribution(accessToken)
  const userContributions: {
    name: string
    owner: string
    avatarURL: string
    lastCommit: string
  }[] = []
  for (let i = 0; i < data.length; i++) {
    const lastCommit = data[i].updated_at.substring(0, data[i].updated_at.indexOf('T'))
    const name = data[i].full_name.substring(data[i].full_name.indexOf('/') + 1)
    const contribution = {
      name: name,
      owner: data[i].owner.login,
      avatarURL: data[i].owner.avatar_url,
      lastCommit: lastCommit,
    }
    userContributions.push(contribution)
  }

  return userContributions
}

export const getCookies = (url: string) => {
  return Platform.OS === 'ios' ? CookieManager.getAll(true) : CookieManager.get(url)
}

export const clearCookies = () => {
  return Platform.OS === 'ios' ? CookieManager.clearAll(true) : CookieManager.clearAll()
}

type ObjectKeys<T> = T extends object ? keyof T : never

export const typedObjectKeys = <T extends object>(obj: T) => {
  return Object.keys(obj) as ObjectKeys<T>[]
}

export const toastAndroid = (message: string, duration = ToastAndroid.SHORT) => {
  Platform.OS === 'android' && ToastAndroid.show(message, duration)
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const fetchUtil = async (url: string, config: RequestInit = {}) => {
  const body = config.body ? JSON.stringify(config.body) : undefined
  const headers = config.headers ?? {}
  const method = (config.method ?? 'GET') as RequestMethod

  if (Platform.OS === 'android') {
    const fetchOptions: RequestInit = {
      method,
      ...config,
      headers,
    }
    return fetch(url, fetchOptions)
  } else if (Platform.OS === 'ios') {
    return RNFetchBlob.fetch(method, url, headers as Record<string, string>, body)
  } else {
    throw new Error('Unsupported platform')
  }
}

export const parseError = (error: unknown) =>
  error instanceof Error
    ? error
    : !isEmpty(error)
    ? new Error(JSON.stringify(error))
    : new Error(UNKOWN_ERROR)

export const isAndroid = () => Platform.OS === 'android'
export const isIOS = () => Platform.OS === 'ios'

interface ImageDimensions {
  width: number
  height: number
}

export const getImageDimensions = (
  source: ImageURISource | ImageRequireSource
): Promise<ImageDimensions> => {
  return new Promise((resolve, reject) => {
    if (typeof source === 'number') {
      return resolve(Image.resolveAssetSource(source))
    }

    const uri = source.uri

    if (typeof uri !== 'string') {
      reject(new Error('Invalid image source: ' + typeof uri))
    } else {
      Image.getSize(
        uri,
        (width, height) => {
          if (width > 0 && height > 0) {
            resolve({ width, height })
          } else {
            reject(new Error('Invalid image dimensions: width or height is zero.'))
          }
        },
        (error) => {
          reject(error)
        }
      )
    }
  })
}

export const getClaimsString = (claims: Claim[]) => {
  const numClaims = claims.length

  if (numClaims === 0) {
    return 'No claims'
  }

  if (numClaims === 1) {
    return `Claim with ${claims[0].provider}`
  }

  if (numClaims === 2) {
    return `Claim with ${claims[0].provider} and ${claims[1].provider}`
  }

  return `Claim with ${claims[0].provider} and ${numClaims - 1} others`
}

export const stringValue = (obj: Record<string, unknown>) => {
  for (const [, v] of Object.entries(obj)) {
    if (isString(v) || isNumber(v)) {
      return v
    }
  }
  return ''
}

export const awaitWithRetry = async <T>(
  promiseFn: () => Promise<T>,
  maxRetries: number
): Promise<T> => {
  try {
    return await promiseFn()
  } catch (error) {
    if (maxRetries > 0) {
      return await awaitWithRetry(promiseFn, maxRetries - 1)
    }
    throw error
  }
}
