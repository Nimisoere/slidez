import {
  Animated,
  Image,
  StyleSheet,
  View,
  Dimensions,
  Easing,
} from 'react-native';
import PropTypes from 'prop-types';
import React, {memo, useState, useEffect, useCallback} from 'react';

import {availableMove, getIndex} from '../utils/puzzle';
import {
  calculateContainerSize,
  calculateItemSize,
  itemMargin,
  calculateItemPosition,
} from '../utils/grid';
import Draggable from './Draggable';
import PuzzlePropType from '../validators/PuzzlePropType';
import clamp from '../utils/clamp';

const State = {
  WillTransitionIn: 'WillTransitionIn',
  DidTransitionIn: 'DidTransitionIn',
  DidTransitionOut: 'DidTransitionOut',
};

const Board = memo(
  ({
    puzzle,
    puzzle: {size, board, empty},
    onTransitionIn,
    onMoveSquare,
    image,
    previousMove,
    onTransitionOut,
    teardown,
  }) => {
    const [transitionState, setTransitionState] = useState(
      State.WillTransitionIn,
    );
    const animatedValues = [];
    const containerSize = calculateContainerSize();
    const containerStyle = {width: containerSize, height: containerSize};
    const height = Dimensions.get('window').height;

    board.forEach((square, index) => {
      const {top, left} = calculateItemPosition(size, index);
      animatedValues[square] = {
        scale: new Animated.Value(1),
        top: new Animated.Value(top),
        left: new Animated.Value(left),
      };
    });

    const animateAllSquares = useCallback(
      visible => {
        const animations = board.map((square, index) => {
          const {top} = calculateItemPosition(size, index);
          return Animated.timing(animatedValues[square].top, {
            toValue: visible ? top : top + height,
            delay: 800 * (index / board.length),
            duration: 400,
            easing: visible ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
            useNativeDriver: true,
          });
        });
        return new Promise(resolve =>
          Animated.parallel(animations).start(resolve),
        );
      },
      [animatedValues, board, height, size],
    );

    const updateSquarePosition = useCallback(
      // eslint-disable-next-line no-shadow
      (puzzle, square, index) => {
        // eslint-disable-next-line no-shadow
        const {size} = puzzle;
        const {top, left} = calculateItemPosition(size, index);
        const animations = [
          Animated.spring(animatedValues[square].top, {
            toValue: top,
            friction: 20,
            tension: 200,
            useNativeDriver: true,
          }),
          Animated.spring(animatedValues[square].left, {
            toValue: left,
            friction: 20,
            tension: 200,
            useNativeDriver: true,
          }),
        ];
        return new Promise(resolve =>
          Animated.parallel(animations).start(resolve),
        );
      },
      [animatedValues],
    );

    const handleTouchStart = square => {
      Animated.spring(animatedValues[square].scale, {
        toValue: 1.1,
        friction: 20,
        tension: 200,
        useNativeDriver: true,
      }).start();
    };

    const handleTouchMove = (square, index, {top, left}) => {
      const itemSize = calculateItemSize(size);
      const move = availableMove(puzzle, square);
      const {top: initialTop, left: initialLeft} = calculateItemPosition(
        size,
        index,
      );
      const distance = itemSize + itemMargin;
      const clampedTop = clamp(
        top,
        move === 'up' ? -distance : 0,
        move === 'down' ? distance : 0,
      );
      const clampedLeft = clamp(
        left,
        move === 'left' ? -distance : 0,
        move === 'right' ? distance : 0,
      );
      animatedValues[square].left.setValue(initialLeft + clampedLeft);
      animatedValues[square].top.setValue(initialTop + clampedTop);
    };

    const handleTouchEnd = (square, index, {top, left}) => {
      const itemSize = calculateItemSize(size);
      const move = availableMove(puzzle, square);
      Animated.spring(animatedValues[square].scale, {
        toValue: 1,
        friction: 20,
        tension: 200,
        useNativeDriver: true,
      }).start();
      if (
        (move === 'up' && top < -itemSize / 2) ||
        (move === 'down' && top > itemSize / 2) ||
        (move === 'left' && left < -itemSize / 2) ||
        (move === 'right' && left > itemSize / 2)
      ) {
        onMoveSquare(square);
      } else {
        updateSquarePosition(puzzle, square, index);
      }
    };

    const renderSquare = (square, index) => {
      if (square === empty) {
        return null;
      }
      const itemSize = calculateItemSize(size);

      return (
        <Draggable
          key={square}
          enabled={transitionState === State.DidTransitionIn}
          onTouchStart={() => handleTouchStart(square)}
          onTouchMove={offset => handleTouchMove(square, index, offset)}
          onTouchEnd={offset => handleTouchEnd(square, index, offset)}>
          {({handlers, dragging}) => {
            const itemStyle = {
              position: 'absolute',
              width: itemSize,
              height: itemSize,
              overflow: 'hidden',
              transform: [
                {translateX: animatedValues[square].left},
                {translateY: animatedValues[square].top},
                {scale: animatedValues[square].scale},
              ],
              zIndex: dragging ? 1 : 0,
            };
            const imageStyle = {
              position: 'absolute',
              width: itemSize * size + (itemMargin * size - 1),
              height: itemSize * size + (itemMargin * size - 1),
              transform: [
                {
                  translateX:
                    -Math.floor(square % size) * (itemSize + itemMargin),
                },
                {
                  translateY:
                    -Math.floor(square / size) * (itemSize + itemMargin),
                },
              ],
            };
            return (
              <Animated.View {...handlers} key={square} style={itemStyle}>
                <Image style={imageStyle} source={image} />
              </Animated.View>
            );
          }}
        </Draggable>
      );
    };

    useEffect(() => {
      const animateSquares = async value => {
        try {
          await animateAllSquares(value);
        } catch (e) {
          console.log(e);
        }
      };
      animateSquares(true);
      setTransitionState(State.DidTransitionIn);
      onTransitionIn();
    }, [animateAllSquares, onTransitionIn]);

    useEffect(() => {
      if (previousMove !== null) {
        updateSquarePosition(
          puzzle,
          previousMove,
          getIndex(puzzle, previousMove),
        );
      }
      if (teardown) {
        const animateSquares = async value => {
          try {
            await animateAllSquares(value);
          } catch (e) {
            console.log(e);
          }
        };
        animateSquares(false);
        setTransitionState(State.DidTransitionOut);
        onTransitionOut();
      }
    }, [
      animateAllSquares,
      onTransitionOut,
      previousMove,
      puzzle,
      teardown,
      updateSquarePosition,
    ]);

    return (
      <View style={[styles.container, containerStyle]}>
        {transitionState !== State.DidTransitionOut && board.map(renderSquare)}
      </View>
    );
  },
);

Board.propTypes = {
  puzzle: PuzzlePropType.isRequired,
  teardown: PropTypes.bool.isRequired,
  image: Image.propTypes.source,
  previousMove: PropTypes.number,
  onMoveSquare: PropTypes.func.isRequired,
  onTransitionIn: PropTypes.func.isRequired,
  onTransitionOut: PropTypes.func.isRequired,
};

Board.defaultProps = {
  image: null,
  previousMove: null,
};
const styles = StyleSheet.create({
  container: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#1F1E2A',
  },
  title: {
    fontSize: 24,
    color: '#69B8FF',
  },
});

export default Board;
