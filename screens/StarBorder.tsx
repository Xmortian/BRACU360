import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

const StarBorder = ({
  as: Component = TouchableOpacity,
  className = '',
  color = 'white',
  speed = '6s',
  thickness = 1,
  children,
  ...rest
}) => {
  const speedInMs = parseFloat(speed) * 1000;
  
  // Animated values for the two gradient layers
  const fadeAnimBottom = useRef(new Animated.Value(0)).current;
  const fadeAnimTop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Bottom animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimBottom, {
          toValue: 1,
          duration: speedInMs,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimBottom, {
          toValue: 0,
          duration: speedInMs,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Top animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnimTop, {
          toValue: 1,
          duration: speedInMs,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnimTop, {
          toValue: 0,
          duration: speedInMs,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [speedInMs]);

  // Interpolate the animated values to create the transform and opacity changes
  const animatedStyleBottom = {
    opacity: fadeAnimBottom,
    transform: [{
      translateX: fadeAnimBottom.interpolate({
        inputRange: [0, 1],
        outputRange: [100, -100] // Simulating movement across the button
      }),
    }],
  };

  const animatedStyleTop = {
    opacity: fadeAnimTop,
    transform: [{
      translateX: fadeAnimTop.interpolate({
        inputRange: [0, 1],
        outputRange: [-100, 100] // Opposite movement for the top border
      }),
    }],
  };

  return (
    <Component
      style={[styles.starBorderContainer, { paddingVertical: thickness }, rest.style]}
      {...rest}
    >
      <Animated.View
        style={[styles.borderGradientBottom, animatedStyleBottom, { backgroundColor: color }]}
      />
      <Animated.View
        style={[styles.borderGradientTop, animatedStyleTop, { backgroundColor: color }]}
      />
      <View style={styles.innerContent}>
        {children}
      </View>
    </Component>
  );
};

const styles = StyleSheet.create({
  starBorderContainer: {
    display: 'flex',
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
  },
  borderGradientBottom: {
    position: 'absolute',
    width: '100%',
    height: '50%',
    opacity: 0.7,
    bottom: -12,
    right: 0,
    borderRadius: 50,
    zIndex: 0,
  },
  borderGradientTop: {
    position: 'absolute',
    opacity: 0.7,
    width: '100%',
    height: '50%',
    top: -12,
    left: 0,
    borderRadius: 50,
    zIndex: 0,
  },
  innerContent: {
    position: 'relative',
    borderWidth: 1,
    borderColor: '#222',
    backgroundColor: '#000',
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    padding: 16,
    borderRadius: 20,
    zIndex: 1,
  },
});

export default StarBorder;