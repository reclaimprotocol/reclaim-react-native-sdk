import * as React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
type Props = {
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
declare function ReclaimAadhaar({ title, subTitle, cta, onSuccess, onFail, showShell, buttonColor, buttonTextColor, style, }: Props): React.JSX.Element;
declare namespace ReclaimAadhaar {
    var defaultProps: {
        showShell: boolean;
        styles: {};
    };
}
export default ReclaimAadhaar;
