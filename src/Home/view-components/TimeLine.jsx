import {
  useState,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Button } from '@mui/material';
import { ClickAwayListener } from '@mui/material';
import { PageContext } from './Views';
import { userID, addView } from './endpoints';
import useStyles from 'styles/ViewsStyles';
import { v4 } from 'uuid';

const TimeLine = (props) => {
  const classes = useStyles();

  // DEFAULT PROPS
  const {
    direction = props.direction,
    name = '',
    color = '#dc3545',
    startEndTimes = [{ start_time: '', end_time: '' }],
    setStartEndTimes = () => {
      return;
    },
    numOfLines = 1,
    setNumOfLines = () => {
      return;
    },
  } = props;

  class TimeSlotData {
    constructor(direction, name, color, position, size) {
      this.key = v4();
      this.direction = direction;
      this.name = name;
      this.color = color;
      this.position = position;
      this.size = size;
    }
    getStyle() {
      return {
        position: 'absolute',
        left: this.direction === 'horizontal' ? this.position + 'px' : '0px',
        top: this.direction === 'vertical' ? this.position + 'px' : '0px',
        width: this.direction === 'horizontal' ? this.size + 'px' : '100%',
        height: this.direction === 'vertical' ? this.size + 'px' : '100%',
        borderRadius: '2px',
        backgroundColor: this.color,
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        MsUserSelect: 'none',
        userSelect: 'none',
        transition: 'height 0.05s ease,width 0.05s ease',
      };
    }
    setDirection(direction) {
      this.direction = direction;
    }
    setName(name) {
      this.name = name;
    }
    setColor(color) {
      this.color = color;
    }
    setPosition(position) {
      this.position = position;
    }
    setSize(size) {
      this.size = size;
    }
  }

  const cellDistanceFromBoundingClient = useRef(); // Helps calculate position relative to window bounds
  const positionOnMouseDown = useRef(); // Reference used in two handlers
  const cell = useRef(); // TimeSlots parent cell reference
  const timeSlotData = useRef([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [cursor, setCursor] = useState('copy'); // Cursor Style

  // HANDLERS
  const handleOnMouseDown = (e) => {
    cellDistanceFromBoundingClient.current =
      direction === 'vertical'
        ? e.target.getBoundingClientRect().top
        : e.target.getBoundingClientRect().left;
    let pos =
      direction === 'vertical'
        ? e.clientY - cellDistanceFromBoundingClient.current
        : e.clientX - cellDistanceFromBoundingClient.current; //position within the element.

    // Snap to thirty minutes
    let timeLineThirtyMinSize =
      direction === 'vertical'
        ? e.target.parentElement.parentElement.clientHeight / 48
        : e.target.parentElement.parentElement.clientWidth / 48;
    positionOnMouseDown.current = pos - (pos % timeLineThirtyMinSize);

    // Set the starting position of the new timeslot

    timeSlotData.current.push(
      new TimeSlotData(
        direction,
        name,
        color,
        pos - (pos % timeLineThirtyMinSize),
        0
      )
    );
    setTimeSlots((prevState) => [
      ...prevState,
      <div
        key={timeSlotData.current[timeSlotData.current.length - 1].key}
        style={timeSlotData.current[timeSlotData.current.length - 1].getStyle()}
      >
        <div className={classes.timeSlot}></div>
      </div>,
    ]);

    // Checks for overlapping timeslots
    if (e.target.parentElement.parentElement === cell.current) {
      handleOnMouseUpAndOnMouseLeave();
      return;
    }

    // Adds a listener for dragging out a new timeslot
    cell.current.addEventListener('mousemove', handleOnMouseMove, true);
  };
  const handleOnMouseMove = useCallback((e) => {
    setCursor('grabbing');
    let pos =
      direction === 'vertical'
        ? e.clientY - cellDistanceFromBoundingClient.current
        : e.clientX - cellDistanceFromBoundingClient.current; //position within the element.

    // Snap to thirty minutes
    let timeLineThirtyMinSize =
      direction === 'vertical'
        ? e.target.parentElement.parentElement.clientHeight / 48
        : e.target.parentElement.parentElement.clientWidth / 48;
    let onThirtyMinMark =
      pos % timeLineThirtyMinSize < timeLineThirtyMinSize / 5 ? true : false;
    if (
      onThirtyMinMark &&
      pos - positionOnMouseDown.current - (pos % timeLineThirtyMinSize) !==
        timeSlotData.current[timeSlotData.current.length - 1].position
    ) {
      // Checks for overlapping timeslots
      let overlapsOtherTimeSlot = timeSlotData.current.some((timeSlot) => {
        if (
          timeSlotData.current[timeSlotData.current.length - 1].key ===
          timeSlot.key
        ) {
          return false;
        }
        return (
          pos - (pos % timeLineThirtyMinSize) > timeSlot.position &&
          pos - (pos % timeLineThirtyMinSize) <=
            timeSlot.size + timeSlot.position
        );
      });
      if (overlapsOtherTimeSlot) {
        handleOnMouseUpAndOnMouseLeave();
        return;
      }

      // Set size of timeslot
      timeSlotData.current[timeSlotData.current.length - 1].setSize(
        pos - positionOnMouseDown.current - (pos % timeLineThirtyMinSize)
      );
      console.log(timeSlotData.current[timeSlotData.current.length - 1].size);
      console.log(
        timeSlotData.current[timeSlotData.current.length - 1].getStyle()
      );
      setTimeSlots((prevState) => {
        let newState = [...prevState];
        newState[newState.length - 1] = (
          <div
            key={timeSlotData.current[timeSlotData.current.length - 1].key}
            style={timeSlotData.current[
              timeSlotData.current.length - 1
            ].getStyle()}
          >
            <div className={classes.timeSlot}></div>
          </div>
        );
        return newState;
      });
    }
  }, []);
  const handleOnMouseUpAndOnMouseLeave = () => {
    if (
      timeSlotData.current.length > 0 &&
      timeSlotData.current[timeSlotData.current.length - 1].size <= 0
    ) {
      timeSlotData.current.pop();
      setTimeSlots((prevState) => {
        prevState.pop();
        return prevState;
      });
    }
    // timeSlotData.current.forEach((timeSlot,idx) => {
    //     timeSlotData.current.forEach((t) => {
    //       if (timeSlot.key === t.key) {
    //         return false;
    //       }
    //       if(
    //         (timeSlot.position > t.position &&
    //           timeSlot.position <= t.position + t.size)
    //       ){
    //         timeSlotData.current.splice(idx, 1)
    //         setTimeSlots((prevState) => {
    //             let newState = [...prevState];
    //             newState.current.splice(idx, 1)
    //             return newState;
    //           });
    //         return
    //       };
    //       if(
    //         (timeSlot.position + timeSlot.size > t.position &&
    //             timeSlot.position + timeSlot.size <= t.position + t.size)
    //       ){
    //         timeSlotData.current[idx].size = t.position - timeSlot.position;
    //         if(timeSlotData.current[idx].size <= 0){

    //         }else{
    //             setTimeSlots((prevState) => {
    //                 let newState = [...prevState];
    //                 newState[idx] = (
    //                   <div
    //                     key={timeSlotData.current[idx].key}
    //                     style={timeSlotData.current[idx].style}
    //                   >
    //                     <div className={classes.timeSlot}></div>
    //                   </div>
    //                 );
    //                 return newState;
    //               });
    //         }
    //         return
    //       }
    //     });
    //   })
    setCursor('copy');
    cell.current.removeEventListener('mousemove', handleOnMouseMove, true);
  };

  // Update props
  useEffect(() => {
    timeSlotData.current.forEach((timeSlot) => {
      timeSlot.setDirection(direction);
      timeSlot.setColor(color);
      timeSlot.setName(name);
    });
    setTimeSlots((prevState) => {
      let newState = prevState.map((timeSlot, idx) => (
        <div
          key={timeSlotData.current[idx].key}
          style={timeSlotData.current[idx].getStyle()}
        >
          <div className={classes.timeSlot}></div>
        </div>
      ));
      return newState;
    });
  }, [direction, color, name]);

  console.log(timeSlots);
  console.log(timeSlotData.current);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        cursor: cursor,
        flexGrow: '1',
        borderLeft: direction === 'vertical' ? '0.5px solid #bbb' : '',
        borderTop: direction === 'horizontal' ? '0.5px solid #bbb' : '',
        width: direction === 'horizontal' ? '100%' : '',
        height: direction === 'vertical' ? '100%' : '',
      }}
      ref={cell}
      onMouseDownCapture={(e) => {
        e.persist();
        handleOnMouseDown(e);
      }}
      onMouseUpCapture={() => {
        handleOnMouseUpAndOnMouseLeave();
      }}
      onMouseLeave={() => {
        handleOnMouseUpAndOnMouseLeave();
      }}
    >
      {timeSlots}
    </div>
  );
};

export default TimeLine;
