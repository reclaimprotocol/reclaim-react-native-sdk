import React from 'react'
import { Animated, Easing } from 'react-native'
import { SvgXml } from 'react-native-svg'
import { loader } from '../assets/svgs'

const LoadingSpinner: React.FC = () => {
  const spinValue = new Animated.Value(0)

  Animated.loop(
    Animated.timing(spinValue, {
      toValue: 360,
      duration: 600000,
      easing: Easing.linear,
      useNativeDriver: true,
    })
  ).start()

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  return (
    <Animated.View
      style={{
        transform: [{ rotate: spin }],
      }}
    >
      <SvgXml xml={loader} />
    </Animated.View>
  )
}

export default LoadingSpinner
