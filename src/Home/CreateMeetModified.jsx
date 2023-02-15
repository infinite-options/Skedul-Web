import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

import { useHistory } from "react-router-dom";
import { Row, Col, Container, Form, Modal } from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import { signInToGoogle, initClient, getSignedInUserEmail, publishTheCalenderEvent } from "./GoogleApiService";
import GoogleLogin from "react-google-login";
import "../styles/createmeet.css";

import LoginContext from "../LoginContext";
import { type } from "@testing-library/user-event/dist/type";
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;

export default function CreateMeet() {
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

  const loginContext = useContext(LoginContext);
  const history = useHistory();
  const [loggedIn, setLoggedIn] = useState(false);
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newFName, setNewFName] = useState("");
  const [newLName, setNewLName] = useState("");
  const [socialId, setSocialId] = useState("");
  const [refreshToken, setrefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessExpiresIn, setaccessExpiresIn] = useState("");

  const [selectedEvent, setSelectedEvent] = useState([]);
  const [viewColor, setViewColor] = useState("");
  const [viewID, setViewID] = useState("");
  const [eventName, setEventName] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);

  const [googleAuthedEmail, setgoogleAuthedEmail] = useState("");
  const [googleAuthedName, setgoogleAuthedName] = useState("");

  const [signedin, setSignedIn] = useState(false);
  const [signUp, setSignUp] = useState(false);
  const [timeSelected, setTimeSelected] = useState(false);
  const [showDays, setShowDays] = useState(false);
  const [showTimes, setShowTimes] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [meetingConfirmed, setMeetingConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [timeSlots, setTimeSlots] = useState([]);
  const [timeAASlots, setTimeAASlots] = useState([]);
  const [duration, setDuration] = useState(null);
  const [dateString, setDateString] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userID, setUserID] = useState("");

  const [showCreateNewMeetModal, setShowCreateNewMeetModal] = useState(false);
  const [meetName, setMeetName] = useState("");
  const [meetLocation, setMeetLocation] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [attendees, setAttendees] = useState([{ email: "" }]);

  const client_id = CLIENT_ID;
  const client_secret = CLIENT_SECRET;

  const responseGoogle = (response) => {
    console.log("response", response);

    let auth_code = response.code;
    let authorization_url = "https://accounts.google.com/o/oauth2/token";

    console.log("auth_code", auth_code);
    var details = {
      code: auth_code,
      client_id: client_id,
      client_secret: client_secret,
      //redirect_uri: 'http://localhost:3000',
      redirectUri: "https://skedul.online",
      grant_type: "authorization_code",
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");

    fetch(authorization_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: formBody,
    })
      .then((response) => {
        return response.json();
      })
      .then((responseData) => {
        console.log(responseData);
        return responseData;
      })
      .then((data) => {
        console.log(data);
        let at = data["access_token"];
        let rt = data["refresh_token"];
        let ax = data["expires_in"].toString();
        setAccessToken(at);
        setrefreshToken(rt);
        setaccessExpiresIn(ax);
        console.log("res", at, rt);

        axios
          .get("https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=" + at)
          .then((response) => {
            console.log(response.data);

            let data = response.data;
            //setUserInfo(data);
            let e = data["email"];
            let fn = data["given_name"];
            let ln = data["family_name"];
            let si = data["id"];

            setNewEmail(e);
            setNewFName(fn);
            setNewLName(ln);
            setSocialId(si);
            axios.get(BASE_URL + "GetEmailId/" + e).then((response) => {
              console.log(response.data);
              if (response.data.message === "User EmailID doesnt exist") {
                setSocialSignUpModalShow(!socialSignUpModalShow);
              } else {
                console.log("ACCESS", accessToken);
                document.cookie = "user_uid=" + response.data.result;
                document.cookie = "user_email=" + e;
                document.cookie = "user_access=" + accessToken.toString();
                setLoggedIn(true);
                setgoogleAuthedEmail(e.toString());
                loginContext.setLoginState({
                  ...loginContext.loginState,
                  loggedIn: true,
                  user: {
                    ...loginContext.loginState.user,
                    id: response.data.result.toString(),
                    email: e.toString(),
                    user_access: accessToken.toString(),
                  },
                });

                history.push({
                  pathname: document.location.href.substring(21, 39),
                  state: {
                    email: e.toString(),
                    accessToken: accessToken.toString(),
                  },
                });
              }
            });
          })
          .catch((error) => {
            console.log("its in landing page");
            console.log(error);
          });

        // setSocialSignUpModalShow(!socialSignUpModalShow);

        return accessToken, refreshToken, accessExpiresIn, newEmail, newFName, newLName, socialId;
      })
      .catch((err) => {
        console.log(err);
      });
  };

  let curURL = window.location.href;
  const eventID = curURL.substring(curURL.length - 10);
  console.log("Event ID parsed: ", eventID);

  useEffect(() => {
    initClient((success) => {
      if (success) {
        getGoogleAuthorizedEmail();
      }
    });
  }, []);

  const getGoogleAuthorizedEmail = async () => {
    let profile = [];
    profile = await getSignedInUserEmail();

    if (profile) {
      setSignedIn(true);
      let email = profile[0];
      let fullName = profile[1];
      setgoogleAuthedEmail(email);
      setgoogleAuthedName(fullName);
      setSignedIn(true);
    }
  };
  const getAuthToGoogle = async () => {
    let successfull = await signInToGoogle();
    if (successfull) {
      getGoogleAuthorizedEmail();
    }
    //console.log('booknowbtn', successfull);
  };

  useEffect(() => {
    const url = BASE_URL + `GetWeekAvailableAppointments/${eventID}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log("Running endpoint");
        console.log("Get Week Available Appointments Result: ", json.result[0]);
        setSelectedEvent(json.result[0]);

        let event_unique_id = json.result[0].event_unique_id;
        let user_id = json.result[0].user_id;
        let view_id = json.result[0].view_id;
        let event_name = json.result[0].event_name;
        let location = json.result[0].location;
        let duration = json.result[0].duration;
        let before_time = json.result[0].before_time;
        let before_enabled = json.result[0].before_enabled;
        let after_time = json.result[0].after_time;
        let after_enabled = json.result[0].after_enabled;
        let view_name = json.result[0].view_name;
        let color = json.result[0].color;
        let schedule = JSON.parse(json.result[0].schedule);
        // setSelectedEvent(event_unique_id);
        setUserID(user_id);
        setViewID(view_id);
        setEventName(event_name);
        setMeetLocation(location);
        setDuration(duration);
        setViewColor(color);
        setSelectedSchedule(schedule);

        console.log("Variables input and set: ", user_id, view_id, event_name);
        console.log("Schedule: ", schedule);

        axios
          .get(BASE_URL + `UserDetails/${user_id}`)
          .then((response) => {
            //console.log(response.data);
            setAccessToken(response.data.google_auth_token);
            setSelectedUser(response.data.user_unique_id);
            setUserEmail(response.data.user_email_id);
            setNewAttendees((a) => {
              a[0].email = response.data.user_email_id;
              return a;
            });
            setAttendees([{ email: response.data.user_email_id }]);
            setUserName(response.data.user_first_name + "" + response.data.user_last_name);
            var old_at = response.data.google_auth_token;
            var refresh_token = response.data.google_refresh_token;
            //console.log(refresh_token);
            //console.log('in events', old_at);
            fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`, {
              method: "GET",
            }).then((response) => {
              //console.log('in events', response);
              if (response["status"] === 400) {
                //console.log('in events if');
                let authorization_url = "https://accounts.google.com/o/oauth2/token";

                var details = {
                  refresh_token: refresh_token,
                  client_id: CLIENT_ID,
                  client_secret: CLIENT_SECRET,
                  grant_type: "refresh_token",
                };
                //console.log(details);
                var formBody = [];
                for (var property in details) {
                  var encodedKey = encodeURIComponent(property);
                  var encodedValue = encodeURIComponent(details[property]);
                  formBody.push(encodedKey + "=" + encodedValue);
                }
                formBody = formBody.join("&");

                fetch(authorization_url, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                  },
                  body: formBody,
                })
                  .then((response) => {
                    return response.json();
                  })
                  .then((responseData) => {
                    console.log(responseData);
                    return responseData;
                  })
                  .then((data) => {
                    //console.log(data);
                    let at = data["access_token"];
                    setAccessToken(at);
                    //console.log('in events', at);
                    let url = BASE_URL + `UpdateAccessToken/${user_id}`;
                    axios
                      .post(url, {
                        google_auth_token: at,
                      })
                      .then((response) => {})
                      .catch((err) => {
                        console.log(err);
                      });
                    return accessToken;
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              } else {
                setAccessToken(old_at);
                //console.log(old_at);
              }
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => console.log("Error: ", error));
  }, [refreshKey]);

  console.log("Stored in Selected Event: ", selectedEvent);

  useEffect(() => {
    console.log("selectedEvent length: ", selectedEvent.length);
    console.log("is Loading Status 1: ", isLoading);
    if (selectedEvent.length !== 0) {
      setIsLoading(false);
    }
  }, [selectedEvent, selectedSchedule, refreshKey]);
  console.log("Attendees and userEmail: ", attendees, userEmail);

  useEffect(() => {
    if (timeSelected) {
      axios.get(BASE_URL + "AvailableAppointments/" + dateString + "/" + duration + "/" + startTime + "," + endTime).then((res) => {
        res.data.result.map((r) => {
          timeAASlots.push(r["begin_time"]);
        });
        setTimeAASlots(timeAASlots);
      });
    }

    setTimeSelected(false);
  });

  useEffect(() => {
    if (timeSelected) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + accessToken,
      };
      const data = {
        timeMin: dateString + "T" + startTime + ":00-0800",
        timeMax: dateString + "T" + endTime + ":00-0800",
        items: [
          {
            id: "primary",
          },
        ],
      };
      const timeMin = dateString + "T" + startTime + ":00-0800";
      const timeMax = dateString + "T" + endTime + ":00-0800";
      // timeMin and timeMax reformat the schedule.Sunday[0] startTime and endTime

      axios
        .post(`https://www.googleapis.com/calendar/v3/freeBusy?key=${API_KEY}`, data, {
          headers: headers,
        })
        .then((response) => {
          let busy = response.data.calendars.primary.busy;
          let start_time = Date.parse(timeMin) / 1000;
          let end_time = Date.parse(timeMax) / 1000;
          let appt_start_time = start_time;
          // start_time and end_time === startTime and endTime

          let free = [];
          let seconds = convert(duration);
          // Loop through each appt slot in the search range.
          while (appt_start_time < end_time) {
            //console.log('in while');
            // Add appt duration to the appt start time so we know where the appt will end.
            let appt_end_time = appt_start_time + seconds;

            // For each appt slot, loop through the current appts to see if it falls
            // in a slot that is already taken.
            let slot_available = true;
            //console.log(busy);
            busy.forEach((times) => {
              let this_start = Date.parse(times["start"]) / 1000;
              let this_end = Date.parse(times["end"]) / 1000;

              // If the appt start time or appt end time falls on a current appt, slot is taken.

              // if (
              //   appt_start_time == this_start ||
              //   appt_end_time == this_end ||
              //   (appt_start_time < this_start && appt_end_time > this_end) ||
              //   (appt_start_time < this_start && appt_end_time < this_end) ||
              //   (appt_start_time > this_start && appt_end_time > this_end)
              // ) {
              //   slot_available = false;
              //   return; // No need to continue if it's taken.
              // }
              if ((appt_start_time >= this_start && appt_start_time < this_end) || (appt_end_time > this_start && appt_end_time <= this_end)) {
                slot_available = false;
                return; // No need to continue if it's taken.
              }
            });

            // If we made it through all appts and the slot is still available, it's an open slot.
            if (slot_available) {
              free.push(moment(new Date(appt_start_time * 1000)).format("HH:mm:ss"));
            }
            // + duration minutes
            appt_start_time += 60 * 30;
          }
          setTimeSlots(free);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
    setTimeSelected(false);
  });

  function getView() {
    axios
      .get(BASE_URL + `GetView/${viewID}`)
      .then((response) => {
        let schedule = JSON.parse(response.data.result.result[0].schedule);

        setSelectedSchedule(schedule);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const openCreateNewMeetModal = () => {
    setShowButton(false);
    setShowCreateNewMeetModal((prevState) => {
      return {
        showCreateNewMeetModal: !prevState.showCreateNewMeetModal,
      };
    });
  };

  const closeCreateNewMeetModal = () => {
    setShowCreateNewMeetModal(false);
  };

  const [newAttendees, setNewAttendees] = useState([{ email: "" }, { email: "" }]);
  function handleChange(i, event) {
    const emails = [...attendees];
    console.log(emails);
    emails[i].email = event.target.value;
    setAttendees(emails);
    setNewAttendees((a) => {
      console.log(a);
      a[a.length - 1].email = event.target.value;
      return a;
    });
    console.log(emails);
  }

  function handleAdd() {
    const emails = [...attendees];
    console.log(emails);
    emails.push({ email: userEmail });
    setAttendees(emails);
    setNewAttendees((a) => {
      a.push({ email: "" });
      return a;
    });
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
      .post(BASE_URL + "AddMeeting", meeting)
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.log("error", error);
      });
    setShowCreateNewMeetModal(false);
    setTimeSelected(false);
    setShowDays(false);
    setShowTimes(false);
    setMeetingConfirmed(true);
    setTimeAASlots([]);
    setTimeSlots([]);
    setMeetName("");
    //setMeetDate('');
    setMeetLocation("");
    //setMeetTime('');
    setAttendees([{ email: "" }]);
  }
  function createMeet() {
    //console.log(meetDate, meetTime, duration);
    let start_time = meetDate + "T" + meetTime + "-0800";
    //console.log(start_time);
    let d = convert(duration);
    let et = Date.parse(start_time) / 1000 + d;
    //console.log(d);
    //console.log(et);
    let end_time = moment(new Date(et * 1000)).format();
    attendees.push({ email: userEmail });
    console.log(attendees);
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
    setShowTimes(false);
    setMeetingConfirmed(true);
    setMeetName("");
    //setMeetDate('');
    setMeetLocation("");
    //setMeetTime('');
    setAttendees([{ email: "" }]);
  }

  function formatTime(date, time) {
    if (time == null) {
      return "?";
    } else {
      var newDate = new Date((date + "T" + time).replace(/\s/, "T"));
      var hours = newDate.getHours();
      var minutes = newDate.getMinutes();

      var ampm = hours >= 12 ? "pm" : "am";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var strTime = hours + ":" + minutes + " " + ampm;
      return strTime;
    }
  }
  function convert(value) {
    var a = value.split(":"); // split it at the colons

    // minutes are worth 60 seconds. Hours are worth 60 minutes.
    var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];

    return seconds + 1;
  }
  function formatDate(date) {
    var dd = date.getDate();
    var mm = date.getMonth() + 1;
    var yyyy = date.getFullYear();
    if (dd < 10) {
      dd = "0" + dd;
    }
    if (mm < 10) {
      mm = "0" + mm;
    }
    date = mm + "/" + dd + "/" + yyyy;
    return date;
  }
  // function Last7Days() {
  //   console.log("In Last7Days");
  //   var result = [];
  //   var resultDay = [];
  //   let date = {};
  //   for (var i = 0; i < 7; i++) {
  //     var d = new Date();
  //     var x = new Date().getDay();
  //     console.log("Date & Day:", i, d, x);
  //     d.setDate(d.getDate() + i);
  //     x = moment(d).format("dddd");
  //     console.log(i, d, x);
  //     result.push(formatDate(d));
  //     resultDay.push(x);
  //     date[x] = moment(d).format("YYYY-MM-DD");
  //     console.log(resultDay, date);
  //     // console.log(resultDay);
  //     // console.log(date);
  //   }
  //   console.log("Date: ", date);
  //   return date;
  // }

  function Last7Days() {
    console.log("In Last7Days", selectedSchedule);

    const result = {};
    let keys = Object.keys(selectedSchedule); // Retrieves only the KEYS from selectedSchedule JSON object as an ARRAY
    // console.log("Keys: ", keys);
    keys.map((k) => {
      // for each element of the array
      // console.log("K: ", k);
      let x = [];
      x = k.split(" "); // split the element
      // console.log("X: ", x, x[0], x[1]);
      result[x[0]] = x[1]; // store it as a key:value pair in result
      // console.log("Result: ", result);
    });

    // console.log("Last 7 Days result: ", result);
    return result;
  }

  // var result = [];
  // var resultDay = [];
  // let date = {};
  // for (var i = 0; i < 7; i++) {
  //   var d = new Date();
  //   var x = new Date().getDay();
  //   console.log("Date & Day:", i, d, x);
  //   d.setDate(d.getDate() + i);
  //   x = moment(d).format("dddd");
  //   console.log(i, d, x);
  //   result.push(formatDate(d));
  //   resultDay.push(x);
  //   date[x] = moment(d).format("YYYY-MM-DD");
  //   console.log(resultDay, date);
  //   // console.log(resultDay);
  //   // console.log(date);
  // }
  // console.log("Date: ", date);
  //   return;
  // }

  // STRATEGY IS TO REWRITE THIS FUNCTION TO DISPLAY THE DAYS
  function renderAvailableTimesVertical() {
    console.log("In render Available Appointments", dateString);

    console.log(`Here are the Time Slots on the Selected Day: ${selectedSchedule[dateString]} ${dateString}`);
    // Data is stored in an array

    // const array1 = ["a", "b", "c"];

    // array1.forEach((element) => console.log(element));

    const availTimes = `${selectedSchedule[dateString]}`;
    console.log("This is currently in the array: ", availTimes, typeof availTimes);

    // const listOfTimes = availTimes.map((someVarialble) => {someFunction})

    // const listOfTimes = JSON.parse(availTimes).map((eachObject) => {
    // console.log("This is what is in each Object; ", eachObject);
    // console.log("This is what is in each Object; ", eachObject.start_time);
    return (
      <Col
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("Button Clicked Time Selected ");
          // setTimeSelected(false); // triggers UseEffect line 394 to call AvailableAppointments endpoint
          // setShowTimes(true); // Not sure what this does
          // // setDateString(dateRange["Sunday"]);
          // setDateString(displayDay);
          // console.log("STORED IN DATERANGE: ", dateRange);
          // console.log("Day Selected: ", displayDay);
          // renderAvailableTimesVertical(displayDay);
          // setTimeAASlots([]);
          // setTimeSlots([]);
          // setStartTime(selectedSchedule.Sunday[0].start_time);
          // setEndTime(selectedSchedule.Sunday[0].end_time);
        }}
      >
        {JSON.parse(availTimes).map((eachObject) => {
          return (
            <button>
              {console.log("Start Time: ", eachObject.start_time)}
              {eachObject.start_time}
            </button>
          );
        })}
      </Col>
    );
  }

  // console.log(listOfTimes[0].end_time);

  // const listOfTimes = availTimes.map((displayTime) => (
  //   <Col
  //     style={{
  //       cursor: "pointer",
  //     }}
  //     onClick={() => {
  //       console.log("Button Clicked Time Selected ");
  //       // setTimeSelected(false); // triggers UseEffect line 394 to call AvailableAppointments endpoint
  //       // setShowTimes(true); // Not sure what this does
  //       // // setDateString(dateRange["Sunday"]);
  //       // setDateString(displayDay);
  //       // console.log("STORED IN DATERANGE: ", dateRange);
  //       // console.log("Day Selected: ", displayDay);
  //       // renderAvailableTimesVertical(displayDay);
  //       // setTimeAASlots([]);
  //       // setTimeSlots([]);
  //       // setStartTime(selectedSchedule.Sunday[0].start_time);
  //       // setEndTime(selectedSchedule.Sunday[0].end_time);
  //     }}
  //   >
  //     {console.log(displayTime)}
  //     {displayTime.start_time}
  //   </Col>
  // ));

  // listOfTimes.forEach((element) => console.log(element));

  //   let availTimes = Object.keys(`${selectedSchedule[displayDay]}`);

  //   const listOfTimes = availTimes.map((displayDay) => (
  //     <Col
  //       style={{
  //         cursor: "pointer",
  //       }}
  //       onClick={() => {
  //         console.log("Button Clicked Time Selected ");
  //         setTimeSelected(false); // triggers UseEffect line 394 to call AvailableAppointments endpoint
  //         setShowTimes(true); // Not sure what this does
  //         // setDateString(dateRange["Sunday"]);
  //         setDateString(displayDay);
  //         console.log("Day Selected: ", displayDay);
  //         setTimeAASlots([]);
  //         setTimeSlots([]);
  //         setStartTime(selectedSchedule.Sunday[0].start_time);
  //         setEndTime(selectedSchedule.Sunday[0].end_time);
  //       }}
  //     >
  //       {displayDay}
  //     </Col>
  //   ));
  // }

  function renderAvailableApptsVertical() {
    console.log("In render Available Appointments");

    Last7Days();

    let result = [];
    console.log("In render Date: ", timeAASlots);
    {
      timeSlots.length === 0 ? (result = timeAASlots) : timeAASlots.length === 0 ? (result = timeSlots) : (result = timeSlots.filter((o1) => timeAASlots.some((o2) => o1 === o2)));
    }
    console.log("In render Appts: ", timeSlots);

    return (
      <div>
        <div style={{ height: "10rem" }}>
          <Grid container direction="column" spacing={1} style={{ height: "20rem" }}>
            {result.map(function (element) {
              console.log("Meeting Info; ", element);
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                  }}
                  className={meetTime === element ? `${"activeTimeButton"}` : `${"timeButton"}`}
                  onClick={() => {
                    setMeetDate(dateString);
                    setMeetTime(element);
                    setShowButton(true);
                  }}
                >
                  {formatTime(dateString, element)}
                </Box>
              );
            })}
          </Grid>
        </div>
      </div>
    );
  }

  //console.log(dateString)
  function showAvailableDays() {
    console.log("In Show Available Days");
    console.log("Selected Schedule: ", selectedSchedule);
    console.log("Selected Schedule for Friday 2023-02-10: ", `${selectedSchedule["Friday 2023-02-10"]}`);
    let dateRange = Last7Days();
    console.log("showAvailableDays result:", dateRange);
    let keys = Object.keys(selectedSchedule);
    console.log("Keys: ", keys);
    console.log("Sunday: ", keys[2]);

    console.log("Object Keys with For Each Study");

    // let genders = Object.keys(population);
    // genders.forEach((gender) => console.log(gender));
    keys.forEach((key) => console.log(key));

    // genders.forEach((gender) => {
    //   console.log(`There are ${population[gender]} ${gender}`);
    // });
    console.log("Object Keys with For Each to Return Value Study");
    keys.forEach((key) => {
      if (`${selectedSchedule[key]}` !== "[]") {
        // this shows the value for each key
        console.log(`Here are the avialable days: ${selectedSchedule[key]} ${key}`);
      }
    });

    // let populationArr = Object.entries(population);
    // console.log(populationArr);

    // OBJECT STUDY
    console.log("Object Values Study");
    let scheduleValues = Object.values(selectedSchedule);
    console.log("Schedule Values: ", scheduleValues);
    console.log(`Here are the corresponding lengths: ${scheduleValues.length}`);

    console.log("Object Entries Study");
    let scheduleEntries = Object.entries(selectedSchedule);
    console.log("Schedule Entries: ", scheduleEntries);
    scheduleEntries.forEach((entry) => {
      console.log(`Here is the key: ${Object.keys(scheduleEntries)}`);
      // console.log(`Here are the corresponding lengths: ${scheduleEntries.entry.length}`);
    });
    // console.log(`Here are the corresponding lengths: ${scheduleEntries.length}`);

    console.log("Reduce selectedSchedule to only the days avaialble");
    const filteredAvailability = {};
    keys.forEach((key) => {
      if (`${selectedSchedule[key]}` !== "[]") {
        //  let x = [];
        //     x = k.split(" "); // split the element
        //     // console.log("X: ", x, x[0], x[1]);
        //     result[x[0]] = x[1];

        // let x = [];
        // result[x[${key}]] = x[${selectedSchedule[key]}];
        // this shows the value for each key
        filteredAvailability[`${key}`] = `${selectedSchedule[key]}`;
        console.log(`Here are the avialable days: ${key}`);
        console.log(`Here are the avialable times: ${selectedSchedule[key]}`);
      }
      console.log("Resultant Array: ", filteredAvailability);
    });

    let availDay = Object.keys(filteredAvailability);

    // THIS WORKS
    // const listOfDays = availDay.map(
    //   (displayDay) => <p>{displayDay}</p>
    // );

    const listOfDays = availDay.map((displayDay) => (
      <Col
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("Button Clicked Date Selected ");
          setTimeSelected(false); // triggers UseEffect line 394 to call AvailableAppointments endpoint
          setShowTimes(true); // Not sure what this does
          // setDateString(dateRange["Sunday"]);
          setDateString(displayDay);
          console.log("STORED IN DATERANGE: ", dateRange);
          console.log("Day Selected: ", displayDay);
          // renderAvailableTimesVertical(displayDay);
          setTimeAASlots([]);
          setTimeSlots(displayDay);
          setStartTime(selectedSchedule.Sunday[0].start_time);
          setEndTime(selectedSchedule.Sunday[0].end_time);
        }}
      >
        {displayDay}
      </Col>
    ));

    // (
    //   <Col
    //     style={{
    //       cursor: "pointer",
    //     }}
    //     className={dateString === dateRange["Sunday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
    //     onClick={() => {
    //       setTimeSelected(true);
    //       setShowTimes(true);
    //       setDateString(dateRange["Sunday"]);
    //       setTimeAASlots([]);
    //       setTimeSlots([]);
    //       setStartTime(selectedSchedule.Sunday[0].start_time);
    //       setEndTime(selectedSchedule.Sunday[0].end_time);
    //     }}
    //   >
    //     Sunday, {dateRange["Sunday"]}
    //   </Col>
    // )

    //   // ORIGINAL RANJIT REFERENCE
    //   .map((filteredRestaurant) => (
    //     <RecommendationCard key={filteredRestaurant.place_id} restaurant={filteredRestaurant} deleteRecHandler={() => deleteRecHandler(filteredRestaurant)} />
    //   ));

    console.log("This is what is in ListOfDays: ", listOfDays);

    // THIS IS THE RETURN STATEMENT OF WHAT IS DISPLAYED ON THE SCREEN
    return (
      <Col>
        {console.log("THIS IS WHAT I WANT TO MAP: ", filteredAvailability)}
        {availDay.forEach((key) => console.log(key))}

        {listOfDays}

        {/* {selectedSchedule.Sunday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Sunday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Sunday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Sunday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Sunday[0].start_time);
                  setEndTime(selectedSchedule.Sunday[0].end_time);
                }}
              >
                Sunday, {dateRange["Sunday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Monday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Monday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Monday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Monday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Monday[0].start_time);
                  setEndTime(selectedSchedule.Monday[0].end_time);
                }}
              >
                Monday, {""}
                {dateRange["Monday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Tuesday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Tuesday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Tuesday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Tuesday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Tuesday[0].start_time);
                  setEndTime(selectedSchedule.Tuesday[0].end_time);
                }}
              >
                Tuesday, {dateRange["Tuesday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Wednesday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Wednesday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Wednesday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Wednesday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Wednesday[0].start_time);
                  setEndTime(selectedSchedule.Wednesday[0].end_time);
                }}
              >
                Wednesday, {dateRange["Wednesday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Thursday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Thursday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Thursday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Thursday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Thursday[0].start_time);
                  setEndTime(selectedSchedule.Thursday[0].end_time);
                }}
              >
                Thursday, {dateRange["Thursday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Friday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Friday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Friday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Friday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Friday[0].start_time);
                  setEndTime(selectedSchedule.Friday[0].end_time);
                }}
              >
                Friday, {dateRange["Friday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )}
        {selectedSchedule.Saturday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Saturday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={dateString === dateRange["Saturday"] ? `${"activeTimeSlotButton"}` : `${"timeslotButton"}`}
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Saturday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setStartTime(selectedSchedule.Saturday[0].start_time);
                  setEndTime(selectedSchedule.Saturday[0].end_time);
                }}
              >
                Saturday, {dateRange["Saturday"]}
              </Col>
            ) : (
              <div></div>
            )}
          </div>
        )} */}
      </Col>
    );
  }

  const hideSignUp = () => {
    //setSignUpModalShow(false);
    setSocialSignUpModalShow(false);
    //history.push(document.location.href.substring(21, 39));
    setRefreshKey((oldKey) => oldKey + 1);
    setSignedIn(true);
    setNewFName("");
    setNewLName("");
  };
  const handleNewEmailChange = (event) => {
    setNewEmail(event.target.value);
  };

  const handleNewFNameChange = (event) => {
    setNewFName(event.target.value);
  };

  const handleNewLNameChange = (event) => {
    setNewLName(event.target.value);
  };

  const handleSocialSignUpDone = () => {
    axios
      .post(BASE_URL + "UserSocialSignUp", {
        email_id: newEmail,
        first_name: newFName,
        last_name: newLName,
        time_zone: "",
        google_auth_token: accessToken,
        google_refresh_token: refreshToken,
        social_id: socialId,
        access_expires_in: accessExpiresIn,
      })
      .then((response) => {
        console.log(response);
        setSignedIn(true);
        setgoogleAuthedEmail(newEmail);
        hideSignUp();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const socialSignUpModal = () => {
    return (
      <Modal show={socialSignUpModalShow} onHide={hideSignUp} style={{ marginTop: "70px" }}>
        <Form as={Container}>
          <h3
            className="bigfancytext formEltMargin"
            style={{
              textAlign: "center",
              letterSpacing: "0.49px",
              color: "#000000",
              opacity: 1,
            }}
          >
            Sign Up with Social Media
          </h3>
          <Form.Group className="formEltMargin">
            <Form.Group as={Row} className="formEltMargin">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={newFName}
                  onChange={handleNewFNameChange}
                  style={{
                    background: "#FFFFFF 0% 0% no-repeat padding-box",
                    borderRadius: "26px",
                    opacity: 1,
                    width: "230px",
                  }}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={newLName}
                  onChange={handleNewLNameChange}
                  style={{
                    background: "#FFFFFF 0% 0% no-repeat padding-box",
                    borderRadius: "26px",
                    opacity: 1,
                    width: "230px",
                  }}
                />
              </Col>
            </Form.Group>

            <Col>
              <Form.Group as={Row} className="formEltMargin">
                <Form.Control
                  plaintext
                  readOnly
                  value={newEmail}
                  style={{
                    background: "#FFFFFF 0% 0% no-repeat padding-box",
                    borderRadius: "26px",
                    opacity: 1,
                    width: "500px",
                  }}
                />
              </Form.Group>
            </Col>
          </Form.Group>

          <Form.Group className="formEltMargin">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <button
                variant="primary"
                type="submit"
                onClick={handleSocialSignUpDone}
                style={{
                  background: "#F8BE28 0% 0% no-repeat padding-box",
                  borderRadius: "20px",
                  opacity: 1,
                  width: "300px",
                }}
              >
                Sign Up
              </button>

              <button
                variant="primary"
                type="submit"
                onClick={hideSignUp}
                style={{
                  marginTop: "10px",
                  background: "#FF6B4A 0% 0% no-repeat padding-box",
                  borderRadius: "20px",
                  opacity: 1,
                  width: "300px",
                }}
              >
                Cancel
              </button>
            </div>
          </Form.Group>
        </Form>
      </Modal>
    );
  };
  return (
    <div className="container">
      {console.log("This is the value of isLoading: ", isLoading)}
      {isLoading ? (
        <Row>
          <h1>Is Loading is True Modified Page, {isLoading}</h1>
          <Col>
            <Typography>Just schedule this meeting</Typography>
            <button
              style={{
                background: "#2C2C2E 0% 0% no-repeat padding-box",
                border: "2px solid #2C2C2E",
                borderRadius: "3px",
                color: " #F3F3F8",
              }}
            >
              Proceed
            </button>
          </Col>
          <Col>
            <Typography>Sign up for SKEDUL and stay in control</Typography>
            <button
              style={{
                background: "#2C2C2E 0% 0% no-repeat padding-box",
                border: "2px solid #2C2C2E",
                borderRadius: "3px",
                color: " #F3F3F8",
              }}
            >
              Sign Up
            </button>
          </Col>
        </Row>
      ) : (
        <div>
          <h1>Is Loading is False Modified Page, {isLoading}</h1>
          {signedin ? (
            <div>
              <Row>
                <h1>Is Signed In is True</h1>
                <Col xs={2}>
                  <div
                    style={{
                      marginTop: "20px",
                      width: "212px",
                      marginLeft: "10px",
                      cursor: "pointer",
                      backgroundColor: `${viewColor}`,
                      padding: "0px 10px",
                    }}
                    onClick={() => {
                      // getAuthToGoogle();
                      // setSignedIn(true);
                      console.log("Button Clicked - Event Selected");
                      setShowDays(true);
                      setMeetingConfirmed(false);
                      setTimeSelected(false);
                      setTimeSlots([]);
                      setTimeAASlots([]);
                      setDuration(selectedEvent.duration);
                      // getView();
                      // setViewID(selectedEvent.view_id);
                      // setEventName(selectedEvent.event_name);
                    }}
                  >
                    <Col>
                      <Col style={{ paddingLeft: "7px" }}>
                        <Typography
                          style={{
                            textTransform: "uppercase",
                            fontSize: "24px",
                            color: "#2C2C2E",
                            padding: "0",
                            font: "normal normal normal 24px/30px Prohibition",
                          }}
                        >
                          {console.log("Selected Event: ", selectedEvent.event_name)}
                          {selectedEvent.event_name}
                        </Typography>
                      </Col>
                    </Col>
                    <div
                      style={{
                        fontSize: "14px",
                        fontWeight: "normal",
                        font: "normal normal normal 14px/16px SF Pro Display",
                      }}
                    >
                      <div>
                        {console.log("Selected Event Duration: ", selectedEvent.duration)}
                        {Number(selectedEvent.duration.substring(0, 2)) > 1
                          ? selectedEvent.duration.substring(3, 5) !== "59"
                            ? Number(selectedEvent.duration.substring(0, 2)) + " hrs " + Number(selectedEvent.duration.substring(3, 5)) + " min"
                            : Number(selectedEvent.duration.substring(0, 2)) + 1 + " hrs"
                          : Number(selectedEvent.duration.substring(0, 2)) == 1
                          ? "60 min"
                          : selectedEvent.duration.substring(3, 5) + " min"}
                      </div>
                      <div>Location: {selectedEvent.location === "" ? "None Specified" : selectedEvent.location}</div>
                      {/* <div>
                        -{JSON.parse(selectedEvent.buffer_time).before.time.substring(3, 5)} / +{JSON.parse(selectedEvent.buffer_time).after.time.substring(3, 5)}
                      </div> */}
                      <div>
                        -{selectedEvent.before_time} / +{selectedEvent.after_time}
                      </div>
                    </div>
                  </div>
                  {console.log("Display Meeting Card: ", showCreateNewMeetModal)}
                  <div hidden={!showCreateNewMeetModal}>
                    <Typography
                      style={{
                        textTransform: "none",
                        //fontSize: '24px',
                        color: "#2C2C2E",
                        padding: "0",
                        font: "normal normal bold 18px/21px SF Pro Display",
                      }}
                    >
                      {console.log("Meeting Time: ", meetTime)}
                      {meetTime.substring(0, 5)} <br />
                      {console.log("Meeting Day: ", meetDate)}
                      {moment(meetDate).format("MMMM DD, YYYY")}
                      {console.log("Meeting Day: ", meetDate)}
                    </Typography>
                  </div>
                </Col>
                {/* <div>{showCreateNewMeetModal && createNewMeetModal()}</div> */}
                <Col
                  xs={3}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "start",
                    margin: " 0 100px",
                    padding: "0px",
                  }}
                  hidden={showCreateNewMeetModal || meetingConfirmed}
                >
                  {" "}
                  {showDays === true && googleAuthedEmail.length != 0 ? (
                    <div>
                      <Typography
                        style={{
                          textTransform: "none",
                          //fontSize: '24px',
                          color: "#2C2C2E",
                          padding: "0",
                          font: "normal normal bold 18px/21px SF Pro Display",
                        }}
                      >
                        Select a Date & Time
                      </Typography>
                      {console.log("In Select a Date & Time")}
                      {showAvailableDays()}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </Col>

                <Col
                  xs={4}
                  style={{
                    justifyContent: "center",
                    margin: "20px 0px",
                    padding: "0px",
                  }}
                  hidden={showCreateNewMeetModal || meetingConfirmed}
                >
                  {showTimes === true ? (
                    <div>
                      {" "}
                      <Typography
                        style={{
                          textTransform: "none",
                          //fontSize: '24px',
                          color: "#2C2C2E",
                          padding: "0",
                          font: "normal normal bold 14px/16px SF Pro Display",
                        }}
                      >
                        Available Times
                      </Typography>
                      {renderAvailableTimesVertical()}
                    </div>
                  ) : (
                    <div></div>
                  )}
                </Col>
                {showCreateNewMeetModal ? (
                  <Col
                    xs={6}
                    //hidden={!showCreateNewMeetModal}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyItems: "left",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {console.log("In showCreateNewMeet Modal here")}
                      <Typography className={"colHeader"}>Meeting Name</Typography>
                      <Row>
                        <input
                          style={{
                            width: "344px",
                            backgroundColor: " #F3F3F8",
                            border: "1px solid #636366",
                            borderRadius: "3px",
                          }}
                          value={meetName}
                          onChange={(e) => setMeetName(e.target.value)}
                        />
                      </Row>
                      <Typography className={"colHeader"}>Date and Time</Typography>
                      <Row>
                        <Col>
                          <input
                            type="date"
                            style={{
                              width: "162px",
                              backgroundColor: " #F3F3F8",
                              border: "1px solid #636366",
                              borderRadius: "3px",
                            }}
                            value={meetDate}
                            onChange={(e) => setMeetDate(e.target.value)}
                          />
                        </Col>
                        <Col>
                          <input
                            type="time"
                            style={{
                              width: "162px",
                              backgroundColor: " #F3F3F8",
                              border: "1px solid #636366",
                              borderRadius: "3px",
                            }}
                            value={meetTime}
                            onChange={(e) => setMeetTime(e.target.value)}
                          />
                        </Col>
                      </Row>
                      <Typography className={"colHeader"}> Event Type </Typography>
                      <Row className={"colBody"}>
                        {eventName}-
                        {Number(duration.substring(0, 2)) > "01"
                          ? duration.substring(3, 5) !== "59"
                            ? Number(duration.substring(0, 2)) + " hours " + Number(duration.substring(3, 5)) + " minutes"
                            : Number(duration.substring(0, 2)) + 1 + " hours"
                          : Number(duration.substring(0, 2)) == "01"
                          ? "60 minutes"
                          : duration.substring(3, 5) + " minutes"}
                        meeting
                      </Row>

                      <Typography className={"colHeader"}> Guests </Typography>
                      {/* <Typography className={"colBody"}>
                                                {googleAuthedName}
                                            </Typography>
                                            <Typography className={"colBody"}>
                                                {userName}
                                            </Typography> */}
                      <div
                        style={{
                          padding: "0",
                          backgroundColor: "inherit",
                          color: "#636366",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                        onClick={() => handleAdd()}
                      >
                        + Add Guests
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flexWrap: "nowrap",
                        }}
                      >
                        {attendees.map((field, idx) => {
                          return (
                            <input
                              style={{
                                width: "254px",
                                backgroundColor: " #F3F3F8",
                                border: "1px solid #636366",
                                borderRadius: "3px",
                              }}
                              type="text"
                              onChange={(e) => handleChange(idx, e)}
                            />
                          );
                        })}
                      </div>
                      <Typography className={"colHeader"}> Location </Typography>
                      <Row>
                        <input
                          style={{
                            width: "254px",
                            backgroundColor: " #F3F3F8",
                            border: "1px solid #636366",
                            borderRadius: "3px",
                          }}
                          value={meetLocation}
                          onChange={(e) => setMeetLocation(e.target.value)}
                        />
                      </Row>

                      <Row style={{ margin: "5px" }}>
                        <Col xs={4}>
                          <button
                            style={{
                              backgroundColor: " #F3F3F8",
                              border: "2px solid #2C2C2E",
                              borderRadius: "3px",
                              color: "#2C2C2E",
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
                              background: "#2C2C2E 0% 0% no-repeat padding-box",
                              border: "2px solid #2C2C2E",
                              borderRadius: "3px",
                              color: " #F3F3F8",
                            }}
                            onClick={(e) => {
                              console.log();
                              createMeet();
                              createNewMeet();
                            }}
                          >
                            Schedule Meeting
                          </button>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                ) : null}
                {meetingConfirmed ? (
                  <Col
                    //xs={6}
                    //hidden={!showCreateNewMeetModal}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      //justifyItems: 'left',
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      style={{
                        margin: "5rem",
                        textTransform: "none",
                        //fontSize: '24px',
                        color: "#2C2C2E",
                        padding: "0",
                        font: "normal normal bold 20px SF Pro Display",
                      }}
                    >
                      You are all set for {moment(meetDate).format("MMMM DD, YYYY")} at {meetTime.substring(0, 5)} <br /> The email invite has been sent to{" "}
                      {newAttendees.map((attendee, idx) => {
                        if (newAttendees.length === 1) {
                          return attendee.email;
                        }
                        if (newAttendees.length === 2) {
                          if (idx === 0) {
                            return attendee.email;
                          } else {
                            return " and " + attendee.email;
                          }
                        }
                        if (newAttendees.length > 2) {
                          if (idx === 0) {
                            return attendee.email;
                          } else if (idx > 0 && idx < newAttendees.length - 1) {
                            return ", " + attendee.email;
                          } else {
                            return ", and " + attendee.email;
                          }
                        }
                      })}
                      .
                    </Typography>
                  </Col>
                ) : null}
              </Row>
              {showButton === true ? (
                <Row
                  style={{
                    marginTop: "8rem",
                  }}
                >
                  <Col
                    xs={12}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      className={"activeTimeSlotButton"}
                      onClick={() => {
                        openCreateNewMeetModal();
                      }}
                    >
                      Confirm Date and Time
                    </button>
                  </Col>
                </Row>
              ) : null}
            </div>
          ) : (
            <Row
              style={{
                margin: "6rem 20px",
                padding: "0px",
              }}
            >
              <h1>Is Signed In is False</h1>
              <Col
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyItems: "left",
                  alignItems: "center",
                }}
              >
                <Typography
                  style={{
                    textAlign: "center",
                    font: "normal normal normal 36px SF Pro Display",
                    letterSpacing: "0px",
                    color: "#2C2C2E",
                    marginBottom: "3rem",
                  }}
                >
                  Just schedule this meeting
                </Typography>
                <button
                  style={{
                    background: "#2C2C2E 0% 0% no-repeat padding-box",
                    border: "2px solid #2C2C2E",
                    borderRadius: "3px",
                    color: " #F3F3F8",
                    font: "normal normal normal 18px SF Pro Display",
                    width: "6rem",
                    height: "3rem",
                    padding: "0.5rem",
                  }}
                  onClick={() => {
                    getAuthToGoogle();
                  }}
                >
                  Proceed
                </button>
              </Col>
              <Col
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyItems: "left",
                  alignItems: "center",
                }}
              >
                <Typography
                  style={{
                    textAlign: "center",
                    font: "normal normal normal 36px SF Pro Display",
                    letterSpacing: "0px",
                    color: "#2C2C2E",
                    marginBottom: "3rem",
                  }}
                >
                  Sign up for{" "}
                  <span
                    style={{
                      font: "normal normal normal 36px Prohibition",
                    }}
                  >
                    SKEDUL
                  </span>{" "}
                  and stay in control
                </Typography>
                <button
                  style={{
                    background: "#2C2C2E 0% 0% no-repeat padding-box",
                    border: "2px solid #2C2C2E",
                    borderRadius: "3px",
                    color: " #F3F3F8",
                    font: "normal normal normal 18px SF Pro Display",
                    width: "6rem",
                    height: "3rem",
                    padding: "0.5rem",
                  }}
                >
                  <GoogleLogin
                    //clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                    clientId={client_id}
                    accessType="offline"
                    prompt="consent"
                    responseType="code"
                    buttonText="Log In"
                    ux_mode="redirect"
                    //redirectUri="http://localhost:3000"
                    redirectUri="https://skedul.online"
                    scope="https://www.googleapis.com/auth/calendar"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                    isSignedIn={false}
                    disable={true}
                    cookiePolicy={"single_host_origin"}
                    render={(renderProps) => (
                      <div onClick={renderProps.onClick} disabled={renderProps.disabled} alt={""}>
                        Sign Up
                      </div>
                    )}
                  />
                </button>
              </Col>
              {socialSignUpModal()}
            </Row>
          )}
        </div>
      )}
    </div>
  );
}