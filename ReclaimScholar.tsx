import * as React from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import WebView from "react-native-webview";
import { Dimensions } from "react-native";
import { Pressable } from "react-native";
import { backIconXml } from "./assets/svgs";
import { SvgXml } from "react-native-svg";
import LoadingSpinner from "./LoadingSpinner";
import CookieManager from "@react-native-cookies/cookies";

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

const ANDROID = "android";
const SCHOLAR_URL = 'https://scholar.google.com/citations';
const injectionRedirect = `
  window.location.href='/scholar?scilib=2';
  true;
`
const injectionHtml = `
  window.ReactNativeWebView.postMessage(document.documentElement.outerHTML)
`

type Props = {
  title: string;
  subTitle: string;
  cta: string;
  onSuccess: (proofs: any[]) => void;
  onFail: (e: Error) => void;
  context?: string;
};


export default function ReclaimScholar({
  title,
  subTitle,
  cta,
  onSuccess,
  onFail,
}: Props) {
  const [webViewVisible, setWebViewVisible] = React.useState(false);
  let ScreenHeight = Dimensions.get("window").height;
  let ScreenWidth = Dimensions.get("window").width;
  const [displayError, setDisplayError] = React.useState("");
  const [citations, setCitations] = React.useState(0);
  const [cookieStr, setCookieStr] = React.useState("");
  const [displayProcess, setDisplayProcess] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [address, setAddress] = React.useState("");
  const [runonce, setRunonce] = React.useState(false);
  const [publicKey, setPublicKey] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");
  const ref = React.useRef<WebView>();
  const walletRef = React.useRef<WebView>();
  const claimRef = React.useRef<WebView>();

  const getCookies = (url?: string) => {
    if (!url) {
      return CookieManager.getAll(true);
    }
    return Platform.OS === "ios"
      ? CookieManager.getAll(true)
      : CookieManager.get(url);
  };

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
                {extractHostname(SCHOLAR_URL)}
              </Text>
            </View>
            {loading ? <LoadingSpinner /> : <Text> </Text>}
          </View>

          <WebView
            source={{ uri: SCHOLAR_URL }}
            thirdPartyCookiesEnabled={true}
            // @ts-ignore
            ref={ref}
            setSupportMultipleWindows={false}
            style={{ height: ScreenHeight, width: ScreenWidth }}
            userAgent={
              Platform.OS === ANDROID
                ? "Chrome/18.0.1025.133 Mobile Safari/535.19"
                : "AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75"
            }
            onLoadEnd={async (event) => {
              const loadUrl = event.nativeEvent.url
              const citationsUrlMatch = loadUrl.match(/\/citations\?/g)
              if (citationsUrlMatch && citationsUrlMatch.length > 0) {
                const res = await getCookies(loadUrl);
                const cookieStr = `${res['__Secure-3PSID']?.name}=${res['__Secure-3PSID']?.value}; ${res['__Secure-3PSIDTS']?.name}=${res['__Secure-3PSIDTS']?.value}`
                setCookieStr(cookieStr);
                ref.current?.injectJavaScript(injectionRedirect);
              }
              if (loadUrl.endsWith('/scholar?scilib=2')) {
                try {
                  ref.current?.injectJavaScript(injectionHtml)
                } catch (error) {
                  throw new Error("Failed to inject postMessage injection")
                }
              }
            }}
            onMessage={async (event) => {
              let citationsFound = 0
              try {
                const html = event.nativeEvent.data
                const citationsRegexp = /class="gs_or_nvi">Cited by (\d)+<\/a>/g
                const matchArray = [...html.matchAll(citationsRegexp)]
                
                for (let i = 0; i < matchArray.length; i++) {
                  citationsFound += parseInt(matchArray[i][1])
                }
                setCitations(citationsFound)
                setLoading(true);
                setRunonce(true);
                setDisplayProcess("Intiating Claim Creation");
                setWebViewVisible(false);
              } catch (error) {
                throw new Error("Failed to parse citations")
              }
            }}
          />
        </>
      ) : (
        <View style={styles.ReclaimScholarCard}>
          <WebView
            // @ts-ignore
            ref={walletRef}
            onMessage={(event) => {
              const { data } = event.nativeEvent;
              const parsedWallet = JSON.parse(data);
              setAddress(parsedWallet.address);
              setPrivateKey(parsedWallet.privateKey);
              setPublicKey(parsedWallet.publicKey);
            }}
            // Loading ethers library from CDN and an empty HTML body
            source={{
              html: '<script src="https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/ethers.js"></script><body></body>',
            }}
            onLoadEnd={() => {
              if (!runonce) {
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
                    name: "scholar-citations",
                    params: {
                      citations: citations,
                    },
                    secretParams: {
                      cookieStr: String(cookieStr),
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
                    provider: "scholar-citations",
                    parameters: response.claimData.parameters,
                    chainId: 420,
                    ownerPublicKey: publicKey,
                    timestampS: String(response.claimData.timestampS),
                    witnessAddresses: response.witnessHosts,
                    signatures: response.signatures,
                    redactedParameters: response.claimData.parameters,
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
          <View style={[styles.row, styles.rowFlexBox]}>
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
                    style={[styles.poweredByReclaim, styles.proveYouHaveTypo]}
                  >
                    Powered by Reclaim Protocol
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={[styles.googleLoginParent, styles.contentSpaceBlock]}>
            <Text style={[styles.googleLogin, styles.labelTypo]}>{title}</Text>
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
              <>
                <Text style={[styles.displayCitations]}>{`Total Citations on Google Scholar: ${citations}\n`}</Text>
                <Text style={[styles.displayProcess]}>{displayProcess}</Text>
              </>
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={onClickListener}
                style={[styles.button, styles.buttonFlexBox]}
              >
                <View style={[styles.content, styles.buttonFlexBox]}>
                  <Text style={[styles.label, styles.labelTypo]}>{cta}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const ScreenHeight = Dimensions.get("window").height;
const ScreenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  rowFlexBox: {
    padding: Padding.p_base,
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
    color: Color.white,
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
    backgroundColor: Color.qBLightAccentColor,
    height: 48,
    flex: 1,
    overflow: "hidden",
  },
  buttonWrapper: {
    overflow: "hidden",
  },
  ReclaimScholarCard: {
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
  displayCitations: {
    color: "black",
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
