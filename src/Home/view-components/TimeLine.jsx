import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { IconButton, Popover } from '@mui/material';
import { Add } from '@mui/icons-material';
import { LocalizationProvider, StaticTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { PageContext } from './Views';
import useStyles from 'styles/ViewsStyles';
import { getTime, getPosAndSize } from './getTime';
import { v4 } from 'uuid';

const TimeLine = (props) => {
  const classes = useStyles();
  const [value, setValue] = useState();

  // TimeFields go in here
  // if allviews, consider overlap

  // DEFAULT PROPS
  const { allViews, setAllViews } = useContext(PageContext);
  const {
    direction = 'horizontal',
    type = 'all',
    pixelSize = 750,
    label = 'Sunday',
  } = props;

  class TimeSlotData {
    constructor(direction, label, color, time) {
      this.key = v4();
      this.border = '';
      this.direction = direction;
      this.label = label;
      this.color = color;
      this.time = time;
    }
    getStyle() {
      return {
        position: 'absolute',
        left: this.direction === 'horizontal' ? this.position + 'px' : '0px',
        top: this.direction === 'vertical' ? this.position + 'px' : '0px',
        width: this.direction === 'horizontal' ? this.size + 'px' : '100%',
        height: this.direction === 'vertical' ? this.size + 'px' : '100%',
        borderRadius: '2px',
        border: this.border,
        opacity: this.opacity,
        background: this.color,
        WebkitUserSelect: 'none',
        KhtmlUserSelect: 'none',
        MozUserSelect: 'none',
        MsUserSelect: 'none',
        userSelect: 'none',
        transition:
          'left 0.05s ease, top 0.05s ease, height 0.05s ease,width 0.05s ease',
      };
    }
    setDirection(direction) {
      this.direction = direction;
    }
    setLabel(label) {
      this.label = label;
    }
    setColor(color) {
      this.color = color;
    }
    setBorder(border) {
      this.border = border ? '1px inset rgba(0,0,0,0.25)' : '';
    }
    setCellDistFromBoundingClient(etarget) {
      this.cellDistFromBoundingClient =
        this.direction === 'vertical'
          ? etarget.getBoundingClientRect().top
          : etarget.getBoundingClientRect().left;
    }
    setRawPosition(e) {
      this.rawPosition =
        this.direction === 'vertical'
          ? e.clientY - this.cellDistFromBoundingClient
          : e.clientX - this.cellDistFromBoundingClient;
    }
    setThirtyMinSize(etarget) {
      this.thirtyMinSize =
        this.direction === 'vertical'
          ? (etarget.parentElement.parentElement.clientHeight - 100) / 48
          : (etarget.parentElement.parentElement.clientWidth - 100) / 48;
    }
    setTime(e, isFor = 'pos') {
      if (isFor === 'pos') {
        this.time = {
          start_time: `${getTime(
            this.rawPosition - (this.rawPosition % this.thirtyMinSize),
            this.thirtyMinSize
          )}`,
          end_time: `${getTime(
            isFor === 'pos'
              ? this.rawPosition - (this.rawPosition % this.thirtyMinSize)
              : this.rawPosition -
                  (this.rawPosition % this.thirtyMinSize) +
                  this.thirtyMinSize,
            this.thirtyMinSize
          )}`,
        };
      } else {
        this.time.end_time = `${getTime(
          this.rawPosition +
            this.thirtyMinSize / 5 -
            ((this.rawPosition + this.thirtyMinSize / 5) % this.thirtyMinSize) -
            this.position >=
            0
            ? this.rawPosition +
                this.thirtyMinSize / 5 -
                ((this.rawPosition + this.thirtyMinSize / 5) %
                  this.thirtyMinSize)
            : 0,
          this.thirtyMinSize
        )}`;
      }
      // {start_time: "00:00", end_time: "00:00"}
    }
    setPosition() {
      this.position = getPosAndSize(this.time, this.thirtyMinSize).pos;
    }
    setSize() {
      this.size = getPosAndSize(this.time, this.thirtyMinSize).size;
      if (this.size > 0) {
        timeSlotData.current[timeSlotData.current.length - 1].setBorder(true);
      } else {
        timeSlotData.current[timeSlotData.current.length - 1].setBorder(false);
      }
    }
    correctOverlapsForSelected(timeSlotData) {
      timeSlotData.forEach((timeSlot, idx) => {
        if (this.key === timeSlot.key) {
          // console.log('same slot');
          return;
        }
        if (
          this.position + this.size > timeSlot.position &&
          this.position + this.size <= timeSlot.position + timeSlot.size
        ) {
          // console.log('overlapping slot');
          timeSlot.size =
            timeSlot.position + timeSlot.size - (this.position + this.size);
          timeSlot.position = this.position + this.size;
          return;
        }
        if (
          timeSlot.position > this.position &&
          timeSlot.position <= this.position + this.size &&
          timeSlot.position + timeSlot.size > this.position &&
          timeSlot.position + timeSlot.size <= this.position + this.size
        ) {
          // console.log('overtaking slot');
          timeSlotData.splice(idx, 1);
          return true;
        }
        return false;
      });
    }
    correctOverlapsForAll(timeSlotData) {
      timeSlotData.forEach((timeSlot, idx) => {
        if (this.key === timeSlot.key) {
          // console.log('same slot');
          return;
        }
        if (
          (this.position + this.size > timeSlot.position &&
            this.position + this.size <= timeSlot.position + timeSlot.size) ||
          (timeSlot.position > this.position &&
            timeSlot.position <= this.position + this.size &&
            timeSlot.position + timeSlot.size > this.position &&
            timeSlot.position + timeSlot.size <= this.position + this.size)
        ) {
          // console.log('overlapping slot');
          this.opacity = '50%';
          return;
        } else {
          this.opacity = '100%';
        }
        return false;
      });
    }
    IsNearThirtyMinMark() {
      return this.rawPosition % this.thirtyMinSize < this.thirtyMinSize / 5 ||
        this.rawPosition % this.thirtyMinSize >
          this.thirtyMinSize - this.thirtyMinSize / 5
        ? true
        : false;
    }
  }

  const cell = useRef(); // TimeSlots parent cell reference
  const timeSlotData = useRef([]);
  const [timeSlots, setTimeSlots] = useState([]);
  // const [cursor, setCursor] = useState('copy'); // Cursor Style

  // HANDLERS
  const handleOnMouseDown = (e) => {
    // Set new timeSlot
    let color = null;
    allViews.forEach((view) => {
      if (view.view_unique_id.includes('Selected')) {
        color = view.color;
      }
    });
    timeSlotData.current.push(new TimeSlotData(direction, label, color));
    timeSlotData.current[
      timeSlotData.current.length - 1
    ].setCellDistFromBoundingClient(e.target);
    timeSlotData.current[timeSlotData.current.length - 1].setRawPosition(e);
    timeSlotData.current[timeSlotData.current.length - 1].setThirtyMinSize(
      e.target
    );
    timeSlotData.current[timeSlotData.current.length - 1].setTime(e, 'pos');
    timeSlotData.current[timeSlotData.current.length - 1].setPosition();
    timeSlotData.current[timeSlotData.current.length - 1].setSize();
    setTimeSlots([
      ...timeSlotData.current.map((timeSlot) => (
        <div key={timeSlot.key} style={timeSlot.getStyle()}>
          <div className={classes.timeSlot}></div>
        </div>
      )),
    ]);

    // Checks if you've clicked on another timeslot
    if (e.target.parentElement.parentElement === cell.current) {
      handleOnMouseUpAndOnMouseLeave();
      return;
    }

    // Adds a listener for dragging out a new timeslot
    cell.current.addEventListener('mousemove', handleOnMouseMove, true);
  };
  const handleOnMouseMove = useCallback((e) => {
    // setCursor('grabbing');
    timeSlotData.current[timeSlotData.current.length - 1].setRawPosition(e);
    timeSlotData.current[timeSlotData.current.length - 1].setThirtyMinSize(
      e.target
    );

    // Set current timeSlot
    if (
      timeSlotData.current[
        timeSlotData.current.length - 1
      ].IsNearThirtyMinMark()
    ) {
      timeSlotData.current[timeSlotData.current.length - 1].setTime(e, 'size');
      timeSlotData.current[timeSlotData.current.length - 1].setSize();
      timeSlotData.current[
        timeSlotData.current.length - 1
      ].correctOverlapsForSelected(timeSlotData.current);
      setTimeSlots([
        ...timeSlotData.current.map((timeSlot) => (
          <div key={timeSlot.key} style={timeSlot.getStyle()}>
            <div classlabel={classes.timeSlot}></div>
          </div>
        )),
      ]);
    }
  }, []);
  const handleOnMouseUpAndOnMouseLeave = () => {
    if (
      timeSlotData.current.length > 0 &&
      timeSlotData.current[timeSlotData.current.length - 1].size <= 0
    ) {
      timeSlotData.current.pop();
      setTimeSlots([
        ...timeSlotData.current.map((timeSlot) => (
          <div key={timeSlot.key} style={timeSlot.getStyle()}>
            <div className={classes.timeSlot}></div>
          </div>
        )),
      ]);
    } else {
      setTimeSlots([
        ...timeSlotData.current.map((timeSlot) => (
          <div key={timeSlot.key} style={timeSlot.getStyle()}>
            <div className={classes.timeSlot}></div>
          </div>
        )),
      ]);
    }
    // setCursor('copy');
    cell.current.removeEventListener('mousemove', handleOnMouseMove, true);
  };

  // Update props
  useEffect(() => {
    if (type === 'selected' && allViews.length > 0) {
      timeSlotData.current = [];
      let selectedView = null;
      allViews.forEach((view) => {
        if (view.view_unique_id.includes('Selected')) {
          selectedView = view;
        }
      });
      let schedule = JSON.parse(selectedView.schedule)[label];
      schedule.forEach((slot) => {
        timeSlotData.current.push(
          new TimeSlotData(direction, label, selectedView.color, slot)
        );
        timeSlotData.current[
          timeSlotData.current.length - 1
        ].setCellDistFromBoundingClient(cell.current);
        timeSlotData.current[timeSlotData.current.length - 1].setThirtyMinSize(
          cell.current
        );
        timeSlotData.current[timeSlotData.current.length - 1].setPosition();
        timeSlotData.current[timeSlotData.current.length - 1].setSize();
        timeSlotData.current[
          timeSlotData.current.length - 1
        ].correctOverlapsForAll(timeSlotData.current);
      });
    } else if (type === 'all' && allViews.length > 0) {
      timeSlotData.current = [];
      allViews.forEach((view) => {
        let schedule = JSON.parse(view.schedule)[label];
        schedule.forEach((slot) => {
          timeSlotData.current.push(
            new TimeSlotData(direction, label, view.color, slot)
          );
          timeSlotData.current[
            timeSlotData.current.length - 1
          ].setCellDistFromBoundingClient(cell.current);
          timeSlotData.current[
            timeSlotData.current.length - 1
          ].setThirtyMinSize(cell.current);
          timeSlotData.current[timeSlotData.current.length - 1].setPosition();
          timeSlotData.current[timeSlotData.current.length - 1].setSize();
          timeSlotData.current[
            timeSlotData.current.length - 1
          ].correctOverlapsForAll(timeSlotData.current);
        });
      });
    }
    timeSlotData.current.forEach((timeSlot) => {
      timeSlot.setDirection(direction);
      timeSlot.setLabel(label);
    });
    setTimeSlots([
      ...timeSlotData.current.map((timeSlot) => (
        <div key={timeSlot.key} style={timeSlot.getStyle()}>
          <div className={classes.timeSlot}></div>
        </div>
      )),
    ]);
  }, [direction, type, label, allViews]);

  console.log(timeSlotData.current);

  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        alignContent: 'center',
        gridTemplateColumns: '60px auto 40px',
        // cursor: cursor,
        flexGrow: '1',
        width: direction === 'horizontal' ? '100%' : '',
        height: direction === 'vertical' ? '100%' : '',
      }}
    >
      <h6
        style={{
          justifySelf: 'right',
          alignSelf: 'center',
          padding: '7.5px 15px',
          fontSize: '0.5em',
          color: '#bbb',
        }}
      >
        {label}
      </h6>

      <div
        style={{
          position: 'relative',
          // cursor: cursor,
          borderLeft: direction === 'vertical' ? '0.5px solid #bbb' : '',
          borderTop: direction === 'horizontal' ? '0.5px solid #bbb' : '',
          width: direction === 'horizontal' ? pixelSize + 'px' : '',
          height: direction === 'vertical' ? pixelSize + 'px' : '',
        }}
        ref={cell}
        onMouseDownCapture={(e) => {
          if (type === 'selected') {
            e.persist();
            handleOnMouseDown(e);
          }
        }}
        onMouseUpCapture={() => {
          if (type === 'selected') {
            handleOnMouseUpAndOnMouseLeave();
          }
        }}
        onMouseLeave={() => {
          if (type === 'selected') {
            handleOnMouseUpAndOnMouseLeave();
          }
        }}
      >
        {timeSlots}
      </div>

      <div style={{ width: '34px', height: '34px' }}>
        <IconButton
          color="primary"
          size="small"
          aria-label="add to shopping cart"
          onClick={(e) => {
            handleClick(e);
          }}
        >
          <Add sx={{ width: '20px', height: '20px' }} />
        </IconButton>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          onClose={() => {
            handleClose();
          }}
          PaperProps={{
            style: {
              marginTop: '10px',
            },
          }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <StaticTimePicker
              displayStaticWrapperAs="mobile"
              value={value}
              onChange={(newValue) => {
                setValue(newValue);
              }}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
        </Popover>
      </div>
    </div>
  );
};

export default TimeLine;
