import '@azure/core-asynciterator-polyfill';
import './shim.js';
import 'react-native-get-random-values';
import * as React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import WebView from 'react-native-webview';
import {Dimensions} from 'react-native';
import CookieManager from '@react-native-cookies/cookies';
import {
  getBeacon,
  getWalletFromPrivateKey,
  REACT_NATIVE_TLS_CRYPTO,
  generateWallet,
} from './lib/utils/crypto';
import {useWebviewZkOperator} from './lib/webviewRpc/webviewZkOperator';
import {
  createClaim,
  CreateStep,
  ProviderName,
} from '@reclaimprotocol/reclaim-node';
import {WebViewRPCProvider} from './lib/webviewRpc/webviewRpc';
import {WebViewCryptoProvider} from './lib/webviewRpc/webViewCryptoProvider';
import {SHA3} from 'sha3';
import {ZKOperator} from '@reclaimprotocol/circom-chacha20';
import {reclaimprotocol} from '@reclaimprotocol/reclaim-sdk';
import {Pressable} from 'react-native';
import {backIconXml} from './assets/svgs';
import {SvgXml} from 'react-native-svg';
import LoadingSpinner from './LoadingSpinner';

const FontFamily = {
  qBBodyEmphasized: 'Manrope-Bold',
  manropeMedium: 'Manrope-Medium',
};
/* font sizes */
const FontSize = {
  qBBodyEmphasized_size: 15,
  size_smi: 13,
  qBH2_size: 20,
};
/* Colors */
const Color = {
  qBLightAccentColor: '#332fed',
  white: '#fff',
  black: '#000',
};
/* Paddings */
const Padding = {
  p_xl: 20,
  p_base: 16,
};
/* border radiuses */
const Border = {
  br_xs: 12,
};

type Props = {
  requestedProofs: {
    url: string;
    loginUrl: string;
    loginCookies: string[];
    responseSelections: {
      responseMatch: string;
    }[];
  }[];
  title: string;
  subTitle: string;
  cta: string;
  onSuccess: (proofs: any[]) => void;
  onFail: (e: any) => void;
  context?: string;
};

const injection = `
  window.ReactNativeWebView.postMessage(document.documentElement.outerHTML)
`;

