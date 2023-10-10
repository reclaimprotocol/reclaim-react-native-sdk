import * as React from "react";
import { ViewStyle, StyleProp, TextStyle } from "react-native";
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
    style?: StyleProp<ViewStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    buttonTextStyle?: StyleProp<TextStyle>;
};
declare function ReclaimHttps({ requestedProofs, title, subTitle, cta, context, onSuccess, onFail, showShell, style, buttonStyle, buttonTextStyle, }: Props): React.JSX.Element;
declare namespace ReclaimHttps {
    var defaultProps: {
        showShell: boolean;
    };
}
export default ReclaimHttps;
