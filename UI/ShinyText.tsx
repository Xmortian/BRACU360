// src/components/ShinyText.js
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

const ShinyText = ({ text, style }) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.linear }),
      -1, // -1 means it repeats forever
      false // false means it doesn't reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    // We animate a view from -200 to 200, which moves it across the card.
    const translateX = animatedValue.value * 400 - 200;
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={styles.container}>
      {/* The visible text that serves as a mask. Its color should be the same as the Card's background */}
      <View style={StyleSheet.absoluteFillObject}>
        <Text style={[style, { color: 'transparent' }]}>{text}</Text>
      </View>

      {/* The animated gradient for the shine */}
      <Animated.View style={[styles.gradientContainer, animatedStyle]}>
        <LinearGradient
          colors={['transparent', '#fff', 'transparent']} // Use a white shine
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        />
      </Animated.View>
      
      {/* The actual text on top, with an overflow clip, to reveal the shine behind it. */}
      <Text style={style}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden', // This is crucial to "clip" the overflowing gradient
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
    width: 200, // Adjust the width for the desired "shine" length
    height: '100%',
    left: '50%',
    marginLeft: -100, // Center the gradient initially
  },
  gradient: {
    flex: 1,
  },
});

export default ShinyText;