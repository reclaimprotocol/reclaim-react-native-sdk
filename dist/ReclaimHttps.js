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
const cookies_1 = __importDefault(require("@react-native-cookies/cookies"));
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
const injection = `
  window.ReactNativeWebView.postMessage(document.documentElement.outerHTML)
`;
const ScreenHeight = react_native_2.Dimensions.get("window").height;
const ScreenWidth = react_native_2.Dimensions.get("window").width;
function ReclaimHttps({ requestedProofs, title, subTitle, cta, context, onSuccess, onFail, showShell, style, buttonStyle, buttonTextStyle, onStatusChange = (text) => { }, }) {
    const cardStyle = react_native_1.StyleSheet.flatten([styles.reclaimHttpsCard, style]);
    const buttonStyleFlattened = react_native_1.StyleSheet.flatten([
        styles.button,
        styles.buttonFlexBox,
        buttonStyle,
    ]);
    const buttonTextStyleFlattened = react_native_1.StyleSheet.flatten([
        styles.label,
        styles.labelTypo,
        styles.content,
        buttonTextStyle,
    ]);
    const [webViewVisible, setWebViewVisible] = React.useState(false);
    const [cookie, setCookie] = React.useState("");
    const [webViewUrl, setWebViewUrl] = React.useState(requestedProofs[0].loginUrl);
    const [displayError, setDisplayError] = React.useState("");
    const [displayProcess, setDisplayProcess] = React.useState("");
    const [extractedRegexState, setExtractedRegexState] = React.useState("");
    const [loading, setLoading] = React.useState(true);
    const [address, setAddress] = React.useState("");
    const [runonce, setRunonce] = React.useState(false);
    const [publicKey, setPublicKey] = React.useState("");
    const [privateKey, setPrivateKey] = React.useState("");
    const [extractedParams, setExtractedParams] = React.useState({});
    const ref = React.useRef();
    const walletRef = React.useRef();
    const claimRef = React.useRef();
    function parseHtml(html, regexString) {
        // replace {{VARIABLE}} with (.*?), and save the variable names
        const variableNames = [];
        const realRegexString = regexString.replace(/{{(.*?)}}/g, (match, variableName) => {
            variableNames.push(variableName);
            return "(.*?)";
        });
        // create a RegExp object
        const regex = new RegExp(realRegexString, "s");
        // run the regex on the html
        const match = html.match(regex);
        if (!match) {
            setWebViewVisible(false);
            setDisplayError("Regex does not match");
            onStatusChange("Regex does not match");
            onFail(Error("Regex does not match"));
            throw Error("regex doesnt match");
        }
        // replace the variable placeholders in the original regex string with their values
        let result = regexString;
        const params = {};
        for (let i = 0; i < variableNames.length; i++) {
            result = result.replace(`{{${variableNames[i]}}}`, match[i + 1]);
            params[variableNames[i]] = match[i + 1];
        }
        return { result, params };
    }
    const onClickListener = () => {
        // Add the action to be performed on button click
        setWebViewVisible(true);
    };
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
    const getCookies = (url) => {
        return react_native_1.Platform.OS === "ios"
            ? cookies_1.default.getAll(true)
            : cookies_1.default.get(url);
    };
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
              {extractHostname(webViewUrl)}
            </react_native_1.Text>
          </react_native_1.View>
          {loading ? <LoadingSpinner_1.default /> : <react_native_1.Text> </react_native_1.Text>}
        </react_native_1.View>

        <react_native_webview_1.default source={{ uri: webViewUrl }} thirdPartyCookiesEnabled={true} 
    // @ts-ignore
    ref={ref} setSupportMultipleWindows={false} userAgent={react_native_1.Platform.OS === "android"
            ? "Chrome/18.0.1025.133 Mobile Safari/535.19"
            : "AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75"} style={{ height: ScreenHeight, width: ScreenWidth }} onNavigationStateChange={(navState) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (runonce) {
                return;
            }
            if (navState.loading) {
                return;
            }
            setLoading(false);
            const res = yield getCookies(requestedProofs[0].loginUrl);
            const foundCookies = [];
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
                    setCookie(cookieStr);
                    setLoading(true);
                    setWebViewUrl(requestedProofs[0].url);
                    if (navState.url === requestedProofs[0].url) {
                        (_a = ref.current) === null || _a === void 0 ? void 0 : _a.injectJavaScript(injection);
                        return;
                    }
                }
                catch (error) {
                    setDisplayError("Error generating claim");
                    onStatusChange("Error generating claim");
                    setWebViewVisible(false);
                    onFail(Error("Error creating claim"));
                }
            }
        })} onMessage={(event) => __awaiter(this, void 0, void 0, function* () {
            try {
                const theExtractedParams = requestedProofs[0].responseSelections.reduce((pre, curr) => (Object.assign(Object.assign({}, pre), parseHtml(event.nativeEvent.data, curr.responseMatch)
                    .params)), {});
                setExtractedParams(theExtractedParams);
                setRunonce(true);
                setDisplayProcess("Intiating Claim Creation");
                onStatusChange("Intiating Claim Creation");
                setWebViewVisible(false);
                return;
            }
            catch (error) {
                setWebViewVisible(false);
                setDisplayError("Claim Creation Failed");
                onStatusChange("Claim Creation Failed");
                onFail(Error("Claim Creation Failed"));
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
        ref={claimRef} setSupportMultipleWindows={false} userAgent={react_native_1.Platform.OS === "android"
                ? "Chrome/18.0.1025.133 Mobile Safari/535.19"
                : "AppleWebKit/602.1.50 (KHTML, like Gecko) CriOS/56.0.2924.75"} style={{ height: 0, width: 0 }} onNavigationStateChange={(navState) => __awaiter(this, void 0, void 0, function* () {
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
                            context: context,
                            secretParams: {
                                cookieStr: cookie,
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
                        setDisplayProcess("Creating Claim");
                        onStatusChange("Creating Claim");
                    }
                    if (parsedData.step.name === "witness-done") {
                        setDisplayProcess("Claim Created Successfully");
                        onStatusChange("Claim Created Successfully");
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
            {displayError ? (<react_native_1.Text style={[styles.displayError]}>{displayError}</react_native_1.Text>) : displayProcess ? (<react_native_1.Text style={[styles.displayProcess]}>{displayProcess}</react_native_1.Text>) : (<react_native_1.TouchableOpacity activeOpacity={0.5} onPress={onClickListener} style={buttonStyleFlattened}>
                <react_native_1.View>
                  <react_native_1.Text style={buttonTextStyleFlattened}>{cta}</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.TouchableOpacity>)}
          </react_native_1.View>
        </react_native_1.View>)}
    </react_native_1.View>);
}
exports.default = ReclaimHttps;
ReclaimHttps.defaultProps = {
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
