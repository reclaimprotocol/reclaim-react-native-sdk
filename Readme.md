![Reclaim Logo](https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/Logomark.png)
# Reclaim React Native SDK

This is a comprehensive guide to get you started with the `reclaim-react-native` SDK in your React Native project. 

`reclaim-react-native` SDK provides a way to let your users import data from other websites into your app in a secure, privacy preserving manner using zero knowledge proofs right in your React Native Application.

---

## 📚 Table of Contents
1. [Installation](#installation)
2. [Usage](#usage)

---

## 💻 Installation <a name="installation"></a>

Start by adding `reclaim-react-native` package and the peer dependencies in your package.json of your React Native project like below:

```jsx
    "@reclaimprotocol/reclaim-react-native": "^0.0.8",
    "@react-native-cookies/cookies": "^6.2.1",
    "react-native-webview": "^11.26.1",
    "react-native-svg": "^13.13.0"
```

Run `npm install` from your command line to install the added dependencies. Do not forget to Delete the `Podfile.lock` and install again using `pod install` in the ios folder.

## 🚀 Usage <a name="usage"></a>

Once you've installed the package and set up your configuration, import `ReclaimHttps` from '@reclaimprotocol/reclaim-https' and use it in your app like this:

```jsx
import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ReclaimHttps} from '@reclaimprotocol/reclaim-react-native';

function App(): JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = StyleSheet.create({
    container: {
      backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <SafeAreaView style={backgroundStyle.container}>
      <ReclaimHttps
        requestedProofs={[
          {
            url: 'https://bookface.ycombinator.com/home',
            loginUrl: 'https://bookface.ycombinator.com/home',
            loginCookies: ['_sso.key'], 
            responseSelections: [
              {
                responseMatch:
                  '\\{"id":{{YC_USER_ID}},.*?waas_admin.*?:{.*?}.*?:\\{.*?}.*?(?:full_name|first_name).*?}',
              },
            ],
          },
        ]}
        // context="Proving on 2023 for eth India" 
        title="YC Login"
        subTitle="Prove you have a YC Login"
        cta="Prove"
        onSuccess={proofs => {
          /*do something*/
          console.log('proofs', proofs);
        }}
        onFail={e => {
          /*do something*/
          console.log('Error', e);
        }}
        buttonStyle={{backgroundColor: 'black'}}
        buttonTextStyle={{color: 'blue'}}
        onStatusChange={(text: string) => {
          console.log("from on Status change, the status is: ", text);
        }}
      />
    </SafeAreaView>
  );
}

export default App;
```
Here's a description of each property ReclaimHttps accepts:

- `url`: The URL from where the information is to be extracted. This is typically the webpage where the user's data is located.
- `loginUrl`: The URL where the user can log in to access the information. If authentication is required to access the data, the user will be redirected to this URL for login.
- `loginCookies`: An array of cookie names required for authentication. If the webpage uses cookies for authentication, you can specify the names of those cookies here. These cookies will be passed along with the request to the url.
- `responseMatch`: A regular expression to extract specific information from the webpage. If you only need to extract a specific piece of information from the webpage, you can specify a regex pattern here. The SDK will search for this pattern in the HTML of the webpage and extract the matching content.
- `context`: Context message for the proof request (Optional)
- `title`: The name of your application.
- `subTitle`: The sub title of the component button, usually a short description about the claim.
- `cta`: The title of cta button.
- `onSuccess`: A Function that returns proofs after success.
- `onFail`: A Function that returns Error when the proof generation fails.
- `showShell`: A boolean to show the shell of the component, default is true (Optional)
- `hideButton`: A boolean to hide the button (Optional)
- `style`: A style object to style the outer html of the component (Optional)
- `buttonStyle`: A style object to style the button (Optional)
- `buttonTextStyle`: A style object to style the button text (Optional)
- `onStatusChange`: A callback function that enables the component to inform you of changes in the status of claim creatio (Optional)