import * as React from "react";
import { ViewStyle, StyleProp } from "react-native";
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
declare function ReclaimHttps({ requestedProofs, title, subTitle, cta, context, onSuccess, onFail, showShell, buttonColor, buttonTextColor, style, }: Props): React.JSX.Element;
declare namespace ReclaimHttps {
    var defaultProps: {
        showShell: boolean;
        styles: {};
    };
}
export default ReclaimHttps;
