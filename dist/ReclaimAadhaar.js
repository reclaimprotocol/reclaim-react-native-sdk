"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_webview_1 = __importDefault(require("react-native-webview"));
const react_native_2 = require("react-native");
const react_native_3 = require("react-native");
const svgs_1 = require("./assets/svgs");
const react_native_svg_1 = require("react-native-svg");
const LoadingSpinner_1 = __importDefault(require("./LoadingSpinner"));
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
const ScreenHeight = react_native_2.Dimensions.get("window").height;
const ScreenWidth = react_native_2.Dimensions.get("window").width;
const DEFAULT_USER_AGENT = react_native_1.Platform.OS === 'android'
    ? 'Chrome/93.0.4577.82 Mobile Safari/537.36'
    : 'AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75';
function ReclaimAadhaar({ title, subTitle, cta, context, onSuccess, onFail, showShell, verifyingCta, verifiedCta, style, buttonStyle, buttonTextStyle, onStatusChange = (text) => { }, }) {
    const [webViewVisible, setWebViewVisible] = React.useState(false);
    const cardStyle = react_native_1.StyleSheet.flatten([styles.ReclaimAadhaarCard, style]);
    const buttonStyleFlattened = react_native_1.StyleSheet.flatten([
        styles.button,
        styles.buttonFlexBox,
        buttonStyle,
    ]);
    const displayProcessFlatten = react_native_1.StyleSheet.flatten([
        styles.displayProcess,
        buttonStyle,
    ]);
    const buttonTextStyleFlattened = react_native_1.StyleSheet.flatten([
        styles.label,
        styles.labelTypo,
        styles.content,
        buttonTextStyle,
    ]);
    const [displayError, setDisplayError] = React.useState("");
    const [aadhaarNumber, setAadhaarNumber] = React.useState("");
    const [aadhaarState, setAadhaarState] = React.useState("");
    const [token, setToken] = React.useState("");
    const [displayProcess, setDisplayProcess] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [address, setAddress] = React.useState("");
    const [runonce, setRunonce] = React.useState(false);
    const [publicKey, setPublicKey] = React.useState("");
    const [privateKey, setPrivateKey] = React.useState("");
    const ref = React.useRef();
    const walletRef = React.useRef();
    const claimRef = React.useRef();
    const onClickListener = () => {
        // Add the action to be performed on button click
        setWebViewVisible(true);
    };
    React.useEffect(() => {
        if (aadhaarNumber && token) {
            setWebViewVisible(false);
            const getDetails = () => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const API_ENDPOINT = 'https://tathya.uidai.gov.in/ssupService/api/demographics/request/v4/profile';
                const headers = {
                    Accept: 'application/json, text/plain, */*',
                    'Accept-Language': 'en_IN',
                    Authorization: token,
                    Connection: 'close',
                    'Content-Type': 'application/json',
                    appID: 'SSUP',
                    'Accept-Encoding': 'gzip, deflate, br',
                };
                const response = yield fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({ uidNumber: aadhaarNumber }),
                });
                const data = yield response.json();
                setAadhaarState((_b = (_a = data === null || data === void 0 ? void 0 : data.responseData) === null || _a === void 0 ? void 0 : _a.stateName) !== null && _b !== void 0 ? _b : '');
                setLoading(true);
                setRunonce(true);
                if (verifyingCta) {
                    setDisplayProcess(verifyingCta);
                }
                else {
                    setDisplayProcess("Intiating Claim Creation");
                }
                onStatusChange("Intiating Claim Creation");
            });
            getDetails();
        }
    }, [aadhaarNumber, token]);
    function extractHostname(url) {
        let hostname;
        // Find & remove protocol (http, ftp, etc.) and get the hostname
        if (url.indexOf("//") > -1) {
            hostname = url.split("/")[2];
        }
        else {
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
    return (<react_native_1.View>
      <react_native_1.Modal visible={webViewVisible} animationType="slide" transparent={false} onRequestClose={() => setWebViewVisible(false)}>
        <react_native_1.View style={styles.providerHeaderContainer}>
          <react_native_1.TouchableOpacity onPress={() => setWebViewVisible(false)}>
            <react_native_3.Pressable onPress={() => setWebViewVisible(false)}>
              <react_native_svg_1.SvgXml xml={svgs_1.backIconXml}/>
            </react_native_3.Pressable>
          </react_native_1.TouchableOpacity>

          <react_native_1.View style={styles.providerHeader}>
            <react_native_1.Text style={styles.providerHeading}>Sign in to verify</react_native_1.Text>
            <react_native_1.Text style={styles.providerSubheading}>
              {extractHostname("https://myaadhaar.uidai.gov.in")}
            </react_native_1.Text>
          </react_native_1.View>
          {loading ? <LoadingSpinner_1.default /> : <react_native_1.Text> </react_native_1.Text>}
        </react_native_1.View>

        <react_native_webview_1.default injectedJavaScript={injection} source={{ uri: "https://myaadhaar.uidai.gov.in/verifyAadhaar" }} startInLoadingState={true} userAgent={DEFAULT_USER_AGENT} thirdPartyCookiesEnabled={true} cacheEnabled={true} domStorageEnabled={true} 
    // cacheMode="LOAD_NO_CACHE"
    // @ts-ignore
    ref={ref} setSupportMultipleWindows={false} style={{ height: ScreenHeight, width: ScreenWidth }} onNavigationStateChange={(navState) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (runonce) {
                return;
            }
            if (navState.loading) {
                return;
            }
            (_a = ref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(`
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
        })} onMessage={(e) => __awaiter(this, void 0, void 0, function* () {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.uid) {
                setAadhaarNumber(String(data.uid));
            }
            if (data.value) {
                if (data.value !== "") {
                    setToken(String(data.value));
                }
            }
        })}/>
      </react_native_1.Modal>
      {!webViewVisible && (<react_native_1.View style={cardStyle}>
          <react_native_webview_1.default 
        // @ts-ignore
        ref={walletRef} onMessage={(event) => {
                const { data } = event.nativeEvent;
                const parsedWallet = JSON.parse(data);
                setAddress(parsedWallet.address);
                setPrivateKey(parsedWallet.privateKey);
                setPublicKey(parsedWallet.publicKey);
            }} 
        // Loading ethers library from CDN and an empty HTML body
        source={{
                html: '<script src="https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/ethers.js"></script><body></body>',
            }} onLoadEnd={() => {
                var _a;
                if (!runonce) {
                    (_a = walletRef.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(`
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
                `);
                }
            }} javaScriptEnabled style={{ width: 0, height: 0 }} // Make the WebView invisible
        />
          <react_native_webview_1.default source={{ uri: "https://sdk-rpc.reclaimprotocol.org/" }} thirdPartyCookiesEnabled={true} 
        // @ts-ignore
        ref={claimRef} setSupportMultipleWindows={false} renderP userAgent={DEFAULT_USER_AGENT} style={{ height: 0, width: 0 }} onNavigationStateChange={(navState) => __awaiter(this, void 0, void 0, function* () {
                var _b;
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
                            name: "uidai-state",
                            params: {
                                stateName: String(aadhaarState),
                            },
                            context: context,
                            secretParams: {
                                uid: String(aadhaarNumber),
                                token: String(token),
                            },
                            ownerPrivateKey: privateKey,
                        },
                    };
                    (_b = claimRef.current) === null || _b === void 0 ? void 0 : _b.injectJavaScript(`window.postMessage(${JSON.stringify(claimRequest)})`);
                }
            })} onMessage={(event) => __awaiter(this, void 0, void 0, function* () {
                const parsedData = JSON.parse(event.nativeEvent.data);
                if (parsedData.type === "createClaimStep") {
                    if (parsedData.step.name === "creating") {
                        if (verifyingCta) {
                            setDisplayProcess(verifyingCta);
                        }
                        else {
                            setDisplayProcess("Creating Claim");
                        }
                        onStatusChange("Creating Claim");
                    }
                    if (parsedData.step.name === "witness-done") {
                        if (verifyingCta) {
                            setDisplayProcess(verifyingCta);
                        }
                        else {
                            setDisplayProcess("Creating Claim");
                        }
                        onStatusChange("Claim Created Successfully");
                        setLoading(false);
                    }
                }
                if (parsedData.type === "createClaimDone") {
                    const response = parsedData.response;
                    onSuccess([
                        {
                            onChainClaimId: "0",
                            templateClaimId: "0",
                            provider: "uidai-state",
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
                    setLoading(false);
                    setDisplayProcess("Claim Created Successfully");
                }
                if (JSON.parse(event.nativeEvent.data).type === "error") {
                    console.log('ERROR --', JSON.parse(event.nativeEvent.data));
                    setDisplayError("Error generating claim");
                    onStatusChange("Error generating claim");
                    setWebViewVisible(false);
                    onFail(Error("Claim Creation Failed"));
                }
                return;
            })}/>
          {showShell === true && (<>
              <react_native_1.View style={[
                    styles.row,
                    styles.rowFlexBox,
                    { padding: Padding.p_base },
                ]}>
                <react_native_1.View style={styles.rowInner}>
                  <react_native_1.View style={styles.frameChildLayout}>
                    <react_native_1.Image style={styles.icon} resizeMode="cover" source={{
                    uri: "https://reclaim-react-native-sdk.s3.ap-south-1.amazonaws.com/Logomark.png",
                }}/>
                    <react_native_1.View style={styles.poweredByReclaimProtocolWrapper}>
                      <react_native_1.Text style={[
                    styles.poweredByReclaim,
                    styles.proveYouHaveTypo,
                ]}>
                        Powered by Reclaim Protocol
                      </react_native_1.Text>
                    </react_native_1.View>
                  </react_native_1.View>
                </react_native_1.View>
              </react_native_1.View>
              <react_native_1.View style={[styles.googleLoginParent, styles.contentSpaceBlock]}>
                <react_native_1.Text style={[styles.googleLogin, styles.labelTypo]}>
                  {title}
                </react_native_1.Text>
                <react_native_1.View style={styles.proveYouHaveAGoogleLoginWrapper}>
                  <react_native_1.Text style={[styles.proveYouHave, styles.proveYouHaveTypo]}>
                    {subTitle}
                  </react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>
            </>)}
          <react_native_1.View style={[
                styles.buttonWrapper,
                styles.rowFlexBox,
                { padding: showShell ? Padding.p_base : 0 },
            ]}>
            {displayError ? (<react_native_1.Text style={[styles.displayError]}>{displayError}</react_native_1.Text>) : displayProcess ? (<react_native_1.View style={displayProcessFlatten}>
                {displayProcess !== "Claim Created Successfully" &&
                    displayProcess !== verifiedCta && (<react_native_1.ActivityIndicator size="small" color="black"/>)}
                <react_native_1.Text style={buttonTextStyleFlattened}>{displayProcess}</react_native_1.Text>
              </react_native_1.View>) : (<react_native_1.TouchableOpacity activeOpacity={0.5} onPress={onClickListener} style={buttonStyleFlattened}>
                <react_native_1.View>
                  <react_native_1.Text style={buttonTextStyleFlattened}>{cta}</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.TouchableOpacity>)}
          </react_native_1.View>
        </react_native_1.View>)}
    </react_native_1.View>);
}
exports.default = ReclaimAadhaar;
ReclaimAadhaar.defaultProps = {
    showShell: true,
};
const styles = react_native_1.StyleSheet.create({
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
