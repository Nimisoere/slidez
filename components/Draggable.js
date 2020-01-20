import {PanResponder} from 'react-native';
import PropTypes from 'prop-types';
import {useState} from 'react';

const Draggable = ({
  children,
  onTouchStart,
  onTouchEnd,
  onTouchMove,
  enabled,
}) => {
  const [dragging, setDragging] = useState(false);

  const handleStartShouldSetPanResponder = () => {
    return enabled;
  };

  const handlePanResponderGrant = () => {
    setDragging(true);
    onTouchStart();
  };

  const handlePanResponderMove = (e, gestureState) => {
    // Keep track of how far we've moved in total (dx and dy)
    const offset = {
      top: gestureState.dy,
      left: gestureState.dx,
    };
    onTouchMove(offset);
  };

  const handlePanResponderEnd = (e, gestureState) => {
    const offset = {
      top: gestureState.dy,
      left: gestureState.dx,
    };
    setDragging(false);
    onTouchMove(offset);
    onTouchEnd(offset);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: handleStartShouldSetPanResponder,
    onPanResponderGrant: handlePanResponderGrant,
    onPanResponderMove: handlePanResponderMove,
    onPanResponderRelease: handlePanResponderEnd,
    onPanResponderTerminate: handlePanResponderEnd,
  });

  return children({handlers: panResponder.panHandlers, dragging});
};

Draggable.propTypes = {
  children: PropTypes.func.isRequired,
  onTouchStart: PropTypes.func,
  onTouchMove: PropTypes.func,
  onTouchEnd: PropTypes.func,
  enabled: PropTypes.bool,
};

Draggable.defaultProps = {
  onTouchStart: () => {},
  onTouchMove: () => {},
  onTouchEnd: () => {},
  enabled: true,
};

export default Draggable;
