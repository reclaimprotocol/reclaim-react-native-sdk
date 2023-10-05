import * as React from 'react';
type Props = {
    title: string;
    subTitle: string;
    cta: string;
    onSuccess: (proofs: any[]) => void;
    onFail: (e: Error) => void;
    context?: string;
};
export default function ReclaimAadhaar({ title, subTitle, cta, onSuccess, onFail, }: Props): React.JSX.Element;
export {};
