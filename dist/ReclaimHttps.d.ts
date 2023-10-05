import * as React from 'react';
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
};
export default function ReclaimHttps({ requestedProofs, title, subTitle, cta, context, onSuccess, onFail, }: Props): React.JSX.Element;
export {};
