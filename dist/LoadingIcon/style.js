"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesContainer = exports.CenteredView = exports.LoadingContainer = void 0;
// @ts-ignore
const common_1 = require("../lib/styles/common");
const native_1 = __importDefault(require("styled-components/native"));
exports.LoadingContainer = native_1.default.View `
  z-index: 9999;
  ${common_1.flex1};
  position: absolute;
  top: 0px;
  right: 0px;
  bottom: 0px;
  left: 0px;
  background-color: white;
`;
exports.CenteredView = native_1.default.View `
  margin: auto;
`;
exports.MessagesContainer = native_1.default.View `
  display: flex;
  align-items: center;
`;
