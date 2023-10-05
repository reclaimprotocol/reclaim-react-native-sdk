"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_svg_1 = require("react-native-svg");
const svgs_1 = require("../assets/svgs");
const LoadingSpinner = () => {
    const spinValue = new react_native_1.Animated.Value(0);
    react_native_1.Animated.loop(react_native_1.Animated.timing(spinValue, {
        toValue: 360,
        duration: 600000,
        easing: react_native_1.Easing.linear,
        useNativeDriver: true,
    })).start();
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    return (<react_native_1.Animated.View style={{
            transform: [{ rotate: spin }],
        }}>
      <react_native_svg_1.SvgXml xml={svgs_1.loader}/>
    </react_native_1.Animated.View>);
};
exports.default = LoadingSpinner;
