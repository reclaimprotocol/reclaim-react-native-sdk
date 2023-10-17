import * as React from "react";
import { ViewStyle, StyleProp, TextStyle } from "react-native";
type Props = {
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
    onStatusChange?: (text: string) => void;
};
declare function ReclaimAadhaar({ title, subTitle, cta, onSuccess, onFail, showShell, style, buttonStyle, buttonTextStyle, onStatusChange, }: Props): React.JSX.Element;
declare namespace ReclaimAadhaar {
    var defaultProps: {
        showShell: boolean;
        onStatusChange: (text: string) => void;
    };
}
export default ReclaimAadhaar;
