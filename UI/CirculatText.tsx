import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

const CircularText = ({ text = " B r a c u * 3 6 0 *", size = 200, spinDuration = 10000 }) => {
    const letters = Array.from(text.toUpperCase());
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: spinDuration,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        ).start();
    }, [spinDuration]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const letterSpacing = 360 / letters.length;

    return (
        <Animated.View style={[styles.container, { width: size, height: size, transform: [{ rotate: rotation }] }]}>
            {letters.map((letter, index) => {
                const letterRotation = index * letterSpacing;

                return (
                    <View 
                        key={index} 
                        style={[
                            styles.letterContainer, 
                            { 
                                transform: [
                                    { rotate: `${letterRotation}deg` },
                                    { translateY: -size / 2 }, // Move letter from center to edge of circle
                                ]
                            }
                        ]}
                    >
                        <Text style={styles.letterText}>
                            {letter}
                        </Text>
                    </View>
                );
            })}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        backgroundColor: 'transparent', // Added transparent background for better rendering
    },
    letterContainer: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        justifyContent: 'center',
        alignItems: 'center',
        // By default, the letter container is at the center (top: '50%', left: '50%').
        // The rotation is applied, and then the translateY moves it out.
        // We need to move it out first, then rotate.
    },
    letterText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#fff',
    },
});

export default CircularText;