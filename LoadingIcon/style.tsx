import {flex1} from '../lib/styles/common';
import styled from 'styled-components/native';

export const LoadingContainer = styled.View`
  z-index: 9999;
  ${flex1};
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: white;
`;

export const CenteredView = styled.View`
  margin: auto;
`;

export const MessagesContainer = styled.View`
  display: flex;
  align-items: center;
`;
