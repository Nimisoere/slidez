/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {useState, useEffect, useCallback} from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  Image,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  UIManager,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {createPuzzle} from './utils/puzzle';
import {getRandomImage} from './utils/api';
import Game from './screens/Game';
import Start from './screens/Start';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const BACKGROUND_COLORS = ['#1B1D34', '#2A2A38'];

const App = () => {
  const [size, setSize] = useState(3);
  const [puzzle, setPuzzle] = useState(null);
  const [image, setImage] = useState({});

  const preloadNextImage = useCallback(async () => {
    try {
      const response = await getRandomImage();
      Image.prefetch(response.uri);
      setImage(response);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    preloadNextImage();
  }, [preloadNextImage]);

  const handleChangeSize = selectedSize => {
    setSize(selectedSize);
  };

  const handleStartGame = () => {
    setPuzzle(createPuzzle(size));
  };

  const handleGameChange = selectedPuzzle => {
    setPuzzle(selectedPuzzle);
  };

  const handleQuit = () => {
    setPuzzle(null);
    setImage(null);
    preloadNextImage();
  };

  return (
    <LinearGradient style={styles.background} colors={BACKGROUND_COLORS}>
      <StatusBar barStyle={'light-content'} />
      <SafeAreaView style={styles.container}>
        {!puzzle && (
          <Start
            size={size}
            onStartGame={handleStartGame}
            onChangeSize={handleChangeSize}
          />
        )}
        {puzzle && (
          <Game
            puzzle={puzzle}
            image={image}
            onChange={handleGameChange}
            onQuit={handleQuit}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop:
      Platform.OS === 'android' || parseInt(Platform.Version, 10) < 11
        ? getStatusBarHeight()
        : 0,
  },
});

export default App;
