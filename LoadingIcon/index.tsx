import React from 'react';
import {Image, ViewProps} from 'react-native';
import {CenteredView, LoadingContainer} from './style';

type Props = ViewProps;
const LoadingIcon = ({...props}: Props) => {
  return (
    <LoadingContainer {...props}>
      <CenteredView>
        <Image source={require('../assets/loading.gif')} />
      </CenteredView>
    </LoadingContainer>
  );
};

export default LoadingIcon;