async function createClaimHttp(
  zkOperator: ZKOperator,
  claimParams: {
    url: any;
    loginUrl?: string;
    loginCookies?: string[];
    responseSelections: any;
  },
  cookie: string,
  title: string,
  responseMatch: string,
  extractedParams: {},
  onSuccess: {
    (proofs: any[]): void;
    (
      arg0: {
        onChainClaimId: string;
        templateClaimId: string;
        provider: string;
        parameters: string;
        chainId: number;
        ownerPublicKey: string;
        timestampS: string;
        witnessAddresses: string[];
        signatures: string[];
        redactedParameters: string;
        extractedParameterValues: {};
        sessionId: any;
        context: string;
        epoch: number;
        identifier: string;
      }[],
    ): void;
  },
  onFail: {(e: Error): void; (arg0: string): void},
  setDisplayError: {
    (value: React.SetStateAction<string>): void;
    (arg0: string): void;
  },
  setDisplayProcess: {
    (value: React.SetStateAction<string>): void;
    (arg0: string): void;
  },
  theContext?: string,
) {
  setDisplayProcess('Intiating Claim Creation');
  const claimName: ProviderName = 'http';
  const params = {
    method: 'GET',
    responseSelections: [
      {
        responseMatch: responseMatch,
      },
    ],
    url: claimParams.url,
  };
  // console.log('params', params);
  const secretParams = {
    cookieStr: cookie,
  };
  const {publicKey, privateKey} = await generateWallet();
  const ephemeralWallet = getWalletFromPrivateKey(privateKey);
  // console.log('ephemeralWallet', ephemeralWallet);
  const hash = new SHA3(512);
  const hashString = title;
  hash.update(hashString);

  const sessionId = '';
  const context =
    theContext ||
    JSON.stringify({
      contextAddress: ephemeralWallet.address,
      contextMessage: hash.digest('hex'),
      sessionId: '',
    });

  // console.log('This is the context', context);
  const ownerPrivateKey = ephemeralWallet.privateKey;
  const beacon = getBeacon();
  try {
    const response = await createClaim({
      name: claimName,
      params,
      secretParams,
      additionalConnectOpts: {
        crypto: REACT_NATIVE_TLS_CRYPTO, // Be sure this is defined
      },
      sessionId,
      context,
      zkOperator,
      beacon,
      didUpdateCreateStep: (step: CreateStep) => {
        if (step.name === 'creating') {
          setDisplayProcess('Creating Claim');
        }

        if (step.name === 'witness-done') {
          setDisplayProcess('Claim Created Successfully');
        }
        console.log('Step:', step.name);
      },
      ownerPrivateKey,
    });

    // console.log('Response:', response);
    const reclaim = new reclaimprotocol.Reclaim();
    const isProofsCorrect = await reclaim.verifyCorrectnessOfProofs('', [
      {
        templateClaimId: '0',
        provider: 'http',
        parameters: response.claimData.parameters,
        ownerPublicKey: publicKey,
        timestampS: String(response.claimData.timestampS),
        witnessAddresses: response.witnessHosts,
        signatures: response.signatures,
        redactedParameters: response.claimData.parameters,
        extractedParameterValues: extractedParams,
        context: response.claimData.context,
        epoch: response.claimData.epoch,
        identifier: response.claimData.identifier,
      },
    ]);
    if (isProofsCorrect) {
      onSuccess([
        {
          onChainClaimId: '0',
          templateClaimId: '0',
          provider: 'http',
          parameters: response.claimData.parameters,
          chainId: 420,
          ownerPublicKey: publicKey,
          timestampS: String(response.claimData.timestampS),
          witnessAddresses: response.witnessHosts,
          signatures: response.signatures,
          redactedParameters: response.claimData.parameters,
          extractedParameterValues: extractedParams,
          context: response.claimData.context,
          epoch: response.claimData.epoch,
          identifier: response.claimData.identifier,
        },
      ]);
    } else {
      onFail('Claim Creation Failed');
    }
    // console.log('isProofsCorrect', isProofsCorrect);
  } catch (error) {
    onFail(`Error generating claim: ${error}`);
    setDisplayError(`Error generating claim: ${error}`);
  }
}

