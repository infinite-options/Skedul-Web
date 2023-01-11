import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import { IconButton, Popover, TextField } from '@mui/material';
import { Add } from '@mui/icons-material';
import TimeField from 'react-simple-timefield';
import { PageContext } from './Views';
import useStyles from 'styles/ViewsStyles';
import { getTime, getPosAndSize } from './getTime';
import { v4 } from 'uuid';

const TimeLine = (props) => {
  const classes = useStyles();

  // DEFAULT PROPS
  const { allViews, setAllViews } = useContext(PageContext);
  const {
    direction = 'horizontal',
    type = 'all',
    pixelSize = 750,
    label = 'Sunday',
    setSlotsData,
  } = props;

  class TimeSlotData {
    constructor(direction, label, color, time) {
      this.key = v4();
      this.direction = direction;
      this.label = label;
      this.color = color;
      this.time = time;
    }
    getStyle() {
      return {
        position: 'absolute',
        cursor: type === 'all' ? '' : 'no-drop',
        left: this.direction === 'horizontal' ? this.position + 'px' : '0px',
        top: this.direction === 'vertical' ? this.position + 'px' : '0px',
        width: this.direction === 'horizontal' ? this.size + 'px' : '100%',
        height: this.direction === 'vertical' ? this.size + 'px' : '100%',
        // flexGrow: '1',
        borderRadius: '2px',
        border: this.size > 0 ? '1px inset rgba(0,0,0,0.25)' : '',
        // opacity: this.opacity,
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
    setTime(isFor = 'pos', time) {
      if (isFor === 'pos') {
        this.time = {
          start_time: `${getTime(
            this.rawPosition - (this.rawPosition % this.thirtyMinSize),
            this.thirtyMinSize
          )}`,
          end_time: `${getTime(
            this.rawPosition - (this.rawPosition % this.thirtyMinSize),
            this.thirtyMinSize
          )}`,
        };
      } else if (isFor === 'size') {
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
      } else if (isFor === 'time') {
        this.time = time;
      }
      // {start_time: "00:00", end_time: "00:00"}
    }
    setPosition() {
      this.position = getPosAndSize(this.time, this.thirtyMinSize).pos;
    }
    setSize() {
      this.size = getPosAndSize(this.time, this.thirtyMinSize).size;
    }
    correctOverlapsForSelected(timeSlotsData) {
      let data = [...timeSlotsData];
      data.forEach((timeSlot, idx) => {
        if (this.key === timeSlot.key) {
          // console.log('same slot');
          return;
        }
        let checks = {
          thisEndIsBetweenTimeSlot:
            this.position + this.size > timeSlot.position &&
            this.position + this.size <= timeSlot.position + timeSlot.size,
          thisStartIsBetweenTimeSlot:
            this.position >= timeSlot.position &&
            this.position < timeSlot.position + timeSlot.size,
          timeSlotIsInsideThis:
            timeSlot.position >= this.position &&
            timeSlot.position < this.position + this.size &&
            timeSlot.position + timeSlot.size > this.position &&
            timeSlot.position + timeSlot.size <= this.position + this.size,
        };
        if (
          checks.thisEndIsBetweenTimeSlot &&
          checks.thisStartIsBetweenTimeSlot
        ) {
          // console.log('inside slot');
          let time = timeSlot.time;
          timeSlot.size = this.position - timeSlot.position;
          timeSlot.time = {
            start_time: `${getTime(timeSlot.position, this.thirtyMinSize)}`,
            end_time: `${getTime(
              timeSlot.position + timeSlot.size,
              this.thirtyMinSize
            )}`,
          };
          data = [
            ...data.flatMap((t, i) => {
              if (idx === i) {
                let splitSlot = new TimeSlotData(
                  timeSlot.direction,
                  timeSlot.label,
                  timeSlot.color,
                  time
                );
                splitSlot.cellDistFromBoundingClient =
                  timeSlot.cellDistFromBoundingClient;
                splitSlot.thirtyMinSize = timeSlot.thirtyMinSize;
                splitSlot.setPosition();
                splitSlot.setSize();
                return [t, splitSlot];
              }
              return t;
            }),
          ];
          data[idx + 1].size =
            data[idx + 1].position +
            data[idx + 1].size -
            (this.position + this.size);
          data[idx + 1].position = this.position + this.size;
          data[idx + 1].time = {
            start_time: `${getTime(
              data[idx + 1].position,
              this.thirtyMinSize
            )}`,
            end_time: `${getTime(
              data[idx + 1].position + data[idx + 1].size,
              this.thirtyMinSize
            )}`,
          };
          return;
        }
        if (checks.thisStartIsBetweenTimeSlot) {
          // console.log('start overlaps slot');
          timeSlot.size = this.position - timeSlot.position;
          timeSlot.time = {
            start_time: `${getTime(timeSlot.position, this.thirtyMinSize)}`,
            end_time: `${getTime(
              timeSlot.position + timeSlot.size,
              this.thirtyMinSize
            )}`,
          };
          return;
        }
        if (checks.thisEndIsBetweenTimeSlot) {
          // console.log('end overlaps slot');
          timeSlot.size =
            timeSlot.position + timeSlot.size - (this.position + this.size);
          timeSlot.position = this.position + this.size;
          timeSlot.time = {
            start_time: `${getTime(timeSlot.position, this.thirtyMinSize)}`,
            end_time: `${getTime(
              timeSlot.position + timeSlot.size,
              this.thirtyMinSize
            )}`,
          };
          return;
        }
        if (checks.timeSlotIsInsideThis) {
          // console.log('overtakes slot');
          data.splice(idx, 1);
          data = this.correctOverlapsForSelected(data);
        }
        return;
      });
      return data;
    }
    hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
            result[3],
            16
          )}`
        : null;
    }
    sortOpaqueParts(opaqueParts) {
      // [12 < 20] <
      // [30 < 40] <
      // [50 < 80] <
      // [90 < 95] <

      let parts = opaqueParts;
      let ptr = parts.length - 1;

      if (ptr <= 0 || parts === null || parts === undefined) {
        return parts;
      }

      function move(input, from, to) {
        let numberOfDeletedElm = 1;

        const elm = input.splice(from, numberOfDeletedElm)[0];

        numberOfDeletedElm = 0;

        input.splice(to, numberOfDeletedElm, elm);
      }

      for (let i = parts.length - 2; i >= 0; i--) {
        if (parts[i].percentages[1] < parts[ptr].percentages[0]) {
          return parts;
        }
        move(parts, ptr, i);
        ptr = i;
      }

      return parts;
    }
    correctOverlapsForAll(timeSlotsData) {
      let data = [...timeSlotsData];
      const color = `rgba(${this.hexToRgb(this.color)}, 1)`;
      const opaqueColor = ` rgba(${this.hexToRgb(this.color)}, 0.5)`;
      let opaqueParts = [];
      let linearGradient = `linear-gradient(90deg, ${color} 0%, ${color} 100%)`;
      // let opaqueParts = [`, ${color} 32%, ${opaqueColor} 32%, ${opaqueColor} 60%, ${color} 60%`]
      // let opaqueParts = [`, ${color} 32%, ${opaqueColor} 32%, ${opaqueColor} 60%, ${color} 60%`, `,  ${color} 80%, ${opaqueColor} 80%, ${opaqueColor} 90%, ${color} 90%`]
      // let linearGradient = `linear-gradient(90deg, ${color} 0%${opaqueParts.join("")}, ${color} 100%)`
      data.forEach((timeSlot, idx) => {
        if (this.key === timeSlot.key) {
          // console.log('same slot');
          return;
        }
        let checks = {
          thisEndIsBetweenTimeSlot:
            this.position + this.size > timeSlot.position &&
            this.position + this.size <= timeSlot.position + timeSlot.size,
          thisStartIsBetweenTimeSlot:
            this.position >= timeSlot.position &&
            this.position < timeSlot.position + timeSlot.size,
          timeSlotIsInsideThis:
            timeSlot.position >= this.position &&
            timeSlot.position < this.position + this.size &&
            timeSlot.position + timeSlot.size > this.position &&
            timeSlot.position + timeSlot.size <= this.position + this.size,
        };
        if (
          checks.thisEndIsBetweenTimeSlot &&
          checks.thisStartIsBetweenTimeSlot
        ) {
          console.log('inside slot');
          // this.position --- 0%
          // this.position + this.size --- 100%
          let opaqueStart = 0;
          let opaqueEnd = 100;
          opaqueParts.push({
            percentages: [opaqueStart, opaqueEnd],
            str: `, ${color} ${opaqueStart}%, ${opaqueColor} ${opaqueStart}%, ${opaqueColor} ${opaqueEnd}%, ${color} ${opaqueEnd}%`,
          });
          opaqueParts = this.sortOpaqueParts(opaqueParts);
          linearGradient = `linear-gradient(90deg, ${color} 0%${opaqueParts
            .map((part) => {
              return part.str;
            })
            .join('')}, ${color} 100%)`;
          this.color = linearGradient;
        }
        if (checks.thisStartIsBetweenTimeSlot) {
          console.log('start overlaps slot');
          // this.position --- 0%
          // timeSlot.position + timeSlot.size - this.position --- ((timeSlot.position + timeSlot.size - this.position)/(this.size))%
          let opaqueStart = 0;
          let opaqueEnd =
            ((timeSlot.position + timeSlot.size - this.position) / this.size) *
            100;
          opaqueParts.push({
            percentages: [opaqueStart, opaqueEnd],
            str: `, ${color} ${opaqueStart}%, ${opaqueColor} ${opaqueStart}%, ${opaqueColor} ${opaqueEnd}%, ${color} ${opaqueEnd}%`,
          });
          opaqueParts = this.sortOpaqueParts(opaqueParts);
          linearGradient = `linear-gradient(90deg, ${color} 0%${opaqueParts
            .map((part) => {
              return part.str;
            })
            .join('')}, ${color} 100%)`;
          this.color = linearGradient;
        }
        if (checks.thisEndIsBetweenTimeSlot) {
          console.log('end overlaps slot');
          // timeSlot.position - this.position --- ((timeSlot.position - this.position)/(this.size))%
          // this.position + this.size --- 100%
          let opaqueStart =
            ((timeSlot.position - this.position) / this.size) * 100;
          let opaqueEnd = 100;
          opaqueParts.push({
            percentages: [opaqueStart, opaqueEnd],
            str: `, ${color} ${opaqueStart}%, ${opaqueColor} ${opaqueStart}%, ${opaqueColor} ${opaqueEnd}%, ${color} ${opaqueEnd}%`,
          });
          opaqueParts = this.sortOpaqueParts(opaqueParts);
          linearGradient = `linear-gradient(90deg, ${color} 0%${opaqueParts
            .map((part) => {
              return part.str;
            })
            .join('')}, ${color} 100%)`;
          this.color = linearGradient;
        }
        if (checks.timeSlotIsInsideThis) {
          console.log('overtakes slot');
          // timeSlot.position
          // thimeSlot.position + timeSlot.size
          let opaqueStart =
            ((timeSlot.position - this.position) / this.size) * 100;
          let opaqueEnd =
            ((timeSlot.position + timeSlot.size - this.position) / this.size) *
            100;
          opaqueParts.push({
            percentages: [opaqueStart, opaqueEnd],
            str: `, ${color} ${opaqueStart}%, ${opaqueColor} ${opaqueStart}%, ${opaqueColor} ${opaqueEnd}%, ${color} ${opaqueEnd}%`,
          });
          opaqueParts = this.sortOpaqueParts(opaqueParts);
          linearGradient = `linear-gradient(90deg, ${color} 0%${opaqueParts
            .map((part) => {
              return part.str;
            })
            .join('')}, ${color} 100%)`;
          this.color = linearGradient;
        }
      });
      console.log(opaqueParts.map((part) => part.percentages));
      return data;
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
  const timeSlotsData = useRef([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [cursor, setCursor] = useState('copy'); // Cursor Style

  // NEW TIMESLOT HANDLERS
  const handleOnMouseDown = (
    e,
    timeSlotsData,
    allViews,
    cell,
    direction,
    label
  ) => {
    // Set new timeSlot
    let color = null;
    let data = timeSlotsData.current;

    allViews.forEach((view) => {
      if (view.view_unique_id.includes('Selected')) {
        color = view.color ? view.color : '#FFFFFF';
      }
    });
    data.push(new TimeSlotData(direction, label, color));
    data[data.length - 1].setCellDistFromBoundingClient(e.target);
    data[data.length - 1].setRawPosition(e);
    data[data.length - 1].setThirtyMinSize(e.target);
    data[data.length - 1].setTime('pos');
    data[data.length - 1].setPosition();
    data[data.length - 1].setSize();

    // Checks if you've clicked on another timeslot
    if (e.target.parentElement.parentElement === cell.current) {
      data = handleOnMouseUpOnMouseLeaveOnPopoverClose(
        timeSlotsData,
        setAllViews
      );
      return data;
    }

    // Adds a listener for dragging out a new timeslot
    cell.current.addEventListener('mousemove', getMouseMoveEvent, true);

    return data;
  };
  const getMouseMoveEvent = useCallback((e) => {
    timeSlotsData.current = handleOnMouseMove(e, timeSlotsData);
    setTimeSlots([
      ...timeSlotsData.current.map((timeSlot, idx) => (
        <div
          key={timeSlot.key}
          style={timeSlot.getStyle()}
          onClick={() => {
            handleOnTimeSlotClick(timeSlotsData, idx);
          }}
        >
          <div className={classes.timeSlot}></div>
        </div>
      )),
    ]);
  }, []);
  const handleOnMouseMove = (e, timeSlotsData) => {
    let data = timeSlotsData.current;

    setCursor('grabbing');
    data[data.length - 1].setRawPosition(e);

    // Set current timeSlot
    if (data[data.length - 1].IsNearThirtyMinMark()) {
      data[data.length - 1].setTime('size');
      data[data.length - 1].setSize();
      data = data[data.length - 1].correctOverlapsForSelected(data);
    }

    return data;
  };
  const handleOnTimeSlotClick = (timeSlotsData, idx) => {
    if (type !== 'all') {
      timeSlotsData.current.splice(idx, 1);
      setTimeSlots([
        ...timeSlotsData.current.map((timeSlot, idx) => (
          <div
            key={timeSlot.key}
            style={timeSlot.getStyle()}
            onClick={() => {
              handleOnTimeSlotClick(timeSlotsData, idx);
            }}
          >
            <div className={classes.timeSlot}></div>
          </div>
        )),
      ]);
    }
  };
  const handleOnMouseUpOnMouseLeaveOnPopoverClose = (timeSlotsData) => {
    let data = timeSlotsData.current;

    if (data.length > 0) {
      data.forEach((timeSlot, idx) => {
        if (timeSlot.size <= 0) {
          data.splice(idx, 1);
        }
      });
    }

    if (type === 'selected') {
      setSlotsData(
        allViews.map((view) => {
          if (view.view_unique_id.includes('Selected')) {
            let schedule = JSON.parse(view.schedule);
            schedule[label] = data.map((timeSlot) => {
              return timeSlot.time;
            });
            view.schedule = JSON.stringify(schedule);
          }
          return view;
        })
      );
    }

    setCursor('copy');
    cell.current.removeEventListener('mousemove', getMouseMoveEvent, true);

    return data;
  };
  const setSelectedViewTimeSlots = (
    timeSlotsData,
    allViews,
    label,
    direction,
    cell
  ) => {
    let data = timeSlotsData.current;
    let selectedView = null;

    data = [];

    // Find selected view
    allViews.forEach((view) => {
      if (view.view_unique_id.includes('Selected')) {
        selectedView = view;
      }
    });

    // Create timeslots based on schedule
    let schedule = JSON.parse(selectedView.schedule)[label];
    if (schedule.length > 0) {
      schedule.forEach((slot) => {
        data.push(
          new TimeSlotData(
            direction,
            label,
            selectedView.color ? selectedView.color : '#FFFFFF',
            slot
          )
        );
        data[data.length - 1].setCellDistFromBoundingClient(cell.current);
        data[data.length - 1].setThirtyMinSize(cell.current);
        data[data.length - 1].setPosition();
        data[data.length - 1].setSize();
        data = data[data.length - 1].correctOverlapsForSelected(data);
      });
    }

    return data;
  };
  const setAllViewsTimeSlots = (
    timeSlotsData,
    allViews,
    label,
    direction,
    cell
  ) => {
    let data = timeSlotsData.current;

    // Create time slots for each views schedule
    data = [];
    allViews.forEach((view) => {
      let schedule = JSON.parse(view.schedule);
      if (schedule[label].length > 0) {
        schedule[label].forEach((slot) => {
          data.push(
            new TimeSlotData(
              direction,
              label,
              view.color ? view.color : '#FFFFFF',
              slot
            )
          );
          data[data.length - 1].setCellDistFromBoundingClient(cell.current);
          data[data.length - 1].setThirtyMinSize(cell.current);
          data[data.length - 1].setPosition();
          data[data.length - 1].setSize();
          data = data[data.length - 1].correctOverlapsForAll(data);
        });
      }
    });

    return data;
  };

  // UPDATE PROPS
  useEffect(() => {
    // Set time slots based on type
    if (type === 'selected' && allViews.length > 0) {
      timeSlotsData.current = setSelectedViewTimeSlots(
        timeSlotsData,
        allViews,
        label,
        direction,
        cell
      );
    } else if (type === 'all' && allViews.length > 0) {
      timeSlotsData.current = setAllViewsTimeSlots(
        timeSlotsData,
        allViews,
        label,
        direction,
        cell
      );
    }
    timeSlotsData.current = handleOnMouseUpOnMouseLeaveOnPopoverClose(
      timeSlotsData,
      setAllViews
    );

    // Update direction and label
    timeSlotsData.current.forEach((timeSlot) => {
      timeSlot.setDirection(direction);
      timeSlot.setLabel(label);
    });

    setTimeSlots([
      ...timeSlotsData.current.map((timeSlot, idx) => (
        <div
          key={timeSlot.key}
          style={timeSlot.getStyle()}
          onClick={() => {
            handleOnTimeSlotClick(timeSlotsData, idx);
          }}
        >
          <div className={classes.timeSlot}></div>
        </div>
      )),
    ]);
  }, [direction, type, label, pixelSize, allViews]);

  // allViews.map((view) => {
  //   if (view.view_unique_id.includes('Selected')) {
  //     return JSON.parse(view.schedule)[label];
  //   }
  // })[2]
  // console.log(JSON.parse(JSON.stringify(timeSlotsData.current)));

  const [anchorEl, setAnchorEl] = useState(null);
  const input = useRef({
    start_time: '10:00',
    end_time: '12:00',
  });
  const handleAddClick = (
    e,
    timeSlotsData,
    allViews,
    label,
    direction,
    cell,
    input,
    setAnchorEl
  ) => {
    setAnchorEl(e.currentTarget);

    let color = null;
    let data = timeSlotsData.current;

    allViews.forEach((view) => {
      if (view.view_unique_id.includes('Selected')) {
        color = view.color ? view.color : '#FFFFFF';
      }
    });

    data.push(new TimeSlotData(direction, label, color, input.current));
    data[data.length - 1].setCellDistFromBoundingClient(cell.current);
    data[data.length - 1].setThirtyMinSize(cell.current);
    data[data.length - 1].setPosition();
    data[data.length - 1].setSize();
    data = data[data.length - 1].correctOverlapsForSelected(data);

    return data;
  };
  const handleTimeChange = (input, timeSlotsData) => {
    let data = timeSlotsData.current;

    setCursor('grabbing');
    data[data.length - 1].setCellDistFromBoundingClient(cell.current);
    // data[data.length - 1].setThirtyMinSize(cell.current);
    data[data.length - 1].setTime('time', input.current);
    data[data.length - 1].setPosition();
    data[data.length - 1].setSize();
    data = data[data.length - 1].correctOverlapsForSelected(data);

    return data;
  };
  const handleClose = () => {
    setAnchorEl(null);
    let defaultInput = {
      start_time: '10:00',
      end_time: '12:00',
    };
    return defaultInput;
  };

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        alignContent: 'center',
        gridTemplateColumns:
          direction === 'horizontal' ? `60px ${pixelSize} 40px` : '',
        gridTemplateRows:
          direction === 'vertical' ? `60px ${pixelSize} 40px` : '',
        flexGrow: '1',
        width: direction === 'horizontal' ? '100%' : '',
        height: direction === 'vertical' ? '100%' : '',
      }}
    >
      {/* LABEL */}
      <h6
        style={{
          justifySelf: direction === 'vertical' ? 'center' : 'right',
          alignSelf: 'center',
          padding: '7.5px 15px',
          fontSize: '0.5em',
          color: '#bbb',
        }}
      >
        {label}
      </h6>

      {/* SCHEDULE */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          cursor: type === 'all' ? '' : cursor,
          flexDirection: direction === 'vertical' ? 'row' : 'column',
          flexWrap: 'nowrap',
          borderLeft: direction === 'vertical' ? '0.5px solid #bbb' : '',
          borderTop: direction === 'horizontal' ? '0.5px solid #bbb' : '',
          width: '100%',
          height: '100%',
        }}
        ref={cell}
        onMouseDownCapture={(e) => {
          if (type === 'selected' && allViews.length > 0) {
            e.persist();
            timeSlotsData.current = handleOnMouseDown(
              e,
              timeSlotsData,
              allViews,
              cell,
              direction,
              label
            );
          }
          setTimeSlots([
            ...timeSlotsData.current.map((timeSlot, idx) => (
              <div
                key={timeSlot.key}
                style={timeSlot.getStyle()}
                onClick={() => {
                  handleOnTimeSlotClick(timeSlotsData, idx);
                }}
              >
                <div className={classes.timeSlot}></div>
              </div>
            )),
          ]);
        }}
        onMouseUpCapture={() => {
          if (type === 'selected' && allViews.length > 0) {
            timeSlotsData.current = handleOnMouseUpOnMouseLeaveOnPopoverClose(
              timeSlotsData,
              setAllViews
            );
          }
          setTimeSlots([
            ...timeSlotsData.current.map((timeSlot, idx) => (
              <div
                key={timeSlot.key}
                style={timeSlot.getStyle()}
                onClick={() => {
                  handleOnTimeSlotClick(timeSlotsData, idx);
                }}
              >
                <div className={classes.timeSlot}></div>
              </div>
            )),
          ]);
        }}
        onMouseLeave={() => {
          if (type === 'selected' && allViews.length > 0) {
            timeSlotsData.current = handleOnMouseUpOnMouseLeaveOnPopoverClose(
              timeSlotsData,
              setAllViews
            );
          }
          setTimeSlots([
            ...timeSlotsData.current.map((timeSlot, idx) => (
              <div
                key={timeSlot.key}
                style={timeSlot.getStyle()}
                onClick={() => {
                  handleOnTimeSlotClick(timeSlotsData, idx);
                }}
              >
                <div className={classes.timeSlot}></div>
              </div>
            )),
          ]);
        }}
      >
        {timeSlots}
      </div>

      {/* ADD TIMESLOT */}
      {type === 'selected' && (
        <div
          style={{
            justifySelf: 'center',
            alignSelf: 'center',
            width: '34px',
            height: '34px',
          }}
        >
          <IconButton
            color="primary"
            size="small"
            aria-label="add to shopping cart"
            onClick={(e) => {
              if (type === 'selected' && allViews.length > 0) {
                timeSlotsData.current = handleAddClick(
                  e,
                  timeSlotsData,
                  allViews,
                  label,
                  direction,
                  cell,
                  input,
                  setAnchorEl
                );
                timeSlotsData.current =
                  handleOnMouseUpOnMouseLeaveOnPopoverClose(
                    timeSlotsData,
                    setAllViews
                  );
              }
              setTimeSlots([
                ...timeSlotsData.current.map((timeSlot, idx) => (
                  <div
                    key={timeSlot.key}
                    style={timeSlot.getStyle()}
                    onClick={() => {
                      handleOnTimeSlotClick(timeSlotsData, idx);
                    }}
                  >
                    <div className={classes.timeSlot}></div>
                  </div>
                )),
              ]);
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
              input.current = handleClose();
              timeSlotsData.current = handleOnMouseUpOnMouseLeaveOnPopoverClose(
                timeSlotsData,
                setAllViews
              );
            }}
            PaperProps={{
              style: {
                display: 'flex',
                padding: '20px 0',
                flexDirection: 'column',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1em',
                color: '#bbb',
              },
            }}
          >
            <h6 style={{ padding: '0 0 10px 0' }}>Select Time Range</h6>
            <div
              style={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <input
                type="time"
                defaultValue={Boolean(anchorEl) ? input.current.start_time : ''}
                name="start_time"
                style={{ margin: '0 20px', padding: '5px' }}
                onChange={(e) => {
                  e.persist();
                  input.current.start_time = e.target.value;
                  if (
                    type === 'selected' &&
                    allViews.length > 0 &&
                    e.target.value !== ''
                  ) {
                    timeSlotsData.current = handleTimeChange(
                      input,
                      timeSlotsData
                    );

                    setTimeSlots([
                      ...timeSlotsData.current.map((timeSlot, idx) => (
                        <div
                          key={timeSlot.key}
                          style={timeSlot.getStyle()}
                          onClick={() => {
                            handleOnTimeSlotClick(timeSlotsData, idx);
                          }}
                        >
                          <div className={classes.timeSlot}></div>
                        </div>
                      )),
                    ]);
                  }
                }}
              />
              -
              <input
                type="time"
                defaultValue={Boolean(anchorEl) ? input.current.end_time : ''}
                name="end_time"
                style={{ margin: '0 20px', padding: '5px' }}
                onChange={(e) => {
                  e.persist();
                  input.current.end_time = e.target.value;
                  if (
                    type === 'selected' &&
                    allViews.length > 0 &&
                    e.target.value !== ''
                  ) {
                    timeSlotsData.current = handleTimeChange(
                      input,
                      timeSlotsData
                    );

                    setTimeSlots([
                      ...timeSlotsData.current.map((timeSlot, idx) => (
                        <div
                          key={timeSlot.key}
                          style={timeSlot.getStyle()}
                          onClick={() => {
                            handleOnTimeSlotClick(timeSlotsData, idx);
                          }}
                        >
                          <div className={classes.timeSlot}></div>
                        </div>
                      )),
                    ]);
                  }
                }}
              />
            </div>
          </Popover>
        </div>
      )}
    </div>
  );
};

export default TimeLine;
