import { track } from '@amplitude/analytics-react-native'

type EventName =
  | 'App Opened'
  | 'Link Creation Initiated'
  | 'Claim Addition initiated'
  | 'Name added'
  | 'Claim Added'
  | 'Proof generated'
  | 'Link created'
  | 'Link Copied'
  | 'Link Shared Other'
  | 'Template opened'
  | 'Submit'
  | 'Proof generation failed'
  | 'User error'
  | 'Metadata request timed out'
  | 'Claim creation exceeded the allotted time'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function trackEvent(eventName: EventName, properties?: any): void {
  if (process.env.NODE_ENV === 'production') {
    if (properties) {
      track(eventName, properties)
    } else {
      track(eventName)
    }
  }
}
