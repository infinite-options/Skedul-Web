import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Row, Col, Modal } from 'react-bootstrap';
import { Typography } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import makeStyles from '@material-ui/core/styles/makeStyles';
import {
  signInToGoogle,
  initClient,
  getSignedInUserEmail,
  publishTheCalenderEvent,
} from './GoogleApiService';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
    padding: '20px',
  },
  timeslotButton: {
    width: '12rem',
    //height: '2rem',
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
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export default function CreateMeet() {
  const classes = useStyles();
  const [selectedEvent, setSelectedEvent] = useState([]);
  const [viewColor, setViewColor] = useState('');
  const [viewID, setViewID] = useState('');
  const [eventName, setEventName] = useState([]);
  const [selectedView, setSelectedView] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [buttonSelect, setButtonSelect] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);
  const [showDays, setShowDays] = useState(false);
  const [duration, setDuration] = useState(null);
  const [dateString, setDateString] = useState('');
  const [timeAASlots, setTimeAASlots] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [accessToken, setAccessToken] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const [showCreateNewMeetModal, setShowCreateNewMeetModal] = useState(false);
  const [meetName, setMeetName] = useState('');
  const [meetLocation, setMeetLocation] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetTime, setMeetTime] = useState('');
  const [attendees, setAttendees] = useState([{ email: userEmail }]);

  const [signedin, setSignedIn] = useState(false);
  const [googleAuthedEmail, setgoogleAuthedEmail] = useState('');

  let curURL = window.location.href;
  const eventID = curURL.substring(curURL.length - 10);
  useEffect(() => {
    initClient((success) => {
      if (success) {
        getGoogleAuthorizedEmail();
      }
    });
  }, []);

  const getGoogleAuthorizedEmail = async () => {
    let email = await getSignedInUserEmail();
    if (email) {
      setSignedIn(true);
      setgoogleAuthedEmail(email);
      setShowDays(true);
    }
  };
  const getAuthToGoogle = async () => {
    let successfull = await signInToGoogle();
    if (successfull) {
      getGoogleAuthorizedEmail();
    }
    console.log('booknowbtn', successfull);
  };
  console.log(googleAuthedEmail);
  useEffect(() => {
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetEvent/${eventID}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json.result.result[0]);
        setSelectedEvent(json.result.result[0]);
        let viewID = json.result.result[0].view_id;
        let userID = json.result.result[0].user_id;
        axios
          .get(
            `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetView/${viewID}`
          )
          .then((response) => {
            let schedule = JSON.parse(response.data.result.result[0].schedule);
            setSelectedView(response.data.result.result[0]);
            setSelectedSchedule(schedule);
            setViewID(response.data.result.result[0].view_unique_id);
            setViewColor(response.data.result.result[0].color);
          })
          .catch((error) => {
            console.log(error);
          });

        axios
          .get(
            `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserDetails/${userID}`
          )
          .then((response) => {
            console.log(response.data);
            setAccessToken(response.data.google_auth_token);
            setSelectedUser(response.data.user_unique_id);
            setUserEmail(response.data.user_email_id);
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    if (selectedEvent.length !== 0) {
      setIsLoading(false);
    }
    console.log(selectedEvent);
  }, [selectedEvent, selectedSchedule, refreshKey]);
  console.log(userEmail);
  useEffect(() => {
    if (timeSelected) {
      axios
        .get(
          'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/AvailableAppointments/' +
            dateString +
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
        timeMin: dateString + 'T' + startTime + ':00-0800',
        timeMax: dateString + 'T' + endTime + ':00-0800',
        items: [
          {
            id: 'primary',
          },
        ],
      };
      const timeMin = dateString + 'T' + startTime + ':00-0800';
      const timeMax = dateString + 'T' + endTime + ':00-0800';
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

  function getView() {
    axios
      .get(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetView/${viewID}`
      )
      .then((response) => {
        console.log(JSON.parse(response.data.result.result[0].schedule));
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
    emails.push({ email: userEmail });
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
    setMeetName('');
    setMeetDate('');
    setMeetLocation('');
    setMeetTime('');
    setAttendees([{ email: userEmail }]);
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
        email: googleAuthedEmail,
        self: true,
      },
      organizer: {
        email: googleAuthedEmail,
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

    publishTheCalenderEvent(meet);
    setTimeSelected(false);
    setShowDays(false);
    setMeetName('');
    setMeetDate('');
    setMeetLocation('');
    setMeetTime('');
    setAttendees([{ email: userEmail }]);
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
      backgroundColor: viewColor,
    };
    const footerStyle = {
      border: 'none',
      backgroundColor: viewColor,
    };
    const bodyStyle = {
      backgroundColor: viewColor,
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
                backgroundColor: viewColor,
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
                  backgroundColor: viewColor,
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
                  backgroundColor: viewColor,
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
                    backgroundColor: viewColor,
                    border: '1px solid #636366',
                    borderRadius: '3px',
                  }}
                  type="text"
                  placeholder={userEmail}
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
                backgroundColor: viewColor,
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
                  backgroundColor: viewColor,
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
                  color: viewColor,
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
  function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = '0' + dd;
    }
    if (mm < 10) {
      mm = '0' + mm;
    }
    date = mm + '/' + dd + '/' + yyyy;
    return date;
  }
  function Last7Days() {
    var result = [];
    var resultDay = [];
    let date = {};
    for (var i = 0; i < 7; i++) {
      var d = new Date();
      var x = new Date().getDay();
      d.setDate(d.getDate() + i);
      x = moment(d).format('dddd');
      result.push(formatDate(d));
      resultDay.push(x);
      date[x] = moment(d).format('YYYY-MM-DD');
    }
    //result.join(',');
    //resultDay.join(',');
    console.log(result);
    console.log(resultDay);
    // date = {
    //   day: resultDay,
    //   date: result,
    // };
    console.log(date);
    return date;
  }
  function renderAvailableApptsVertical() {
    console.log('TimeSlots', timeSlots);
    console.log('TimeSlotsAA', timeAASlots);

    Last7Days();
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
                backgroundColor: `${viewColor}`,
                border: `2px solid ${viewColor}`,
                cursor: 'pointer',
              }}
              className={classes.timeslotButton}
              onClick={() => {
                selectApptTime(element);
                openCreateNewMeetModal();
                setMeetDate(dateString);
                setMeetTime(element);
              }}
            >
              {formatTime(dateString, element)}
            </button>
          );
        })}
      </Grid>
    );
  }
  function selectApptTime(element) {
    console.log('selected time', element);
    setSelectedTime(element);
    //setTimeSelected(true);
    setButtonSelect(true);
  }
  //console.log(dateString)
  function showAvailableDays() {
    // let x = Last7Days();
    // //console.log(x);
    // for (var i = 0; i < 7; i++) {
    //   if (x.day[i] == 'Sunday') {
    //     console.log(x.date[i]);
    //   }
    // }
    let dateRange = Last7Days();
    console.log(dateRange);
    return (
      <Row>
        {selectedSchedule.Sunday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Sunday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Sunday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Sunday[0].start_time);
                  setEndTime(selectedSchedule.Sunday[0].end_time);
                }}
              >
                <div>Sunday</div>
                {dateRange['Sunday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Monday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Monday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Monday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Monday[0].start_time);
                  setEndTime(selectedSchedule.Monday[0].end_time);
                }}
              >
                <div>Monday</div>
                {dateRange['Monday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}

        {selectedSchedule.Tuesday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Tuesday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Tuesday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Tuesday[0].start_time);
                  setEndTime(selectedSchedule.Tuesday[0].end_time);
                }}
              >
                <div>Tuesday</div>
                {dateRange['Tuesday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Wednesday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Wednesday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Wednesday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Wednesday[0].start_time);
                  setEndTime(selectedSchedule.Wednesday[0].end_time);
                }}
              >
                <div>Wednesday</div>
                {dateRange['Wednesday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Thursday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Thursday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Thursday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Thursday[0].start_time);
                  setEndTime(selectedSchedule.Thursday[0].end_time);
                }}
              >
                <div>Thursday</div>
                {dateRange['Thursday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Friday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Friday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Friday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Friday[0].start_time);
                  setEndTime(selectedSchedule.Friday[0].end_time);
                }}
              >
                <div>Friday</div>
                {dateRange['Friday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Saturday[0].start_time === '' ? (
          ''
        ) : (
          <div>
            {dateRange.hasOwnProperty('Saturday') ? (
              <Col
                style={{
                  backgroundColor: `${viewColor}`,
                  border: `2px solid ${viewColor}`,
                  cursor: 'pointer',
                }}
                className={classes.timeslotButton}
                onClick={() => {
                  setTimeSelected(true);
                  setDateString(dateRange['Saturday']);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Saturday[0].start_time);
                  setEndTime(selectedSchedule.Saturday[0].end_time);
                }}
              >
                <div>Saturday</div>
                {dateRange['Saturday']}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
      </Row>
    );
  }

  return (
    <div className={classes.container}>
      {console.log(selectedEvent, selectedEvent.duration)}
      {isLoading ? (
        <h1>No Views</h1>
      ) : (
        <div>
          <div
            style={{
              marginTop: '20px',
              marginLeft: '10px',
              width: '213px',
              //height: '148px',
              backgroundColor: `${viewColor}`,
              padding: '0px 10px',
            }}
            onClick={() => {
              getAuthToGoogle();
              setSignedIn(true);
              setTimeSelected(false);
              setTimeSlots([]);
              setTimeAASlots([]);
              setDuration(selectedEvent.duration);
              getView();
              setViewID(selectedEvent.view_id);
              setEventName(selectedEvent.event_name);
            }}
          >
            <Row>
              <Col style={{ paddingLeft: '7px' }}>
                <Typography
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '24px',
                    color: '#2C2C2E',
                    padding: '0',
                    font: 'normal normal normal 24px/30px Prohibition',
                  }}
                >
                  {selectedEvent.event_name}
                </Typography>
              </Col>
            </Row>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'normal',
                font: 'normal normal normal 14px/16px SF Pro Display',
              }}
            >
              <div>
                {Number(selectedEvent.duration.substring(0, 1)) > 1
                  ? selectedEvent.duration.substring(2, 4) !== '59'
                    ? Number(selectedEvent.duration.substring(0, 1)) +
                      ' hrs ' +
                      Number(selectedEvent.duration.substring(2, 4)) +
                      ' min'
                    : Number(selectedEvent.duration.substring(0, 1)) +
                      1 +
                      ' hrs'
                  : Number(selectedEvent.duration.substring(0, 1)) == 1
                  ? '60 min'
                  : selectedEvent.duration.substring(2, 4) + ' min'}
              </div>
              <div>
                Location:{' '}
                {selectedEvent.location === ''
                  ? 'None Specified'
                  : selectedEvent.location}
              </div>
              <div>
                -
                {JSON.parse(selectedEvent.buffer_time).before.time.substring(
                  3,
                  5
                )}{' '}
                / +
                {JSON.parse(selectedEvent.buffer_time).after.time.substring(
                  3,
                  5
                )}
              </div>
            </div>
          </div>
          <div>{showCreateNewMeetModal && createNewMeetModal()}</div>
          <Row
            fluid
            style={{
              justifyContent: 'center',
              margin: '20px 0px',
              padding: '0px',
            }}
          >
            {showDays === true && googleAuthedEmail.length != 0 ? (
              <div>{showAvailableDays()}</div>
            ) : (
              <div></div>
            )}
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
        </div>
      )}
    </div>
  );
}
