import auth from '@react-native-firebase/auth'
import crashlytics from '@react-native-firebase/crashlytics'
import { GoogleSignin } from '@react-native-google-signin/google-signin'

export async function googleLogin() {
  // Check if your device supports Google Play
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn()
    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken)
    // Sign-in the user with the credential

    const info = await auth().signInWithCredential(googleCredential)
    const tokens = await GoogleSignin.getTokens()

    return { email: info.user.email, accessToken: tokens.accessToken }
  } catch (e: unknown) {
    /* eslint-disable no-console */
    console.log(e)
    crashlytics().recordError(e as Error)
  }
}
