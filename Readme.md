# Reclaim-React-Native :rocket:

This is an SDK that brings powerful capabilities of the `reclaim-react-native` library into your React Native project. It empowers your app with the features and capabilities of reclaim protocol making your app stand ahead in terms of user experience and performance.

## Table of Contents

- [Getting Started](#getting-started)
- [Installation](#installation)
- [Importing the SDK](#importing-the-sdk)
- [Example](#example)
- [Dependencies](#dependencies)

## Getting Started :hammer_and_wrench:

Set up your react-native project by following the installation steps provided.

## Installation :floppy_disk:

Start by installing the `reclaim-react-native` package into your React Native project using npm:

```
npm i @reclaimprotocol/reclaim-react-native
```

You'll also need to configure babel using this configuration snippet:

```jsx
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        alias: {
          '@app': './src',
          '@ethersproject/pbkdf2': './resolver.js',
        },
      },
    ],
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        path: '.env',
      },
    ],
  ],
}
```

Make sure to update the Metro configuration for React Native. Find the configuration details [here](metro-config.js).

You may also have to create a file called `resolver.js` with the following code:

```jsx
const crypto = require('react-native-quick-crypto')
exports.pbkdf2 = crypto.pbkdf2Sync
```

And finally, ensure that your `package.json` contains these dependencies. You can find them [here](package.json).

After adding all the dependencies go ahead and run:

```
npm install
```

Once everything is set up well, delete `Podfile.lock` from your project’s **`ios`** folder and run:

```
pod install
```

Let's move onto using the SDK now.

## Importing the SDK :open_file_folder:

`reclaim-react-native` can be imported into your React Native project like any other dependency:

```jsx
import {ReclaimHttps} from '@reclaimprotocol/reclaim-https';
```

## Example :page_with_curl:

Here is an example of how you can use it in your `app.tsx`:

```jsx
import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ReclaimHttps} from '@reclaimprotocol/reclaim-https';

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
      />
    </SafeAreaView>
  );
}

export default App;
```

## Dependencies :mag:

This SDK makes use of certain other dependencies to function properly. Make sure you install them in your project by adding them to the dependencies section of your package.json file [here](package.json).

And that's it, you're ready to use `reclaim-react-native`! If you find any bugs or have a feature request, please open an issue on [github](https://github.com/example)!