export default function ReclaimHttps({
  requestedProofs,
  title,
  subTitle,
  cta,
  context,
  onSuccess,
  onFail,
}: Props) {
  const [webViewVisible, setWebViewVisible] = React.useState(false);
  const [cookie, setCookie] = React.useState('');
  const [webViewUrl, setWebViewUrl] = React.useState(
    requestedProofs[0].loginUrl,
  );
  let ScreenHeight = Dimensions.get('window').height;
  let ScreenWidth = Dimensions.get('window').width;
  const [displayError, setDisplayError] = React.useState('');
  const [displayProcess, setDisplayProcess] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const ref = React.useRef<WebView>();
  const zkOperator = useWebviewZkOperator();
  function parseHtml(html: string, regexString: string) {
    // replace {{VARIABLE}} with (.*?), and save the variable names
    const variableNames: string[] = [];
    const realRegexString = regexString.replace(
      /{{(.*?)}}/g,
      (match, variableName) => {
        variableNames.push(variableName);
        return '(.*?)';
      },
    );

    // create a RegExp object
    const regex = new RegExp(realRegexString, 's');

    // run the regex on the html
    const match = html.match(regex);

    if (!match) {
      setWebViewVisible(false);
      setDisplayError('Regex does not match');
      throw Error('regex doesnt match');
    }

    // replace the variable placeholders in the original regex string with their values
    let result = regexString;
    const params: {[key: string]: string | number} = {};
    for (let i = 0; i < variableNames.length; i++) {
      result = result.replace(`{{${variableNames[i]}}}`, match[i + 1]);
      params[variableNames[i]] = match[i + 1];
    }

    return {result, params};
  }

  const onClickListener = () => {
    // Add the action to be performed on button click
    setWebViewVisible(true);
  };

  function extractHostname(url: string): string {
    let hostname;
    // Find & remove protocol (http, ftp, etc.) and get the hostname
    if (url.indexOf('//') > -1) {
      hostname = url.split('/')[2];
    } else {
      hostname = url.split('/')[0];
    }
    // find & remove port number
    hostname = hostname.split(':')[0];
    // find & remove "?"
    hostname = hostname.split('?')[0];
    // Remove www.
    hostname = hostname.replace('www.', '');

    return hostname;
  }
  const getCookies = (url: string) => {
    return Platform.OS === 'ios'
      ? CookieManager.getAll(true)
      : CookieManager.get(url);
  };

  return (
    <WebViewRPCProvider>
      <WebViewCryptoProvider>
        <View>
          {webViewVisible ? (
            <>
              <View style={styles.providerHeaderContainer}>
                <TouchableOpacity onPress={() => setWebViewVisible(false)}>
                  <Pressable onPress={() => setWebViewVisible(false)}>
                    <SvgXml xml={backIconXml} />
                  </Pressable>
                </TouchableOpacity>

                <View style={styles.providerHeader}>
                  <Text style={styles.providerHeading}>Sign in to verify</Text>
                  <Text style={styles.providerSubheading}>
                    {extractHostname(webViewUrl)}
                  </Text>
                </View>
                {loading ? <LoadingSpinner /> : <Text> </Text>}
              </View>
              <WebView
                source={{uri: webViewUrl}}
                thirdPartyCookiesEnabled={true}
                ref={ref}
                setSupportMultipleWindows={false}
                userAgent={
                  Platform.OS === 'android'
                    ? 'Chrome/18.0.1025.133 Mobile Safari/535.19'
                    : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75'
                }
                style={{height: ScreenHeight, width: ScreenWidth}}
                onNavigationStateChange={async navState => {
                  if (navState.loading) {
                    return;
                  }
                  setLoading(false);
                  const res = await getCookies(requestedProofs[0].loginUrl);

                  const foundCookies: string[] = [];
                  const found = requestedProofs[0].loginCookies.every(
                    cookie => {
                      // eslint-disable-next-line no-extra-boolean-cast
                      if (!!res[cookie]) {
                        foundCookies.push(cookie);
                      }

                      return !!res[cookie];
                    },
                  );
                  if (found) {
                    try {
                      const cookieStr = Object.values(res)
                        .map(c => `${c.name}=${c.value}`)
                        .join('; ');

                      setCookie(cookieStr);
                      setLoading(true);
                      setWebViewUrl(requestedProofs[0].url);
                      if (navState.url === requestedProofs[0].url) {
                        ref.current?.injectJavaScript(injection);
                        return;
                      }
                    } catch (error) {
                      console.log('error getting cookies: ', error);
                    }
                  }
                }}
                onMessage={async event => {
                  try {
                    // console.log(requestedProofs[0].responseSelections);
                    const extractedRegex =
                      requestedProofs[0].responseSelections.map(
                        responseSelection => ({
                          ...responseSelection,
                          responseMatch: parseHtml(
                            event.nativeEvent.data,
                            responseSelection.responseMatch,
                          ).result,
                        }),
                      );

                    const extractedParams =
                      requestedProofs[0].responseSelections.reduce(
                        (pre, curr) => ({
                          ...pre,
                          ...parseHtml(
                            event.nativeEvent.data,
                            curr.responseMatch,
                          ).params,
                        }),
                        {},
                      );
                    setWebViewVisible(false);
                    createClaimHttp(
                      zkOperator,
                      requestedProofs[0],
                      cookie,
                      title,
                      extractedRegex[0].responseMatch,
                      extractedParams,
                      onSuccess,
                      onFail,
                      setDisplayError,
                      setDisplayProcess,
                      context,
                    );
                  } catch (error) {
                    console.log('error getting cookies: ', error);
                  }
                }}
              />
            </>
          ) : (
            <View style={styles.reclaimHttpsCard}>
              <View style={[styles.row, styles.rowFlexBox]}>
                <View style={styles.rowInner}>
                  <View style={styles.frameChildLayout}>
                    <Image
                      style={styles.icon}
                      resizeMode="cover"
                      source={{
                        uri: 'https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/Logomark.png',
                      }}
                    />
                    <View style={styles.poweredByReclaimProtocolWrapper}>
                      <Text
                        style={[
                          styles.poweredByReclaim,
                          styles.proveYouHaveTypo,
                        ]}>
                        Powered by Reclaim Protocol
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={[styles.googleLoginParent, styles.contentSpaceBlock]}>
                <Text style={[styles.googleLogin, styles.labelTypo]}>
                  {title}
                </Text>
                <View style={styles.proveYouHaveAGoogleLoginWrapper}>
                  <Text style={[styles.proveYouHave, styles.proveYouHaveTypo]}>
                    {subTitle}
                  </Text>
                </View>
              </View>
              <View style={[styles.buttonWrapper, styles.rowFlexBox]}>
                {displayError ? (
                  <Text style={[styles.displayError]}>{displayError}</Text>
                ) : displayProcess ? (
                  <Text style={[styles.displayProcess]}>{displayProcess}</Text>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.5}
                    onPress={onClickListener}
                    style={[styles.button, styles.buttonFlexBox]}>
                    <View style={[styles.content, styles.buttonFlexBox]}>
                      <Text style={[styles.label, styles.labelTypo]}>
                        {cta}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      </WebViewCryptoProvider>
    </WebViewRPCProvider>
  );
}

const ScreenHeight = Dimensions.get('window').height;
const ScreenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  rowFlexBox: {
    padding: Padding.p_base,
    flexDirection: 'row',
    alignSelf: 'stretch',
  },
  frameChildLayout: {
    height: 40,
    width: 40,
  },
  proveYouHaveTypo: {
    width: 322,
    textAlign: 'left',
    fontFamily: FontFamily.manropeMedium,
    fontWeight: '500',
    lineHeight: 16,
    fontSize: FontSize.size_smi,
  },
  contentSpaceBlock: {
    paddingVertical: 0,
    alignSelf: 'stretch',
  },
  labelTypo: {
    fontFamily: FontFamily.qBBodyEmphasized,
    fontWeight: '700',
    textAlign: 'left',
  },
  buttonFlexBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameChild: {
    top: 0,
    left: 0,
    position: 'absolute',
  },
  icon: {
    top: 6,
    left: 4,
    width: 30,
    height: 30,
    position: 'absolute',
  },
  poweredByReclaim: {
    color: 'rgba(198, 198, 198, 0.9)',
  },
  poweredByReclaimProtocolWrapper: {
    top: 13,
    left: 145,
    width: 180,
    position: 'absolute',
  },
  rowInner: {
    justifyContent: 'center',
    flex: 1,
  },
  row: {
    justifyContent: 'flex-end',
  },
  googleLogin: {
    fontSize: FontSize.qBH2_size,
    lineHeight: 24,
    color: Color.black,
  },
  proveYouHave: {
    color: 'rgba(0, 0, 0, 0.6)',
  },
  proveYouHaveAGoogleLoginWrapper: {
    marginTop: 8,
    alignSelf: 'stretch',
  },
  googleLoginParent: {
    paddingHorizontal: Padding.p_base,
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.qBBodyEmphasized_size,
    lineHeight: 20,
    color: Color.white,
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: Padding.p_xl,
    paddingVertical: 0,
    alignSelf: 'stretch',
    flexDirection: 'row',
  },
  button: {
    borderRadius: Border.br_xs,
    backgroundColor: Color.qBLightAccentColor,
    height: 48,
    flex: 1,
    overflow: 'hidden',
  },
  buttonWrapper: {
    overflow: 'hidden',
  },
  reclaimHttpsCard: {
    borderRadius: 16,
    backgroundColor: Color.white,
    shadowColor: 'rgba(0, 0, 0, 0.08)',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    elevation: 16,
    shadowOpacity: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    width: 358,
    overflow: 'hidden',
  },
  container: {
    width: ScreenWidth,
    height: ScreenHeight,
  },
  displayError: {
    color: 'rgba(255, 0, 0, 1)',
  },
  displayProcess: {
    color: 'grey',
  },
  topBar: {
    height: 50,
    width: ScreenWidth,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  webView: {
    width: ScreenWidth,
    height: ScreenHeight - 50, // Subtract the height of the top bar
  },

  providerHeaderContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  providerHeader: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    height: 20,
    gap: 2,
  },
  providerHeading: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '700',
    color: '#202124',
  },
  providerSubheading: {
    paddingLeft: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.6)',
  },
});
