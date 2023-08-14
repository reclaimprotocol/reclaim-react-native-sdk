![Reclaim Logo](https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/Logomark.png)
# Reclaim React Native SDK

This is a comprehensive guide to get you started with the `reclaim-react-native` SDK in your React Native project. 

`reclaim-react-native` SDK provides a way to let your users import data from other websites into your app in a secure, privacy preserving manner using zero knowledge proofs right in your React Native Application.

---

## 📚 Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Dependencies](#dependencies)
4. [Usage](#usage)

---

## 💻 Installation <a name="installation"></a>

Start by installing `reclaim-react-native` package in your React Native project using npm:

```bash
npm i @reclaimprotocol/reclaim-react-native
```

Once installed, make sure to add the following configurations:

**Babel Preset and Plugins**

In your Babel configuration file (`babel.config.js`), update the presets and plugins:

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

## 🔧 Configuration <a name="configuration"></a>

**Update Mock Modules**

Update the Metro configuration for React Native in `metro.config.js` file as follows:

```jsx
const path = require('path');
const nodeModulesPaths = [path.resolve(path.join(__dirname, './node_modules'))];
// mock for all the modules we aren't using
const MOCK_MODULE = path.resolve(__dirname, 'node_modules/url');

module.exports = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    nodeModulesPaths,
    extraNodeModules: {
      // Redirect react-native to react-native-web
      net: path.resolve(__dirname, 'node_modules/react-native-tcp-socket'),
      crypto: path.resolve(__dirname, 'node_modules/react-native-crypto'),
      http: MOCK_MODULE, // path.resolve(__dirname, 'node_modules/stream-http'),
      buffer: path.resolve(__dirname, 'node_modules/buffer/'),
      https: MOCK_MODULE, //path.resolve(__dirname, 'node_modules/https-browserify'),
      zlib: path.resolve(__dirname, 'node_modules/browserify-zlib'),
      stream: path.resolve(__dirname, 'node_modules/stream-browserify'),
      tls: path.resolve(__dirname, 'node_modules/react-native-tcp-socket'),
      util: path.resolve(__dirname, 'node_modules/util'),
      dns: MOCK_MODULE, //path.resolve(__dirname, 'node_modules/dns.js'),
      http2: MOCK_MODULE, //path.resolve(__dirname, 'node_modules/http2'),
      url: path.resolve(__dirname, 'node_modules/url'),
      assert: path.resolve(__dirname, 'node_modules/assert'),
      events: path.resolve(__dirname, 'node_modules/events'),
      fs: MOCK_MODULE, // path.resolve(__dirname, 'node_modules/react-native-level-fs'),
      dgram: MOCK_MODULE, // path.resolve(__dirname, 'node_modules/react-native-udp'),
      os: path.resolve(__dirname, 'node_modules/react-native-os'),
      path: path.resolve(__dirname, 'node_modules/path-browserify'),
      constants: path.resolve(__dirname, 'node_modules/constants-browserify'),

      perf_hooks: MOCK_MODULE,

      child_process: MOCK_MODULE,
    },
  },
  // options for reading data outside root react-native folder
  projectRoot: __dirname,
  watchFolders: [__dirname],
};
```

**Update Crypto Implementation**

In a file called `resolver.js` at the root of your project, add the following code to redirect `pbkdf2` calls to 'react-native-quick-crypto'

```jsx
const crypto = require('react-native-quick-crypto')
exports.pbkdf2 = crypto.pbkdf2Sync
```

## 📦 Dependencies <a name="dependencies"></a>

Modify the package.json file with the following dependencies (we do this explicitly as pods install does not detect nested node modules):

```jsx
    "@azure/core-asynciterator-polyfill": "^1.0.2",
    "@ethersproject/shims": "^5.7.0",
    "@gorhom/bottom-sheet": "^4.4.5",
    "@react-native-async-storage/async-storage": "^1.18.1",
    "@react-native-cookies/cookies": "^6.2.1",
    "@reclaimprotocol/common-grpc-web-transport": "github:questbook/common-grpc-web-transport",
    "@reclaimprotocol/crypto-sdk": "^1.4.0",
    "@reclaimprotocol/reclaim-client-sdk": "^0.0.8",
    "@reclaimprotocol/reclaim-node": "^1.0.2",
    "@reclaimprotocol/reclaim-sdk": "^4.7.0",
    "@reclaimprotocol/reclaim-zk": "^1.0.0",
    "@reduxjs/toolkit": "^1.9.2",
    "@stablelib/chacha20poly1305": "^1.0.1",
    "assert": "^2.0.0",
    "babel-plugin-module-resolver": "^5.0.0",
    "base-64": "^1.0.0",
    "browserify-zlib": "^0.2.0",
    "buffer": "git+https://github.com/jrschumacher/buffer#add-base64url-support",
    "canonicalize": "^2.0.0",
    "constants-browserify": "^1.0.0",
    "dns.js": "^1.0.1",
    "ethers": "^5.7.2",
    "events": "^3.3.0",
    "http2": "^3.3.7",
    "https-browserify": "^1.0.0",
    "jsdom-jscore-rn": "^0.1.8",
    "lodash": "^4.17.21",
    "minisearch": "^6.1.0",
    "net": "^1.0.2",
    "nice-grpc-web": "^2.0.2",
    "patch-package": "^6.5.1",
    "path-browserify": "^1.0.1",
    "pluralize": "^8.0.0",
    "process": "^0.11.10",
    "react-minisearch": "^6.0.2",
    "react-native-camera": "^4.2.1",
    "react-native-code-push": "^8.0.0",
    "react-native-crypto": "^2.2.0",
    "react-native-dotenv": "^3.4.7",
    "react-native-fs": "^2.20.0",
    "react-native-gesture-handler": "^2.9.0",
    "react-native-get-random-values": "^1.8.0",
    "react-native-html-parser": "^0.1.0",
    "react-native-level-fs": "^3.0.1",
    "react-native-os": "^1.2.6",
    "react-native-permissions": "^3.6.1",
    "react-native-quick-crypto": "^0.6.1",
    "react-native-randombytes": "^3.6.1",
    "react-native-safe-area-context": "^4.5.0",
    "react-native-screens": "^3.19.0",
    "react-native-svg": "^13.8.0",
    "react-native-tcp-socket": "^6.0.6",
    "react-native-toast-message": "^2.1.6",
    "react-native-udp": "^4.1.7",
    "react-native-uuid": "^2.0.1",
    "react-native-version-check": "^3.4.7",
    "react-native-webview": "^11.26.1",
    "react-redux": "^8.0.5",
    "readable-stream": "^1.0.33",
    "redux": "^4.2.1",
    "redux-persist": "^6.0.0",
    "rn-fetch-blob": "^0.12.0",
    "sha3": "^2.1.4",
    "stream-browserify": "^3.0.0",
    "styled-components": "^5.3.6",
    "tls-browserify": "^0.2.2",
    "uri-scheme": "^1.1.0",
    "url": "^0.11.0",
    "util": "^0.12.5",
    "vm-browserify": "^0.0.4",
    "xpath": "^0.0.32"

    // Your other dependencies...
```

Run `npm install` in your React Native project to install all the dependencies.

**For iOS only**: Delete `Podfile.lock` from your project’s `ios` folder and then run `pod install` inside your `ios` folder to install all the updated dependencies.

## 🚀 Usage <a name="usage"></a>

Once you've installed the package and set up your configuration, import `ReclaimHttps` from '@reclaimprotocol/reclaim-https' and use it in your app like this:

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
