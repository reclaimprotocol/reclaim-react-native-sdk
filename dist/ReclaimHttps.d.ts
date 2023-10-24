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
    hideButton?: boolean;
    style?: StyleProp<ViewStyle>;
    buttonStyle?: StyleProp<ViewStyle>;
    buttonTextStyle?: StyleProp<TextStyle>;
    onStatusChange?: (text: string) => void;
};
declare function ReclaimHttps({ requestedProofs, title, subTitle, cta, context, onSuccess, onFail, showShell, hideButton, style, buttonStyle, buttonTextStyle, onStatusChange, }: Props): React.JSX.Element;
declare namespace ReclaimHttps {
    var defaultProps: {
        showShell: boolean;
        hideButton: boolean;
    };
}
export default ReclaimHttps;
