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
  Modal,
  TextStyle,
  ActivityIndicator,
} from "react-native";
import WebView from "react-native-webview";
import { Dimensions } from "react-native";
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
  title: string;
  subTitle: string;
  cta: string;
  onSuccess: (proofs: any[]) => void;
  onFail: (e: Error) => void;
  context?: string;
  showShell?: boolean;
  verifyingCta?: string;
  verifiedCta?: string;
  style?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  buttonTextStyle?: StyleProp<TextStyle>;
  onStatusChange?: (text: string) => void;
};

const injection = `(function() {
    var origsetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
    XMLHttpRequest.prototype.setRequestHeader = function(header,value) {
    if(header.includes("Authorization")){
        window.ReactNativeWebView.postMessage(JSON.stringify({header,value}))
    }
            origsetRequestHeader.apply(this, arguments);
    };
})();
true; // note: this is required, or you'll sometimes get silent failures
`;

const ScreenHeight = Dimensions.get("window").height;
const ScreenWidth = Dimensions.get("window").width;

export default function ReclaimAadhaar({
  title,
  subTitle,
  cta,
  context,
  onSuccess,
  onFail,
  showShell,
  verifyingCta,
  verifiedCta,
  style,
  buttonStyle,
  buttonTextStyle,
  onStatusChange = (text: string) => {},
}: Props) {
  const [webViewVisible, setWebViewVisible] = React.useState(false);
  const cardStyle = StyleSheet.flatten([styles.ReclaimAadhaarCard, style]);
  const buttonStyleFlattened = StyleSheet.flatten([
    styles.button,
    styles.buttonFlexBox,
    buttonStyle,
  ]);
  const displayProcessFlatten = StyleSheet.flatten([
    styles.displayProcess,
    buttonStyle,
  ]);
  const buttonTextStyleFlattened = StyleSheet.flatten([
    styles.label,
    styles.labelTypo,
    styles.content,
    buttonTextStyle,
  ]);

  const [displayError, setDisplayError] = React.useState("");
  const [aadhaarNumber, setAadhaarNumber] = React.useState("");
  const [token, setToken] = React.useState("");
  const [displayProcess, setDisplayProcess] = React.useState("");

  const [loading, setLoading] = React.useState(true);
  const [address, setAddress] = React.useState("");
  const [runonce, setRunonce] = React.useState(false);
  const [publicKey, setPublicKey] = React.useState("");
  const [privateKey, setPrivateKey] = React.useState("");
  const ref = React.useRef<WebView>();
  const walletRef = React.useRef<WebView>();
  const claimRef = React.useRef<WebView>();

  const onClickListener = () => {
    // Add the action to be performed on button click
    setWebViewVisible(true);
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
      <Modal
        visible={webViewVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setWebViewVisible(false)}
      >
        <View style={styles.providerHeaderContainer}>
          <TouchableOpacity onPress={() => setWebViewVisible(false)}>
            <Pressable onPress={() => setWebViewVisible(false)}>
              <SvgXml xml={backIconXml} />
            </Pressable>
          </TouchableOpacity>

          <View style={styles.providerHeader}>
            <Text style={styles.providerHeading}>Sign in to verify</Text>
            <Text style={styles.providerSubheading}>
              {extractHostname("https://myaadhaar.uidai.gov.in")}
            </Text>
          </View>
          {loading ? <LoadingSpinner /> : <Text> </Text>}
        </View>

        <WebView
          injectedJavaScript={injection}
          source={{ uri: "https://myaadhaar.uidai.gov.in/" }}
          thirdPartyCookiesEnabled={true}
          // @ts-ignore
          ref={ref}
          onLoadEnd={() => {
            ref.current?.injectJavaScript(`
      
                  var logInButton = document.querySelector('.button_btn__1dRFj');
                  if (logInButton) {
                      logInButton.click();
                    }`);
          }}
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
            if (navState.loading) {
              return;
            }
            setLoading(false);

            ref.current?.injectJavaScript(`
              (function() {
                // Event listener function for the button click
                function buttonClickListener(event) {
              
                  
                  const inputForm = document.getElementById('uid');
                  
        
                  const value = inputForm.value;
                  
              
              
                  // Log or perform actions with the input value
                  window.ReactNativeWebView.postMessage(JSON.stringify({'uid': value}));
                  // You can perform any necessary actions with the input value here
                }
              
                // Find the submit button and attach the event listener
                const submitBtn = document.getElementById('submit-btn');
                if (submitBtn) {
                  submitBtn.addEventListener('click', buttonClickListener);
                }
              })();
              
                  
              true;`);
          }}
          onMessage={async (e) => {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.uid) {
              setAadhaarNumber(String(data.uid));
            }
            if (data.value) {
              if (data.value !== "") {
                setToken(String(data.value));
                setLoading(true);
                setRunonce(true);
                if (verifyingCta) {
                  setDisplayProcess(verifyingCta);
                } else {
                  setDisplayProcess("Intiating Claim Creation");
                }
                onStatusChange("Intiating Claim Creation");
                setWebViewVisible(false);
              }
            }
          }}
        />
      </Modal>
      {!webViewVisible && (
        <View style={cardStyle}>
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
                    name: "uidai-uid",
                    params: {
                      uid: String(aadhaarNumber),
                    },
                    context: context,
                    secretParams: {
                      uid: String(aadhaarNumber),
                      token: String(token),
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
              const parsedData = JSON.parse(event.nativeEvent.data);
              if (parsedData.type === "createClaimStep") {
                if (parsedData.step.name === "creating") {
                  if (verifyingCta) {
                    setDisplayProcess(verifyingCta);
                  } else {
                    setDisplayProcess("Creating Claim");
                  }
                  onStatusChange("Creating Claim");
                }
                if (parsedData.step.name === "witness-done") {
                  if (verifyingCta) {
                    setDisplayProcess(verifyingCta);
                  } else {
                    setDisplayProcess("Creating Claim");
                  }
                  onStatusChange("Claim Created Successfully");
                }
              }

              if (parsedData.type === "createClaimDone") {
                const response = parsedData.response;

                onSuccess([
                  {
                    onChainClaimId: "0",
                    templateClaimId: "0",
                    provider: "uidai-uid",
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
                onStatusChange("Error generating claim");
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
              <View style={displayProcessFlatten}>
                {displayProcess !== "Claim Created Successfully" &&
                  displayProcess !== verifiedCta && (
                    <ActivityIndicator size="small" color="black" />
                  )}
                <Text style={buttonTextStyleFlattened}>{displayProcess}</Text>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={onClickListener}
                style={buttonStyleFlattened}
              >
                <View>
                  <Text style={buttonTextStyleFlattened}>{cta}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

ReclaimAadhaar.defaultProps = {
  showShell: true,
};

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
    color: Color.white,
  },
  content: {
    flexDirection: "row",
  },
  button: {
    borderRadius: Border.br_xs,
    backgroundColor: Color.qBLightAccentColor,
    height: 48,
    flex: 1,
    overflow: "hidden",
  },
  displayProcess: {
    borderRadius: Border.br_xs,
    backgroundColor: Color.qBLightAccentColor,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: 48,
    opacity: 0.3,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    overflow: "hidden",
  },
  buttonWrapper: {
    overflow: "hidden",
  },
  ReclaimAadhaarCard: {
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
