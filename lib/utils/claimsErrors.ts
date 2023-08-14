export const errors: [string, string][] = [
  ['UNAUTHENTICATED: Token expired', 'Authentication token expired. Please try again.'],
  ['session not found', 'A timeout occurred on the backend. Please try again.'],
  ['insert or update on table', 'Something went wrong (ERR003). Please try again.'],
  ['Provider not found', 'Invalid proof generation request. (ERR004)'],
  ['Invalid params', 'Invalid proof generation request. (ERR005)'],
  [
    'The listed users and repositories',
    'Permission denied to generate the proof (ERR006). Please try again.',
  ],
  ['Bad credentials', 'Permission denied to generate the proof (ERR007). Please try again.'],
  ['Claim info hash mismatch', 'Invalid argument. Please try again.'],
  ['session is not active', 'Error connecting to the server (ERR009). Please try again.'],
  ['PERMISSION_DENIED', 'Permission denied to generate the proof (ERR007). Please try again.'],
]

export function getErrorMessage(originalError: string | undefined): string {
  if (!originalError) {
    return ''
  }

  const matchedPair = errors.find(([firstColumn]) => originalError.includes(firstColumn))
  const result = matchedPair ? matchedPair[1] : originalError
  return result
}
