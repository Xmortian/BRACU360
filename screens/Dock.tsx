import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Easing,
  TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const { width } = Dimensions.get('window');

// --- DockItem Component ---
const DockItem = ({
  children,
  pan,
  distance,
  magnification,
  baseItemSize,
  onPress,
  index,
}) => {
  const itemRef = useRef(null);
  const itemX = useRef(new Animated.Value(0)).current;

  const handleLayout = (event) => {
    itemRef.current.measure((fx, fy, w, h, px, py) => {
      itemX.setValue(px + w / 2);
    });
  };

  const scale = pan.x.interpolate({
    inputRange: [
      itemX._value - distance,
      itemX._value,
      itemX._value + distance,
    ],
    outputRange: [1, magnification / baseItemSize, 1],
    extrapolate: 'clamp',
  });

  const animatedStyle = {
    transform: [{ scale }],
  };

  return (
    <Animated.View
      ref={itemRef}
      onLayout={handleLayout}
      style={[
        styles.dockItem,
        {
          width: baseItemSize,
          height: baseItemSize,
        },
        animatedStyle,
      ]}
    >
      <TouchableOpacity onPress={onPress} style={styles.dockIconContainer}>
        <View style={styles.dockIcon}>{children}</View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// --- DockLabel Component ---
const DockLabel = ({ isHovered, label }) => {
  const animatedOpacity = isHovered.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const animatedTranslateY = isHovered.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const animatedStyle = {
    opacity: animatedOpacity,
    transform: [{ translateY: animatedTranslateY }],
  };

  return (
    <Animated.View style={[styles.dockLabel, animatedStyle]}>
      <Text style={styles.dockLabelText}>{label}</Text>
    </Animated.View>
  );
};

// --- Main Dock Component ---
export default function Dock({
  items,
  panelHeight = 68,
  baseItemSize = 50,
  magnification = 70,
  distance = 150,
}) {
  const pan = useRef(new Animated.Value(0)).current;
  const isHovered = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isHovered.setValue(1);
      },
      onPanResponderMove: Animated.event(
        [null, { moveX: pan }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        Animated.timing(isHovered, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }).start();
        Animated.spring(pan, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  return (
    <View style={styles.dockOuter}>
      <Animated.View
        style={[styles.dockPanel, { height: panelHeight }]}
        {...panResponder.panHandlers}
      >
        {items.map((item, index) => (
          <DockItem
            key={index}
            pan={pan}
            distance={distance}
            magnification={magnification}
            baseItemSize={baseItemSize}
            onPress={item.onClick}
            index={index}
          >
            <View style={styles.dockIconWrapper}>
              {item.icon}
              <DockLabel isHovered={isHovered} label={item.label} />
            </View>
          </DockItem>
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  dockOuter: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
  },
  dockPanel: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '90%',
    justifyContent: 'space-around',
    backgroundColor: '#060010',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  dockItem: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#060010',
    borderWidth: 1,
    borderColor: '#222',
  },
  dockIconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockIcon: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockLabel: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#060010',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dockLabelText: {
    color: '#fff',
    fontSize: 12,
  },
});