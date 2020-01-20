import {ActivityIndicator, Alert, Image, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import React, {useState, useEffect} from 'react';

import {move, movableSquares, isSolved} from '../utils/puzzle';
import Board from '../components/Board';
import Button from '../components/Button';
import PuzzlePropType from '../validators/PuzzlePropType';
import Preview from '../components/Preview';
import Stats from '../components/Stats';
import configureTransition from '../utils/configureTransition';

const State = {
  LoadingImage: 'LoadingImage',
  WillTransitionIn: 'WillTransitionIn',
  RequestTransitionOut: 'RequestTransitionOut',
  WillTransitionOut: 'WillTransitionOut',
};

const Game = ({puzzle, puzzle: {size}, image, onChange, onQuit}) => {
  const [moves, setMoves] = useState(0);
  const [transitionState, setTransitionState] = useState(
    image ? State.WillTransitionIn : State.LoadingImage,
  );
  const [elapsed, setElapsed] = useState(0);
  const [previousMove, setpreviousMove] = useState(null);
  const [boardMounted, setBoardMounted] = useState(false);

  useEffect(() => {
    if (image && transitionState === State.LoadingImage) {
      configureTransition(() => setTransitionState(State.WillTransitionIn));
    }
  }, [image, transitionState]);

  const handlePressSquare = square => {
    if (!movableSquares(puzzle).includes(square)) {
      return;
    }
    const updated = move(puzzle, square);

    setMoves(moves + 1);
    setpreviousMove(square);
    onChange(updated);

    if (isSolved(updated)) {
      requestTransitionOut();
    }
  };

  const handleBoardTransitionIn = () => {
    setBoardMounted(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (boardMounted) {
        setElapsed(seconds => seconds + 1);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boardMounted]);

  const requestTransitionOut = () => {
    setBoardMounted(false);
    setTransitionState(State.RequestTransitionOut);
  };

  const handlePressQuit = () => {
    Alert.alert(
      'Quit',
      'Do you want to quit and lose progress on this puzzle?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Quit',
          style: 'destructive',
          onPress: requestTransitionOut,
        },
      ],
    );
  };

  const handleBoardTransitionOut = async () => {
    try {
      await configureTransition(() => {
        setTransitionState(State.WillTransitionOut);
      });
      onQuit();
    } catch (e) {
      console.log(e);
    }
  };

  return (
    transitionState !== State.WillTransitionOut && (
      <View style={styles.container}>
        {transitionState === State.LoadingImage && (
          <ActivityIndicator size="large" color="rgba(255,255,255,0.5" />
        )}
        {transitionState !== State.LoadingImage && (
          <View style={styles.centered}>
            <View style={styles.header}>
              <Preview image={image} boardSize={size} />
              <Stats moves={moves} time={elapsed} />
            </View>
            <Board
              puzzle={puzzle}
              image={image}
              previousMove={previousMove}
              teardown={transitionState === State.RequestTransitionOut}
              onMoveSquare={handlePressSquare}
              onTransitionOut={handleBoardTransitionOut}
              onTransitionIn={handleBoardTransitionIn}
            />
            <Button title="Quit" onPress={handlePressQuit} />
          </View>
        )}
      </View>
    )
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 16,
    alignSelf: 'stretch',
  },
});

Game.propTypes = {
  puzzle: PuzzlePropType.isRequired,
  image: Image.propTypes.source,
  onChange: PropTypes.func.isRequired,
  onQuit: PropTypes.func.isRequired,
};

Game.defaultProps = {
  image: null,
};

export default Game;
