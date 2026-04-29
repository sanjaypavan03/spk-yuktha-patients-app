import React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export const NextJsLogo = ({ size = 24, active = false }) => {
  return (
    <View style={{ 
      width: size + 6, 
      height: size + 6, 
      backgroundColor: active ? '#000000' : '#94A3B8', 
      borderRadius: (size + 6) / 2,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Svg width={size * 0.75} height={size * 0.75} viewBox="0 0 180 180">
        <Path
          fill="white"
          d="M164.3 154.1L82.1 49.3H70V130.7H82V73.4L153.2 159.2C157.1 157.7 160.8 156 164.3 154.1Z"
        />
        <Path
          fill="white"
          d="M110 49.3H98V130.7H110V49.3Z"
        />
      </Svg>
    </View>
  );
};
