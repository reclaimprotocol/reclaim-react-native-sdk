import * as React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
  ViewStyle,
  StyleProp,
} from "react-native";
import WebView from "react-native-webview";
import { Dimensions } from "react-native";
import CookieManager from "@react-native-cookies/cookies";
import { Pressable } from "react-native";
import { backIconXml } from "./assets/svgs";
import { SvgXml } from "react-native-svg";
import LoadingSpinner from "./LoadingSpinner";

const FontFamily = {
  qBBodyEmphasized: "Manrope-Bold",
  manropeMedium: "Manrope-Medium",
};
/* font sizes */
const FontSize = {
  qBBodyEmphasized_size: 15,
  size_smi: 13,
  qBH2_size: 20,
};
/* Colors */
const Color = {
  qBLightAccentColor: "#332fed",
  white: "#fff",
  black: "#000",
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
  onFail: (e: Error) => void;
  context?: string;
  showShell?: boolean;
  buttonColor?: string;
  buttonTextColor?: string;
  style?: StyleProp<ViewStyle>;
};

const injection = `
  window.ReactNativeWebView.postMessage(document.documentElement.outerHTML)
`;

export default function ReclaimHttps({
  requestedProofs,
  title,
  subTitle,
  cta,
  context,
  onSuccess,
  onFail,
  showShell,
  buttonColor,
  buttonTextColor,
  style,
}: Props) {
  const [webViewVisible, setWebViewVisible] = React.useState(false);
  const [cookie, setCookie] = React.useState("");
  const [webViewUrl, setWebViewUrl] = React.useState(
    requestedProofs[0].loginUrl
  );
  let ScreenHeight = Dimensions.get("window").height;
  let ScreenWidth = Dimensions.get("window").width;
  const [displayError, setDisplayError] = React.useState("");
  const [displayProcess, setDisplayProcess] = React.useState("");
  const [extractedRegexState, setExtractedRegexState] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [address, setAddress] = React.useState("");
  const [runonce, setRunonce] = React.useState(false);
  const [publicKey, setPublicKey] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");
  const [extractedParams, setExtractedParams] = React.useState({});
  const ref = React.useRef<WebView>();
  const walletRef = React.useRef<WebView>();
  const claimRef = React.useRef<WebView>();

  function parseHtml(html: string, regexString: string) {
    // replace {{VARIABLE}} with (.*?), and save the variable names
    const variableNames: string[] = [];
    const realRegexString = regexString.replace(
      /{{(.*?)}}/g,
      (match, variableName) => {
        variableNames.push(variableName);
        return "(.*?)";
      }
    );

    // create a RegExp object
    const regex = new RegExp(realRegexString, "s");

    // run the regex on the html
    const match = html.match(regex);

    if (!match) {
      setWebViewVisible(false);
      setDisplayError("Regex does not match");
      onFail(Error("Regex does not match"));
      throw Error("regex doesnt match");
    }

    // replace the variable placeholders in the original regex string with their values
    let result = regexString;
    const params: { [key: string]: string | number } = {};
    for (let i = 0; i < variableNames.length; i++) {
      result = result.replace(`{{${variableNames[i]}}}`, match[i + 1]);
      params[variableNames[i]] = match[i + 1];
    }

    return { result, params };
  }

  const onClickListener = () => {
    // Add the action to be performed on button click
    setWebViewVisible(true);
    // console.log('Button clicked!');
  };

  function extractHostname(url: string): string {
    let hostname;
    // Find & remove protocol (http, ftp, etc.) and get the hostname
    if (url.indexOf("//") > -1) {
      hostname = url.split("/")[2];
    } else {
      hostname = url.split("/")[0];
    }
    // find & remove port number
    hostname = hostname.split(":")[0];
    // find & remove "?"
    hostname = hostname.split("?")[0];
    // Remove www.
    hostname = hostname.replace("www.", "");

    return hostname;
  }
  const getCookies = (url: string) => {
    return Platform.OS === "ios"
      ? CookieManager.getAll(true)
      : CookieManager.get(url);
  };

  return (
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
            source={{ uri: webViewUrl }}
            thirdPartyCookiesEnabled={true}
            // @ts-ignore
            ref={ref}
            setSupportMultipleWindows={false}
            userAgent={
              Platform.OS === "android"
                ? "Chrome/18.0.1025.133 Mobile Safari/535.19"
                : "AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75"
            }
            style={{ height: ScreenHeight, width: ScreenWidth }}
            onNavigationStateChange={async (navState) => {
              if (runonce) {
                return;
              }
              // console.log('navState.url', navState.url);
              if (navState.loading) {
                return;
              }
              setLoading(false);
              const res = await getCookies(requestedProofs[0].loginUrl);

              const foundCookies: string[] = [];
              const found = requestedProofs[0].loginCookies.every((hcookie) => {
                // eslint-disable-next-line no-extra-boolean-cast
                if (!!res[hcookie]) {
                  foundCookies.push(hcookie);
                }

                return !!res[hcookie];
              });
              if (found) {
                try {
                  const cookieStr = Object.values(res)
                    .map((c) => `${c.name}=${c.value}`)
                    .join("; ");

                  // console.log('cookie', cookieStr);
                  setCookie(cookieStr);
                  setLoading(true);
                  setWebViewUrl(requestedProofs[0].url);
                  if (navState.url === requestedProofs[0].url) {
                    ref.current?.injectJavaScript(injection);
                    return;
                  }
                } catch (error) {
                  setDisplayError("Error generating claim");
                  setWebViewVisible(false);
                  onFail(Error("Error creating claim"));
                }
              }
            }}
            onMessage={async (event) => {
              // console.log('webViewUrl', webViewUrl);
              // console.log('event data', event.nativeEvent.data);

              try {
                // console.log(requestedProofs[0].responseSelections);
                const theExtractedRegex =
                  requestedProofs[0].responseSelections.map(
                    (responseSelection) => ({
                      ...responseSelection,
                      responseMatch: parseHtml(
                        event.nativeEvent.data,
                        responseSelection.responseMatch
                      ).result,
                    })
                  );

                const theExtractedParams =
                  requestedProofs[0].responseSelections.reduce(
                    (pre, curr) => ({
                      ...pre,
                      ...parseHtml(event.nativeEvent.data, curr.responseMatch)
                        .params,
                    }),
                    {}
                  );
                // setExtractedRegexState(extractedRegex[0].responseMatch);
                // setExtractedParamsState(extractedParams[])
                // console.log('extractedParams', theExtractedParams);
                // console.log('extractedRegex', theExtractedRegex);
                setExtractedParams(theExtractedParams);
                // setWebViewVisible(false);
                // createClaimHttp(
                //   zkOperator,
                //   requestedProofs[0],
                //   cookie,
                //   title,
                //   extractedRegex[0].responseMatch,
                //   extractedParams,
                //   onSuccess,
                //   onFail,
                //   setDisplayError,
                //   setDisplayProcess,
                //   context,
                // );
                //injecthere
                // const wallet = ethers.Wallet.createRandom();
                setRunonce(true);
                setDisplayProcess("Intiating Claim Creation");
                setWebViewVisible(false);
                return;
              } catch (error) {
                setWebViewVisible(false);
                setDisplayError("Claim Creation Failed");
                onFail(Error("Claim Creation Failed"));
              }
            }}
          />
        </>
      ) : (
        <View style={StyleSheet.flatten([styles.reclaimHttpsCard, style])}>
          <WebView
            // @ts-ignore
            ref={walletRef}
            onMessage={(event) => {
              const { data } = event.nativeEvent;
              const parsedWallet = JSON.parse(data);
              setAddress(parsedWallet.address);
              setPrivateKey(parsedWallet.privateKey);
              setPublicKey(parsedWallet.publicKey);
              // console.log('Wallet Info', data);
            }}
            // Loading ethers library from CDN and an empty HTML body
            source={{
              html: '<script src="https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/ethers.js"></script><body></body>',
            }}
            onLoadEnd={() => {
              if (!runonce) {
                // console.log('injected');
                walletRef.current?.injectJavaScript(
                  `
                // This function will be called once ethers library is loaded
                function createWallet() {
                  var wallet = ethers.Wallet.createRandom();
                  var address = wallet.address;
                  var privateKey = wallet.privateKey;
        
                  // Get publicKey from privateKey
                  var publicKey = ethers.utils.computePublicKey(privateKey, true); 
        
                  // Send the wallet info to React Native
                  window.ReactNativeWebView.postMessage(JSON.stringify({ 
                    address, 
                    privateKey,
                    publicKey
                  }));
                }
                
                // Checking if ethers is loaded already
                if (window.ethers) {
                  createWallet();
                } else { 
                  // If not, we'll add an event listener to call createEthereumWallet once the script is loaded.
                  window.addEventListener('load', createWallet);
                }
                `
                );
              }
            }}
            javaScriptEnabled
            style={{ width: 0, height: 0 }} // Make the WebView invisible
          />
          <WebView
            source={{ uri: "https://sdk-rpc.reclaimprotocol.org/" }}
            thirdPartyCookiesEnabled={true}
            // @ts-ignore
            ref={claimRef}
            setSupportMultipleWindows={false}
            userAgent={
              Platform.OS === "android"
                ? "Chrome/18.0.1025.133 Mobile Safari/535.19"
                : "AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75"
            }
            style={{ height: 0, width: 0 }}
            onNavigationStateChange={async (navState) => {
              if (navState.loading) {
                return;
              }
              if (runonce) {
                const claimRequest = {
                  // lets the window know this is a request
                  // intended for it
                  channel: "ReactNativeWebView",
                  module: "witness-sdk",
                  // this is a random ID you generate,
                  // use to match the response to the request
                  id: "123",
                  // the type of request you want to make
                  type: "createClaim",
                  request: {
                    name: "http",
                    params: {
                      url: requestedProofs[0].url,
                      method: "GET",
                      responseSelections: [
                        {
                          responseMatch: extractedRegexState,
                        },
                      ],
                    },
                    secretParams: {
                      cookieStr: cookie,
                    },
                    ownerPrivateKey: privateKey,
                  },
                };
                claimRef.current?.injectJavaScript(
                  `window.postMessage(${JSON.stringify(claimRequest)})`
                );
              }
            }}
            onMessage={async (event) => {
              // console.log('webViewUrl', webViewUrl);
              // console.log('event data', event.nativeEvent.data);

              // console.log(event.nativeEvent.data);
              const parsedData = JSON.parse(event.nativeEvent.data);
              if (parsedData.type === "createClaimStep") {
                if (parsedData.step.name === "creating") {
                  setDisplayProcess("Creating Claim");
                  // console.log('creating the credntial');
                }
                if (parsedData.step.name === "witness-done") {
                  // console.log('witnessdone the credntial');
                  setDisplayProcess("Claim Created Successfully");
                }
              }

              if (parsedData.type === "createClaimDone") {
                const response = parsedData.response;

                onSuccess([
                  {
                    onChainClaimId: "0",
                    templateClaimId: "0",
                    provider: "http",
                    parameters: response.claimData.parameters,
                    chainId: 420,
                    ownerPublicKey: publicKey,
                    timestampS: String(response.claimData.timestampS),
                    witnessAddresses: response.witnessHosts,
                    signatures: response.signatures,
                    redactedParameters: response.claimData.parameters,
                    extractedParameterValues: extractedParams,
                    sessionId: response.claimData.sessionId,
                    context: response.claimData.context,
                    epoch: response.claimData.epoch,
                    identifier: response.claimData.identifier,
                  },
                ]);
                setWebViewVisible(false);
              }

              if (JSON.parse(event.nativeEvent.data).type === "error") {
                setDisplayError("Error generating claim");
                setWebViewVisible(false);
                onFail(Error("Claim Creation Failed"));
              }

              return;
            }}
          />

          {showShell === true && (
            <>
              <View
                style={[
                  styles.row,
                  styles.rowFlexBox,
                  { padding: Padding.p_base },
                ]}
              >
                <View style={styles.rowInner}>
                  <View style={styles.frameChildLayout}>
                    <Image
                      style={styles.icon}
                      resizeMode="cover"
                      source={{
                        uri: "https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/Logomark.png",
                      }}
                    />
                    <View style={styles.poweredByReclaimProtocolWrapper}>
                      <Text
                        style={[
                          styles.poweredByReclaim,
                          styles.proveYouHaveTypo,
                        ]}
                      >
                        Powered by Reclaim Protocol
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View
                style={[styles.googleLoginParent, styles.contentSpaceBlock]}
              >
                <Text style={[styles.googleLogin, styles.labelTypo]}>
                  {title}
                </Text>
                <View style={styles.proveYouHaveAGoogleLoginWrapper}>
                  <Text style={[styles.proveYouHave, styles.proveYouHaveTypo]}>
                    {subTitle}
                  </Text>
                </View>
              </View>
            </>
          )}
          <View
            style={[
              styles.buttonWrapper,
              styles.rowFlexBox,
              { padding: showShell ? Padding.p_base : 0 },
            ]}
          >
            {displayError ? (
              <Text style={[styles.displayError]}>{displayError}</Text>
            ) : displayProcess ? (
              <Text style={[styles.displayProcess]}>{displayProcess}</Text>
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={onClickListener}
                style={[
                  styles.button,
                  styles.buttonFlexBox,
                  {
                    backgroundColor: buttonColor
                      ? buttonColor
                      : Color.qBLightAccentColor,
                  },
                ]}
              >
                <View style={[styles.content, styles.buttonFlexBox]}>
                  <Text
                    style={[
                      styles.label,
                      styles.labelTypo,
                      {
                        color: buttonTextColor ? buttonTextColor : Color.white,
                      },
                    ]}
                  >
                    {cta}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

ReclaimHttps.defaultProps = {
  showShell: true,
  style: {},
};

const ScreenHeight = Dimensions.get("window").height;
const ScreenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  rowFlexBox: {
    flexDirection: "row",
    alignSelf: "stretch",
  },
  frameChildLayout: {
    height: 40,
    width: 40,
  },
  proveYouHaveTypo: {
    width: 322,
    textAlign: "left",
    fontFamily: FontFamily.manropeMedium,
    fontWeight: "500",
    lineHeight: 16,
    fontSize: FontSize.size_smi,
  },
  contentSpaceBlock: {
    paddingVertical: 0,
    alignSelf: "stretch",
  },
  labelTypo: {
    fontFamily: FontFamily.qBBodyEmphasized,
    fontWeight: "700",
    textAlign: "left",
  },
  buttonFlexBox: {
    alignItems: "center",
    justifyContent: "center",
  },
  frameChild: {
    top: 0,
    left: 0,
    position: "absolute",
  },
  icon: {
    top: 6,
    left: 4,
    width: 30,
    height: 30,
    position: "absolute",
  },
  poweredByReclaim: {
    color: "rgba(198, 198, 198, 0.9)",
  },
  poweredByReclaimProtocolWrapper: {
    top: 13,
    left: 145,
    width: 180,
    position: "absolute",
  },
  rowInner: {
    justifyContent: "center",
    flex: 1,
  },
  row: {
    justifyContent: "flex-end",
  },
  googleLogin: {
    fontSize: FontSize.qBH2_size,
    lineHeight: 24,
    color: Color.black,
  },
  proveYouHave: {
    color: "rgba(0, 0, 0, 0.6)",
  },
  proveYouHaveAGoogleLoginWrapper: {
    marginTop: 8,
    alignSelf: "stretch",
  },
  googleLoginParent: {
    paddingHorizontal: Padding.p_base,
    justifyContent: "center",
  },
  label: {
    fontSize: FontSize.qBBodyEmphasized_size,
    lineHeight: 20,
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: Padding.p_xl,
    paddingVertical: 0,
    alignSelf: "stretch",
    flexDirection: "row",
  },
  button: {
    borderRadius: Border.br_xs,
    height: 48,
    flex: 1,
    overflow: "hidden",
  },
  buttonWrapper: {
    overflow: "hidden",
  },
  reclaimHttpsCard: {
    borderRadius: 16,
    backgroundColor: Color.white,
    shadowColor: "rgba(0, 0, 0, 0.08)",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 16,
    elevation: 16,
    shadowOpacity: 1,
    borderStyle: "solid",
    borderColor: "rgba(0, 0, 0, 0.1)",
    borderWidth: 1,
    width: 358,
    overflow: "hidden",
  },
  container: {
    width: ScreenWidth,
    height: ScreenHeight,
  },
  displayError: {
    color: "rgba(255, 0, 0, 1)",
  },
  displayProcess: {
    color: "grey",
  },
  topBar: {
    height: 50,
    width: ScreenWidth,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  webView: {
    width: ScreenWidth,
    height: ScreenHeight - 50, // Subtract the height of the top bar
  },

  providerHeaderContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 16,
  },
  providerHeader: {
    flexDirection: "column",
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "center",
    height: 20,
    gap: 2,
  },
  providerHeading: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: "700",
    color: "#202124",
  },
  providerSubheading: {
    paddingLeft: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: "500",
    color: "rgba(0, 0, 0, 0.6)",
  },
});
