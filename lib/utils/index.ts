import messages from '@app/lib/messages.json'
import { ProviderType } from '@app/providers'
import { Claim } from '@app/redux/links/types'

export const stringifyClaims = (claims: Claim[]) => {
  if (claims.length > 2) {
    return (
      claims[0].provider +
      ', ' +
      claims[1].provider +
      ` ${messages.common.and} ` +
      (claims.length - 2) +
      ` ${messages.common.more}`
    )
  } else {
    return claims.map((claim) => claim.provider).join(', ')
  }
}

export const getUnixTimestampInSec = () => Math.floor(Date.now() / 1000)

export const getMonthAndDate = (timestampS: number) => {
  const date = new Date(timestampS * 1000)
  return `${MONTH_MAP[date.getMonth()]} ${date.getDate()}`
}

const MONTH_MAP: { [key: number]: string } = {
  0: 'Jan',
  1: 'Feb',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11: 'Dec',
}

export const getProviderType = (provider: string) => provider.split('-')[0] as ProviderType

export const isString = (val: unknown): val is string => {
  return (val as string) !== undefined
}
