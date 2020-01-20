import React, {useState, useEffect, useCallback, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';

import Button from '../components/Button';
import Logo from '../components/Logo';
import Toggle from '../components/Toggle';
import configureTransition from '../utils/configureTransition';
import sleep from '../utils/sleep';

const State = {
  Launching: 'Launching',
  WillTransitionIn: 'WillTransitionIn',
  WillTransitionOut: 'WillTransitionOut',
};

const BOARD_SIZES = [3, 4, 5, 6];

const Start = ({size, onChangeSize, onStartGame}) => {
  const [transitionState, setTransitionState] = useState(State.Launching);

  const toggleOpacity = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;

  const toggleStyle = useRef({opacity: toggleOpacity}).current;
  const buttonStyle = useRef({opacity: buttonOpacity}).current;

  const loadPage = useCallback(async () => {
    try {
      await sleep(500);
      await configureTransition(() =>
        setTransitionState(State.WillTransitionIn),
      );

      Animated.timing(toggleOpacity, {
        toValue: 1,
        duration: 500,
        delay: 500,
        useNativeDriver: true,
      }).start();

      Animated.timing(buttonOpacity, {
        toValue: 1,
        duration: 500,
        delay: 1000,
        useNativeDriver: true,
      }).start();
    } catch (e) {
      console.log(e);
    }
  }, [buttonOpacity, toggleOpacity]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const handlePressStart = async () => {
    try {
      await configureTransition(() => {
        setTransitionState(State.WillTransitionOut);
      });
      onStartGame();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    transitionState !== State.WillTransitionOut && (
      <View style={styles.container}>
        <View style={styles.logo}>
          <Logo />
        </View>
        {transitionState !== State.Launching && (
          <Animated.View style={toggleStyle}>
            <Toggle
              options={BOARD_SIZES}
              value={size}
              onChange={onChangeSize}
            />
          </Animated.View>
        )}
        {transitionState !== State.Launching && (
          <Animated.View style={buttonStyle}>
            <Button title="Start Game" onPress={handlePressStart} />
          </Animated.View>
        )}
      </View>
    )
  );
};

Start.propTypes = {
  onChangeSize: PropTypes.func.isRequired,
  onStartGame: PropTypes.func.isRequired,
  size: PropTypes.number.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    alignSelf: 'stretch',
    paddingHorizontal: 40,
  },
});

export default Start;
