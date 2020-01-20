import {
  Animated,
  ColorPropType,
  Easing,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import React, {useState, useRef, useEffect} from 'react';

const getValue = (pressed, disabled) => {
  const base = disabled ? 0.5 : 1;
  const delta = disabled ? 0.1 : 0.3;

  return pressed ? base - delta : base;
};

const Button = ({
  title,
  height,
  disabled,
  onPress,
  color,
  borderRadius,
  fontSize,
}) => {
  const [pressed, setPressed] = useState(false);
  const value = useRef(new Animated.Value(getValue(false, disabled))).current;

  const animatedColor = value.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', color],
  });
  const animatedScale = value.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const containerStyle = {
    borderColor: animatedColor,
    borderRadius,
    height,
    transform: [{scale: animatedScale}],
  };

  const titleStyle = {color: animatedColor, fontSize};

  useEffect(() => {
    Animated.timing(value, {
      duration: 200,
      toValue: getValue(pressed, disabled),
      easing: Easing.out(Easing.quad),
    }).start();
  }, [pressed, disabled, value]);

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}>
      <Animated.View style={[styles.container, containerStyle]}>
        <Animated.Text style={[styles.title, titleStyle]}>
          {title}
        </Animated.Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func,
  disabled: PropTypes.bool,
  height: PropTypes.number,
  color: ColorPropType,
  fontSize: PropTypes.number,
  borderRadius: PropTypes.number,
};

Button.defaultProps = {
  onPress: () => {},
  disabled: false,
  height: null,
  color: '#0CE1C2',
  fontSize: 24,
  borderRadius: 100,
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F1E2A',
    borderWidth: 2,
  },
  title: {
    backgroundColor: 'transparent',
    fontSize: 24,
  },
});

export default Button;
