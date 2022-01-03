import React, { useState, useEffect, useContext } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { useHistory, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import { Typography, Button } from '@material-ui/core';
import moment from 'moment';
import { extendMoment } from 'moment-range';
import Grid from '@material-ui/core/Grid';
import LoginContext from '../LoginContext';
import Bookmark from '../images/bookmark.svg';
import trash from '../images/Trash.png';
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
    padding: '20px',
  },
  timeslotButton: {
    width: '8rem',
    height: '2rem',
    maxWidth: '80%',
    color: 'white',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '20px',
    borderRadius: '50px',
    display: 'block',
    margin: '6px 6px',

    '&:hover': {
      background: '#D3A625',
      color: 'white',
    },
    '&:focus': {
      background: '#D3A625',
      color: 'white',
      outline: 'none',
      boxShadow: 'none',
    },
    '&:active': {
      background: '#D3A625',
      color: 'white',
      outline: 'none',
      boxShadow: 'none',
    },
  },
});
export default function Schedule(props) {
  const classes = useStyles();

  const mt = extendMoment(moment);
  const location = useLocation();
  const loginContext = useContext(LoginContext);
  console.log('SCHEDULE PROPS', loginContext);
  console.log('SCHEDULE PROPS', props);
  const [allViews, setAllViews] = useState([]);
  const [allSchedule, setAllSchedule] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedView, setSelectedView] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [eventName, setEventName] = useState([]);
  const [viewID, setViewID] = useState('');
  const [eventID, setEventID] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [buttonSelect, setButtonSelect] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);
  const [showDays, setShowDays] = useState(false);
  const [duration, setDuration] = useState(null);
  const [timeAASlots, setTimeAASlots] = useState([]);
  const [eventColor, setEventColor] = useState([]);
  const [dateString, setDateString] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [showCreateNewMeetModal, setShowCreateNewMeetModal] = useState(false);
  const [meetName, setMeetName] = useState('');
  const [meetLocation, setMeetLocation] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [attendees, setAttendees] = useState([{ email: '' }]);

  const [showUpdateMeetModal, setShowUpdateMeetModal] = useState(false);

  var selectedUser = '';
  if (
    document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('user_uid='))
  ) {
    selectedUser = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_uid='))
      .split('=')[1];
  }
  var accessToken = '';
  var userEmail = '';
  selectedUser = loginContext.loginState.user.id;
  accessToken = loginContext.loginState.user.user_access;
  userEmail = loginContext.loginState.user.email;
  console.log(
    'selecteduser',
    selectedUser,
    accessToken,
    document.cookie,
    location.state
  );
  useEffect(() => {
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllViews/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setAllViews(json.result.result);
        setSelectedSchedule(JSON.parse(json.result.result[0].schedule));
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllEventsUser/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setAllEvents(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetSchedule/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json);
        setAllSchedule(json.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    if (allSchedule != undefined) {
      if (
        allEvents.length !== 0 ||
        allSchedule.length !== 0 ||
        allViews.length !== 0
      ) {
        setIsLoading(false);
      }
    }
  }, [allViews, allEvents, allSchedule, selectedSchedule, refreshKey]);
  useEffect(() => {
    if (timeSelected) {
      axios
        .get(
          'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/AvailableAppointments/' +
            '2022-1-3' +
            '/' +
            duration +
            '/' +
            startTime +
            ',' +
            endTime
        )
        .then((res) => {
          console.log('This is the information we got' + res, duration);

          res.data.result.map((r) => {
            //console.log(res.data.result);
            timeAASlots.push(r['begin_time']);
          });

          //console.log(timeAASlots);
          setTimeAASlots(timeAASlots);
        });
    }

    setTimeSelected(false);
  });
  useEffect(() => {
    if (timeSelected) {
      const headers = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: 'Bearer ' + accessToken,
      };
      const data = {
        timeMin: '2022-01-03' + 'T' + startTime + ':00-0800',
        timeMax: '2022-01-03' + 'T' + endTime + ':00-0800',
        items: [
          {
            id: 'primary',
          },
        ],
      };
      const timeMin = '2022-01-03' + 'T' + startTime + ':00-0800';
      const timeMax = '2022-01-03' + 'T' + endTime + ':00-0800';
      console.log(headers);
      console.log(data);
      console.log(startTime, timeMin, endTime, timeMax);
      axios
        .post(
          `https://www.googleapis.com/calendar/v3/freeBusy?key=${API_KEY}`,
          data,
          {
            headers: headers,
          }
        )
        .then((response) => {
          let busy = response.data.calendars.primary.busy;
          //console.log(busy, appt_start_time, end_time);
          let start_time = Date.parse(timeMin) / 1000;
          let end_time = Date.parse(timeMax) / 1000;
          let free = [];
          let appt_start_time = start_time;

          let seconds = convert(duration);
          console.log(
            start_time,
            end_time,
            startTime,
            timeMin,
            endTime,
            timeMax,
            duration,
            seconds
          );
          // Loop through each appt slot in the search range.
          while (appt_start_time < end_time) {
            console.log('in while');
            // Add appt duration to the appt start time so we know where the appt will end.
            let appt_end_time = appt_start_time + seconds;
            console.log(
              moment(new Date(appt_start_time * 1000)).format('HH:mm:ss'),
              moment(new Date(appt_end_time * 1000)).format('HH:mm:ss'),
              moment(new Date(end_time * 1000)).format('HH:mm:ss')
            );
            // For each appt slot, loop through the current appts to see if it falls
            // in a slot that is already taken.
            let slot_available = true;
            //console.log(busy);
            busy.forEach((times) => {
              let this_start = Date.parse(times['start']) / 1000;
              let this_end = Date.parse(times['end']) / 1000;
              console.log(
                moment(new Date(this_start * 1000)).format('HH:mm:ss'),
                moment(new Date(this_end * 1000)).format('HH:mm:ss')
              );
              // If the appt start time or appt end time falls on a current appt, slot is taken.

              if (
                appt_start_time == this_start ||
                appt_end_time == this_end ||
                (appt_start_time < this_start && appt_end_time > this_end) ||
                (appt_start_time < this_start && appt_end_time < this_end) ||
                (appt_start_time > this_start && appt_end_time > this_end)
              ) {
                slot_available = false;
                return; // No need to continue if it's taken.
              }
            });

            // If we made it through all appts and the slot is still available, it's an open slot.
            if (slot_available) {
              console.log(
                'slot available',
                moment(new Date(appt_start_time * 1000)).format('HH:mm:ss')
              );
              free.push(
                moment(new Date(appt_start_time * 1000)).format('HH:mm:ss')
              );
            }
            // + duration minutes
            appt_start_time += 60 * 30;
            console.log(
              'free',
              moment(new Date(appt_start_time * 1000)).format('HH:mm:ss'),
              free
            );
          }
          setTimeSlots(free);
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
    setTimeSelected(false);
  });
  function getView(viewID) {
    axios
      .get(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetView/${viewID}`
      )
      .then((response) => {
        let schedule = JSON.parse(response.data.result.result[0].schedule);
        setSelectedView(response.data.result.result[0]);
        setSelectedSchedule(schedule);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const openCreateNewMeetModal = () => {
    setShowCreateNewMeetModal((prevState) => {
      return { showCreateNewMeetModal: !prevState.showCreateNewMeetModal };
    });
  };

  const closeCreateNewMeetModal = () => {
    setShowCreateNewMeetModal(false);
  };

  function handleChange(i, event) {
    const emails = [...attendees];
    emails[i].email = event.target.value;
    setAttendees(emails);
  }

  function handleAdd() {
    const emails = [...attendees];
    emails.push({ email: '' });
    setAttendees(emails);
  }

  function handleRemove(i) {
    const emails = [...attendees];
    emails.splice(i, 1);
    setAttendees(emails);
  }

  function createNewMeet() {
    var meeting = {
      user_id: `${selectedUser}`,
      view_id: `${viewID}`,
      event_id: `${eventID}`,
      meeting_name: meetName,
      location: meetLocation,
      attendees: attendees,
      meeting_date: meetDate,
      meeting_time: meetTime,
    };

    axios
      .post(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/AddMeeting',
        meeting
      )
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.log('error', error);
      });
    setShowCreateNewMeetModal(false);
    setTimeSelected(false);
    setShowDays(false);
    setTimeAASlots([]);
    setTimeSlots([]);
  }
  function createMeet() {
    console.log(meetDate, meetTime, duration);
    let start_time = meetDate + 'T' + meetTime + '-0800';
    console.log(start_time);
    let d = convert(duration);
    let et = Date.parse(start_time) / 1000 + d;
    console.log(d);
    console.log(et);
    let end_time = moment(new Date(et * 1000)).format();
    console.log(end_time);
    var meet = {
      summary: meetName,

      location: meetLocation,
      creator: {
        email: userEmail,
        self: true,
      },
      organizer: {
        email: userEmail,
        self: true,
      },
      start: {
        dateTime: start_time,
      },
      end: {
        dateTime: end_time,
      },
      attendees: attendees,
    };
    console.log(meet);
    //publishTheCalenderEvent(event)
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
    };
    axios
      .post(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}`,
        meet,
        {
          headers: headers,
        }
      )
      .then((response) => {})
      .catch((error) => {
        console.log('error', error);
      });
  }
  const createNewMeetModal = () => {
    const modalStyle = {
      position: 'absolute',
      top: '30%',
      left: '30%',
      width: '400px',
    };
    const headerStyle = {
      border: 'none',
      //textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      textTransform: 'uppercase',
      backgroundColor: eventColor,
    };
    const footerStyle = {
      border: 'none',
      backgroundColor: eventColor,
    };
    const bodyStyle = {
      backgroundColor: eventColor,
    };
    const colHeader = {
      margin: '5px',
    };

    return (
      <Modal
        show={showCreateNewMeetModal}
        onHide={closeCreateNewMeetModal}
        style={modalStyle}
      >
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <Typography className={classes.colHeader}>Meeting Name</Typography>
          <Row style={colHeader}>
            <input
              style={{
                width: '344px',
                backgroundColor: eventColor,
                border: '1px solid #636366',
                borderRadius: '3px',
              }}
              value={meetName}
              onChange={(e) => setMeetName(e.target.value)}
            />
          </Row>
          <Typography className={classes.colHeader}>Date and Time</Typography>
          <Row>
            <Col>
              <input
                type="date"
                style={{
                  width: '162px',
                  backgroundColor: eventColor,
                  border: '1px solid #636366',
                  borderRadius: '3px',
                }}
                value={meetDate}
                onChange={(e) => setMeetDate(e.target.value)}
              />
            </Col>
            <Col>
              <input
                type="time"
                style={{
                  width: '162px',
                  backgroundColor: eventColor,
                  border: '1px solid #636366',
                  borderRadius: '3px',
                }}
                value={meetTime}
                onChange={(e) => setMeetTime(e.target.value)}
              />
            </Col>
          </Row>
          <Typography className={classes.colHeader}> Event Type </Typography>
          <Row style={colHeader}>
            {eventName}-
            {Number(duration.substring(0, 1)) > 1
              ? duration.substring(2, 4) !== '59'
                ? Number(duration.substring(0, 1)) +
                  ' hours ' +
                  Number(duration.substring(2, 4)) +
                  ' minutes'
                : Number(duration.substring(0, 1)) + 1 + ' hours'
              : Number(duration.substring(0, 1)) == 1
              ? '60 minutes'
              : duration.substring(2, 4) + ' minutes'}
            meeting
          </Row>

          <Typography className={classes.colHeader}> Email </Typography>
          <Row style={colHeader}>
            {attendees.map((field, idx) => {
              return (
                <input
                  style={{
                    width: '254px',
                    backgroundColor: eventColor,
                    border: '1px solid #636366',
                    borderRadius: '3px',
                  }}
                  type="text"
                  onChange={(e) => handleChange(idx, e)}
                />
              );
            })}
            <div
              style={{
                padding: '0',
                backgroundColor: 'inherit',
                color: '#636366',
                textAlign: 'right',
                cursor: 'pointer',
              }}
              onClick={() => handleAdd()}
            >
              + Add Guests
            </div>
          </Row>
          <Typography className={classes.colHeader}> Location </Typography>
          <Row style={colHeader}>
            <input
              style={{
                width: '254px',
                backgroundColor: eventColor,
                border: '1px solid #636366',
                borderRadius: '3px',
              }}
              value={meetLocation}
              onChange={(e) => setMeetLocation(e.target.value)}
            />
          </Row>
        </Modal.Body>
        <Modal.Footer style={footerStyle}>
          <Row>
            <Col xs={4}>
              <button
                style={{
                  backgroundColor: eventColor,
                  border: '2px solid #2C2C2E',
                  borderRadius: '3px',
                  color: '#2C2C2E',
                }}
                onClick={() => {
                  closeCreateNewMeetModal();
                }}
              >
                Cancel
              </button>
            </Col>
            <Col>
              <button
                style={{
                  background: '#2C2C2E 0% 0% no-repeat padding-box',
                  border: '2px solid #2C2C2E',
                  borderRadius: '3px',
                  color: eventColor,
                }}
                onClick={(e) => {
                  createMeet();
                  createNewMeet();
                }}
              >
                Create Meeting
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  };

  function formatTime(date, time) {
    if (time == null) {
      return '?';
    } else {
      var newDate = new Date((date + 'T' + time).replace(/\s/, 'T'));
      var hours = newDate.getHours();
      var minutes = newDate.getMinutes();

      var ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes;
      var strTime = hours + ':' + minutes + ' ' + ampm;
      return strTime;
    }
  }
  function convert(value) {
    var a = value.split(':'); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];

    return seconds + 1;
  }
  function renderAvailableApptsVertical() {
    console.log('TimeSlots', timeSlots);
    console.log('TimeSlotsAA', timeAASlots);
    let result = [];
    {
      timeSlots.length === 0
        ? (result = timeAASlots)
        : timeAASlots.length === 0
        ? (result = timeSlots)
        : (result = timeSlots.filter((o1) =>
            timeAASlots.some((o2) => o1 === o2)
          ));
    }

    console.log('Merged', result);
    return (
      <Grid container xs={11}>
        {result.map(function (element) {
          return (
            <button
              style={{
                backgroundColor: `${eventColor}`,
                border: `2px solid ${eventColor}`,
                cursor: 'pointer',
              }}
              className={classes.timeslotButton}
              onClick={() => {
                selectApptTime(element);
                openCreateNewMeetModal();
                setMeetTime(element);
              }}
            >
              {formatTime('2022-01-03', element)}
            </button>
          );
        })}
      </Grid>
    );
  }
  function selectApptTime(element) {
    console.log('selected time', element);
    setSelectedTime(element);
    setTimeSelected(true);
    setButtonSelect(true);
  }
  //console.log(dateString)
  function showAvailableDays() {
    return (
      <Row>
        {selectedSchedule.Sunday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Sunday[0].start_time);
              setEndTime(selectedSchedule.Sunday[0].end_time);
            }}
          >
            Sunday
          </Col>
        )}
        {selectedSchedule.Monday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Monday[0].start_time);
              setEndTime(selectedSchedule.Monday[0].end_time);
            }}
          >
            Monday
          </Col>
        )}

        {selectedSchedule.Tuesday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Tuesday[0].start_time);
              setEndTime(selectedSchedule.Tuesday[0].end_time);
            }}
          >
            Tuesday
          </Col>
        )}
        {selectedSchedule.Wednesday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Wednesday[0].start_time);
              setEndTime(selectedSchedule.Wednesday[0].end_time);
            }}
          >
            Wednesday
          </Col>
        )}
        {selectedSchedule.Thursday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Thursday[0].start_time);
              setEndTime(selectedSchedule.Thursday[0].end_time);
            }}
          >
            Thursday
          </Col>
        )}
        {selectedSchedule.Friday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Friday[0].start_time);
              setEndTime(selectedSchedule.Friday[0].end_time);
            }}
          >
            Friday
          </Col>
        )}
        {selectedSchedule.Saturday[0].start_time === '' ? (
          ''
        ) : (
          <Col
            style={{
              backgroundColor: `${eventColor}`,
              border: `2px solid ${eventColor}`,
              cursor: 'pointer',
            }}
            className={classes.timeslotButton}
            onClick={() => {
              setTimeSelected(true);
              setTimeAASlots([]);
              setTimeSlots([]);
              setStartTime(selectedSchedule.Saturday[0].start_time);
              setEndTime(selectedSchedule.Saturday[0].end_time);
            }}
          >
            Saturday
          </Col>
        )}
      </Row>
    );
  }
  console.log(startTime, endTime);
  const weekdaysAndDateDisplay = () => {
    let arr = [];
    let today = new Date();
    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    for (let i = 0; i < 12; i++) {
      arr.push(
        <Col
          key={'day' + i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Col
            style={{
              font: 'normal normal bold 16px SF Pro Display',
              textAlign: 'center',
              padding: '20px 0px',
            }}
          >
            <div
              style={{
                color: '#2C2C2E',
              }}
            >
              {startDate.format('dddd')}
            </div>
            <br />
            <div style={{ color: '#636366' }}>{startDate.format('D')}</div>
          </Col>
        </Col>
      );
      startDate.add(1, 'day');
    }
    return arr;
  };

  const timeDisplay = () => {
    //this essentially creates the time row
    let arr = [];
    for (let i = 0; i < 24; ++i) {
      // if (i < 12) {
      arr.push(
        <Row key={'weekEvent' + i}>
          <Col
            style={{
              textAlign: 'left',
              height: '55px',
              font: 'normal normal normal 12px/14px SF Pro Display',
              //borderBottom: '1px solid #AFAFB3',
            }}
          >
            {i == 0
              ? '12AM'
              : i == 12
              ? i + 'PM'
              : i > 11
              ? i - 12 + 'PM'
              : i + 'AM'}
          </Col>
        </Row>
      );
    }
    return arr;
  };

  const sortSchedule = () => {
    var arr = Object.values(allSchedule);

    var dic = {};
    let today = new Date();

    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    let endDate = dateNew.add(11, 'days');

    for (let i = 0; i < arr.length; i++) {
      //console.log(arr[i], arr.length);
      let day = arr[i];
      //console.log(day);
      for (let j = 0; j < day.length; j++) {
        //console.log(day[j]);
        let tempStart = day[j].schedule.start_time;
        let tempEnd = day[j].schedule.end_time;
        //console.log(day[j], day.length);
        let key = i + '_' + tempStart.substring(0, 2);
        //console.log(key);
        if (dic[key] == null) {
          dic[key] = [];
        }
        dic[key].push(day[j]);
      }
    }
    return dic;
  };

  function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, 0);
  }
  function hex2dec(hex) {
    return hex
      .replace('#', '')
      .match(/.{2}/g)
      .map((n) => parseInt(n, 16));
  }

  function rgb2hex(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  function rgb2cmyk(r, g, b) {
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    let k = Math.min(c, m, y);
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    return [c, m, y, k];
  }

  function cmyk2rgb(c, m, y, k) {
    let r = c * (1 - k) + k;
    let g = m * (1 - k) + k;
    let b = y * (1 - k) + k;
    r = (1 - r) * 255 + 0.5;
    g = (1 - g) * 255 + 0.5;
    b = (1 - b) * 255 + 0.5;
    return [r, g, b];
  }

  function mix_cmyks(...cmyks) {
    let c =
      cmyks.map((cmyk) => cmyk[0]).reduce((a, b) => a + b, 0) / cmyks.length;
    let m =
      cmyks.map((cmyk) => cmyk[1]).reduce((a, b) => a + b, 0) / cmyks.length;
    let y =
      cmyks.map((cmyk) => cmyk[2]).reduce((a, b) => a + b, 0) / cmyks.length;
    let k =
      cmyks.map((cmyk) => cmyk[3]).reduce((a, b) => a + b, 0) / cmyks.length;
    return [c, m, y, k];
  }
  function mix_hexes(...hexes) {
    let rgbs = hexes.map((hex) => hex2dec(hex));
    let cmyks = rgbs.map((rgb) => rgb2cmyk(...rgb));
    let mixture_cmyk = mix_cmyks(...cmyks);
    let mixture_rgb = cmyk2rgb(...mixture_cmyk);
    let mixture_hex = rgb2hex(...mixture_rgb);
    return mixture_hex;
  }
  const getScheduleItemFromDic = (day, hour, dic) => {
    let today = new Date();
    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    let startDay = startDate.format('dddd');
    let endDate = dateNew.add(11, 'days');
    let endDay = endDate.format('dddd');

    var res = [];
    var unique = [];
    var tempStart = null;
    var tempEnd = null;
    var arr = dic[day + '_' + hour];
    var ex = [];

    //console.log('startObject = ', dic.length);

    //console.log('startObject = ', ex);
    var sameTimeEventCount = 0;
    var addmarginLeft = 0;
    let itemWidth = 80;
    var fontSize = 10;
    if (arr == null) {
      return;
    }
    //console.log(arr);
    for (let i = 0; i < arr.length; i++) {
      //console.log(arr[i]);
      tempStart = arr[i].schedule.start_time;
      tempEnd = arr[i].schedule.end_time;
      let minsToMarginTop = (tempStart.substring(3, 5) / 60) * 55;
      let hourDiff = tempEnd.substring(0, 2) - tempStart.substring(0, 2);
      let minDiff =
        tempEnd.substring(3, 5) / 60 - tempStart.substring(3, 5) / 60;
      let height = (hourDiff + minDiff) * 55;
      sameTimeEventCount++;
      let color = 'lightslategray';
      //check if there is already an event there overlapping from another hour

      for (let i = 0; i < arr.length; i++) {
        tempStart = arr[i].schedule.start_time;
        tempEnd = arr[i].schedule.end_time;
        if (
          tempStart.substring(0, 2) < hour &&
          tempEnd.substring(0, 2) > hour
        ) {
          addmarginLeft += 20;
          itemWidth = itemWidth - 20;
        }
      }
      if (sameTimeEventCount <= 1) {
        unique.push(arr[i]);
      }
      if (sameTimeEventCount > 1) {
        addmarginLeft += 20;
        itemWidth = itemWidth - 20;
      }
      //chnage font size if not enough space
      if (tempEnd.substring(0, 2) - tempStart.substring(0, 2) < 2) {
        fontSize = 8;
      }

      // change color if more than one event in same time.
      if (sameTimeEventCount <= 1) {
        color = `${arr[i].color}`;
      } else if (sameTimeEventCount > 1) {
        color = mix_hexes(arr[i - 1].color, arr[i].color);
      } else {
        color = `${arr[i].color}`;
      }

      // Need to strip trailing zeros because the data in the database
      // is inconsistent about this
      const start_time = arr[i].schedule.start_time
        .substring(11)
        .split(/[:\s+]/);
      if (start_time[0][0] == '0') start_time[0] = start_time[0][1];
      const end_time = arr[i].schedule.end_time.substring(11).split(/[:\s+]/);
      if (end_time[0][0] == '0') end_time[0] = end_time[0][1];

      let newElement = (
        <div key={'event' + i}>
          <div
            className="clickButton"
            data-toggle="tooltip"
            data-placement="right"
            key={i}
            style={{
              zIndex: 1,
              marginTop: minsToMarginTop + 'px',
              marginLeft: addmarginLeft + 'px',
              padding: '3px',
              fontSize: fontSize + 'px',
              // border: '1px lightgray solid ',
              // border:
              //   this.props.highLight === arr[i].title
              //     ? '2px solid #FF6B4A '
              //     : '',
              float: 'left',
              background: color,
              width: itemWidth + 'px',
              position: 'absolute',
              height: height + 'px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              opacity: '0.8',
            }}
          >
            {/* insert border change here: */}
          </div>
        </div>
      );

      res.push(newElement);
    }
    return res;
  };
  const weekViewItems = () => {
    // this creates the events adjusting their div size to reflecting the time it's slotted for
    var res = [];
    let dic = sortSchedule();
    var x = [];
    // console.log(dic);

    for (let i = 0; i < 7; ++i) {
      var arr = [];
      for (let j = 0; j < 24; ++j) {
        arr.push(
          <Container key={'weekschedule' + i + j}>
            <Row style={{ position: 'relative' }}>
              <Col
                style={{
                  position: 'relative',
                  // borderTop: '1px solid lavender',
                  // background: 'aliceblue',
                  height: '50px',
                  color: 'white',
                  borderTop: '1px solid #AFAFB3',
                  margin: '0px',
                  padding: '0px',
                  width: '100%',
                }}
              >
                {getScheduleItemFromDic(i, leftFillNum(j, 2), dic)}
              </Col>
            </Row>
          </Container>
        );
      }
      res.push(
        <Col
          key={'daySchedule' + i}
          style={{
            margin: '0px',
            padding: '0px',
          }}
        >
          {arr}
        </Col>
      );
    }
    for (let i = 0; i < 5; ++i) {
      var arr = [];
      for (let j = 0; j < 24; ++j) {
        arr.push(
          <Container key={'weekschedule' + i + j}>
            <Row style={{ position: 'relative' }}>
              <Col
                style={{
                  position: 'relative',
                  // borderTop: '1px solid lavender',
                  // background: 'aliceblue',
                  height: '50px',
                  color: 'white',
                  borderTop: '1px solid #AFAFB3',
                  margin: '0px',
                  padding: '0px',
                  width: '100%',
                }}
              >
                {getScheduleItemFromDic(i, leftFillNum(j, 2), dic)}
              </Col>
            </Row>
          </Container>
        );
      }
      //console.log(arr);
      res.push(
        <Col
          key={'daySchedule' + i}
          style={{
            margin: '0px',
            padding: '0px',
          }}
        >
          {arr}
        </Col>
      );
      //console.log(res);
    }
    return res;
  };
  return (
    <div className={classes.container}>
      {isLoading ? (
        <h1>No Views</h1>
      ) : (
        <div>
          <Row>
            {allViews.map((view) => {
              return (
                <Col>
                  <Typography
                    style={{
                      textTransform: 'uppercase',
                      color: '#2C2C2E',
                      padding: '0',
                      font: 'normal normal normal 20px/25px Prohibition',
                      backgroundColor: `${view.color}`,
                    }}
                  >
                    {view.view_name}
                  </Typography>

                  <Row>
                    {allEvents.map((event) => {
                      return (
                        <div>
                          {event.view_id === view.view_unique_id ? (
                            <div
                              onClick={() => {
                                setTimeSelected(false);
                                setTimeSlots([]);
                                setTimeAASlots([]);
                                setShowDays(true);
                                setDuration(event.duration);
                                setEventColor(view.color);
                                getView(event.view_id);
                                setViewID(event.view_id);
                                setEventID(event.event_unique_id);
                                setEventName(event.event_name);
                              }}
                            >
                              <div
                                style={{
                                  marginTop: '20px',
                                  marginLeft: '10px',
                                  width: '213px',
                                  cursor: 'pointer',
                                  //height: '148px',
                                  backgroundColor: `${view.color}`,
                                  padding: '0px 10px',
                                }}
                              >
                                <Row>
                                  <Col style={{ paddingLeft: '7px' }}>
                                    <Typography
                                      style={{
                                        textTransform: 'uppercase',
                                        color: '#2C2C2E',
                                        padding: '0',
                                        font: 'normal normal normal 20px/25px Prohibition',
                                      }}
                                    >
                                      {event.event_name}
                                    </Typography>
                                  </Col>
                                  <Col xs={2}>
                                    <img src={Bookmark} alt="bookmark" />
                                  </Col>
                                </Row>
                                <div
                                  style={{
                                    font: 'normal normal normal 14px/16px SF Pro Display',
                                  }}
                                >
                                  <div>
                                    {Number(event.duration.substring(0, 1)) > 1
                                      ? event.duration.substring(2, 4) !== '59'
                                        ? Number(
                                            event.duration.substring(0, 1)
                                          ) +
                                          ' hrs ' +
                                          Number(
                                            event.duration.substring(2, 4)
                                          ) +
                                          ' min'
                                        : Number(
                                            event.duration.substring(0, 1)
                                          ) +
                                          1 +
                                          ' hrs'
                                      : Number(
                                          event.duration.substring(0, 1)
                                        ) == 1
                                      ? '60 min'
                                      : event.duration.substring(2, 4) + ' min'}
                                  </div>
                                  <div>
                                    Location:{' '}
                                    {event.location === ''
                                      ? 'None Specified'
                                      : event.location}
                                  </div>
                                  <div>
                                    -
                                    {JSON.parse(
                                      event.buffer_time
                                    ).before.time.substring(3, 5)}{' '}
                                    / +
                                    {JSON.parse(
                                      event.buffer_time
                                    ).after.time.substring(3, 5)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div></div>
                          )}
                        </div>
                      );
                    })}
                  </Row>
                </Col>
              );
            })}
          </Row>
          <div>{showCreateNewMeetModal && createNewMeetModal()}</div>
          {/* <div>{showUpdateEventModal && updateEventModal()}</div> */}
          <Row
            fluid
            style={{
              justifyContent: 'center',
              margin: '20px 0px',
              padding: '0px',
            }}
          >
            {showDays === true ? <div>{showAvailableDays()}</div> : <div></div>}
          </Row>
          <Row
            fluid
            style={{
              justifyContent: 'center',
              margin: '20px 0px',
              padding: '0px',
            }}
          >
            {renderAvailableApptsVertical()}
          </Row>
          <Container
            fluid
            style={{
              borderTop: '1px solid #AFAFB3',
              margin: '20px 0px',
              padding: '0px',
            }}
          >
            <Row>
              <Col
                xs={1}
                style={{
                  color: '#636366',
                  font: 'normal normal bold 16px SF Pro Display',
                  paddingTop: '20px',
                }}
              >
                <br></br>
                <br></br>
                {moment().format('MMMM')}
              </Col>
              <Col>
                <Row>{weekdaysAndDateDisplay()}</Row>
              </Col>
            </Row>
          </Container>

          <Row
            noGutters={true}
            style={{ marginLeft: '0rem', marginRight: '0rem' }}
          >
            <Col xs={1}>
              <Container style={{ margin: '0', padding: '0' }}>
                {timeDisplay()}
              </Container>
            </Col>

            <Col>
              <Row>{weekViewItems()}</Row>
            </Col>
          </Row>
        </div>
      )}
    </div>
  );
}
