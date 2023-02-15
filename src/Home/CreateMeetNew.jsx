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

  // Get Event ID from URL
  let curURL = window.location.href;
  const eventID = curURL.substring(curURL.length - 10);
  // console.log("Event ID parsed: ", eventID);
  // console.log("Attendees and userEmail: ", attendees, userEmail);
  // console.log("Stored in Selected Event: ", selectedEvent);

  useEffect(() => {
    const url = BASE_URL + `GetWeekAvailableAppointments/${eventID}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        // console.log("Running endpoint");
        console.log("JSON OBJECT returned from GetWeekAvailableAppointments: ", json.result[0]);
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

        setUserID(user_id);
        setViewID(view_id);
        setEventName(event_name);
        setMeetLocation(location);
        setDuration(duration);
        setViewColor(color);
        setSelectedSchedule(schedule);

        // console.log("Variables input and set: ", user_id, view_id, event_name, duration, typeof duration);
        // console.log("Schedule: ", schedule);

        axios
          .get(BASE_URL + `UserDetails/${user_id}`)
          .then((response) => {
            console.log("JSON OBJECT returned from UserDetails: : ", response.data);
            setAccessToken(response.data.google_auth_token);
            setSelectedUser(response.data.user_unique_id);
            setUserEmail(response.data.user_email_id);
            // setNewAttendees((a) => {
            //   a[0].email = response.data.user_email_id;
            //   return a;
            // });
            setAttendees([{ email: response.data.user_email_id }]);
            setUserName(response.data.user_first_name + "" + response.data.user_last_name);
            var old_at = response.data.google_auth_token;
            var refresh_token = response.data.google_refresh_token;
            //console.log(refresh_token);
            //console.log('in events', old_at);
            fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`, {
              method: "GET",
            }).then((response) => {
              console.log("Fetch Access Token: ", response);
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

  const calcDuration = () => {
    console.log("In calcDuration", selectedEvent.duration);
    let test =
      Number(selectedEvent.duration?.substring(0, 2)) > 1
        ? selectedEvent.duration?.substring(3, 5) !== "59"
          ? Number(selectedEvent.duration?.substring(0, 2)) + " hrs " + Number(selectedEvent.duration?.substring(3, 5)) + " min"
          : Number(selectedEvent.duration?.substring(0, 2)) + 1 + " hrs"
        : Number(selectedEvent.duration?.substring(0, 2)) == 1
        ? "60 min"
        : selectedEvent.duration?.substring(3, 5) + " min";

    // let test = selectedEvent.duration;
    // return <div>Hello World</div>;
    return test;
  };

  function showLocation() {
    console.log("In Show Location", meetLocation);
    let startText = "Location: ";
    let result = startText.concat(selectedEvent.location === "" ? "None Specified" : selectedEvent.location);
    return result;
  }

  function showBuffer() {
    console.log("In Show Buffer");
    let startText = "-";
    let result = startText.concat(selectedEvent.before_time, "/ +", selectedEvent.after_time);
    return result;
  }

  function showEvents() {
    console.log("In Show Events", eventName);

    return (
      <div
        onClick={() => {
          console.log("Button Clicked - Event Selected");
          setShowDays(true);
          setShowTimes(false);
          setShowButton(false);
          setShowCreateNewMeetModal(false);
        }}
      >
        {" "}
        <div
          style={{
            textTransform: "uppercase",
            fontSize: "24px",
            color: "#2C2C2E",
            padding: "0",
            font: "normal normal normal 24px/30px Prohibition",
          }}
        >
          {selectedEvent.event_name}
        </div>
        <div className="eventBody">
          <div>
            {calcDuration()}
            <br />
            {showLocation()}
            <br />
            {showBuffer()}
          </div>
        </div>
      </div>
    );
  }

  function showAvailableDays() {
    console.log("In Show Available Days", selectedSchedule);

    let availDays = Object.keys(selectedSchedule);
    // console.log("availDays: ", availDays, typeof availDays);

    let listOfDays = availDays.map((displayDay) => (
      <div
        style={{
          cursor: "pointer",
        }}
        onClick={() => {
          console.log("Button Clicked - Date Selected ");
          setMeetTime(""); // Resets and previous Meet Time
          setShowButton(false); // Ensures Show Button is set to False
          setShowTimes(true); // Allows for Times to be displayed
          // setDateString(displayDay);
          setMeetDate(displayDay);
          console.log("Day Selected: ", displayDay);
        }}
      >
        {/* {console.log("Now Showing: ", displayDay)} */}
        {displayDay}
      </div>
    ));
    // console.log("This is in ListOfDays: ", listOfDays, typeof listOfDays);

    return listOfDays;
  }

  function showAvailableTimes() {
    console.log("In Show Available Times", meetDate, typeof meetDate);

    // console.log(`For ${meetDate} here are the avialable times: ${selectedSchedule[meetDate]}`);

    if (meetDate !== "") {
      let availTimes = `${selectedSchedule[meetDate]}`; // This works just as well as the next statement
      // let availTimes = JSON.parse(`${selectedSchedule[meetDate]}`);
      // console.log("These are the available Time: ", availTimes, typeof availTimes);

      return (
        <div
          style={{
            cursor: "pointer",
          }}
        >
          {JSON.parse(availTimes).map((eachObject) => {
            return (
              <button
                onClick={() => {
                  console.log("Button Clicked - Time Selected ");
                  // console.log("Selected Start Time: ", eachObject.start_time);
                  // console.log("Selected Object: ", eachObject);
                  // setStartTime(eachObject.start_time);
                  setMeetTime(eachObject.start_time);
                  setShowButton(true);
                }}
              >
                {/* {console.log("Start Time: ", eachObject.start_time)} */}
                {eachObject.start_time}
              </button>
            );
          })}
        </div>
      );
    }
  }

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

  // function createNewMeet() {
  //   console.log("In Create New Meet");
  //   var meeting = {
  //     user_id: `${selectedUser}`,
  //     view_id: `${viewID}`,
  //     event_id: `${eventID}`,
  //     meeting_name: meetName,
  //     location: meetLocation,
  //     attendees: attendees,
  //     meeting_date: meetDate,
  //     meeting_time: meetTime,
  //   };
  //   console.log("Endpoint JSON Object: ", meeting);

  //   axios
  //     .post(BASE_URL + "AddMeeting", meeting)
  //     .then((response) => {
  //       setRefreshKey((oldKey) => oldKey + 1);
  //     })
  //     .catch((error) => {
  //       console.log("error", error);
  //     });
  //   setShowCreateNewMeetModal(false);
  //   setTimeSelected(false);
  //   setShowDays(false);
  //   setShowTimes(false);
  //   setMeetingConfirmed(true);
  //   setTimeAASlots([]);
  //   setTimeSlots([]);
  //   setMeetName("");
  //   //setMeetDate('');
  //   setMeetLocation("");
  //   //setMeetTime('');
  //   setAttendees([{ email: "" }]);
  // }

  function openCreateNewMeetModal() {
    // console.log("In Open Create New Meet Modal", meetDate, timeSelected);
    console.log("In Open Create New Meet Modal");
    // console.log("Date: ", meetDate);
    // console.log("Time: ", meetTime);

    // setShowDays(false);
    // setShowTimes(false);
    // setShowButton(false);
    return (
      <div>
        <div>
          <h1>Meeting Name</h1>
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
        </div>
        <div>
          <h1>{meetDate}</h1>
          <h1>{meetTime}</h1>
          Event Type
          <h1>{eventName}</h1>
          Location
          <h1>{meetLocation}</h1>
        </div>
        <button
          style={{
            backgroundColor: " #F3F3F8",
            border: "2px solid #2C2C2E",
            borderRadius: "3px",
            color: "#2C2C2E",
          }}
          onClick={() => {
            console.log("Cancle button clicked");
            // closeCreateNewMeetModal();
          }}
        >
          Cancel
        </button>
        <button
          style={{
            background: "#2C2C2E 0% 0% no-repeat padding-box",
            border: "2px solid #2C2C2E",
            borderRadius: "3px",
            color: " #F3F3F8",
          }}
          onClick={(e) => {
            console.log("Schedule Meeting button clicked");
            // createMeet();
            createNewMeet();
          }}
        >
          Schedule Meeting
        </button>
      </div>
    );
  }

  // function handleAdd() {
  //   const emails = [...attendees];
  //   console.log(emails);
  //   emails.push({ email: userEmail });
  //   setAttendees(emails);
  //   setNewAttendees((a) => {
  //     a.push({ email: "" });
  //     return a;
  //   });
  // }

  // function handleRemove(i) {
  //   const emails = [...attendees];
  //   emails.splice(i, 1);
  //   setAttendees(emails);
  // }

  function createNewMeet() {
    console.log("In Create New Meet 2");
    // console.log("Meet Date Split: ", meetDate, typeof meetDate);
    console.log("Meet Date Split: ", meetDate.split(" "));
    console.log("Meet Date Split: ", meetDate.split(" ")[1]);
    var meeting = {
      user_id: `${selectedUser}`,
      view_id: `${viewID}`,
      event_id: `${eventID}`,
      meeting_name: meetName,
      location: meetLocation,
      attendees: attendees,
      meeting_date: meetDate.split(" ")[1],
      meeting_time: meetTime,
    };

    console.log("Endpoint JSON Object: ", meeting);
    console.log("Endpoint JSON Object: ", attendees);

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
  // function createMeet() {
  //   //console.log(meetDate, meetTime, duration);
  //   let start_time = meetDate + "T" + meetTime + "-0800";
  //   //console.log(start_time);
  //   let d = convert(duration);
  //   let et = Date.parse(start_time) / 1000 + d;
  //   //console.log(d);
  //   //console.log(et);
  //   let end_time = moment(new Date(et * 1000)).format();
  //   attendees.push({ email: userEmail });
  //   console.log(attendees);
  //   var meet = {
  //     summary: meetName,

  //     location: meetLocation,
  //     creator: {
  //       email: googleAuthedEmail,
  //       self: true,
  //     },
  //     organizer: {
  //       email: googleAuthedEmail,
  //       self: true,
  //     },
  //     start: {
  //       dateTime: start_time,
  //     },
  //     end: {
  //       dateTime: end_time,
  //     },
  //     attendees: attendees,
  //   };
  //   console.log(meet);

  //   publishTheCalenderEvent(meet);
  //   setTimeSelected(false);
  //   setShowDays(false);
  //   setShowTimes(false);
  //   setMeetingConfirmed(true);
  //   setMeetName("");
  //   //setMeetDate('');
  //   setMeetLocation("");
  //   //setMeetTime('');
  //   setAttendees([{ email: "" }]);
  // }

  // function formatTime(date, time) {
  //   if (time == null) {
  //     return "?";
  //   } else {
  //     var newDate = new Date((date + "T" + time).replace(/\s/, "T"));
  //     var hours = newDate.getHours();
  //     var minutes = newDate.getMinutes();

  //     var ampm = hours >= 12 ? "pm" : "am";
  //     hours = hours % 12;
  //     hours = hours ? hours : 12; // the hour '0' should be '12'
  //     minutes = minutes < 10 ? "0" + minutes : minutes;
  //     var strTime = hours + ":" + minutes + " " + ampm;
  //     return strTime;
  //   }
  // }
  // function convert(value) {
  //   var a = value.split(":"); // split it at the colons

  //   // minutes are worth 60 seconds. Hours are worth 60 minutes.
  //   var seconds = +a[0] * 60 * 60 + +a[1] * 60 + +a[2];

  //   return seconds + 1;
  // }
  // function formatDate(date) {
  //   var dd = date.getDate();
  //   var mm = date.getMonth() + 1;
  //   var yyyy = date.getFullYear();
  //   if (dd < 10) {
  //     dd = "0" + dd;
  //   }
  //   if (mm < 10) {
  //     mm = "0" + mm;
  //   }
  //   date = mm + "/" + dd + "/" + yyyy;
  //   return date;
  // }
  // function Last7Days() {
  //   var result = [];
  //   var resultDay = [];
  //   let date = {};
  //   for (var i = 0; i < 7; i++) {
  //     var d = new Date();
  //     var x = new Date().getDay();
  //     d.setDate(d.getDate() + i);
  //     x = moment(d).format("dddd");
  //     result.push(formatDate(d));
  //     resultDay.push(x);
  //     date[x] = moment(d).format("YYYY-MM-DD");
  //   }

  //   return date;
  // }

  // This is what gets displayed on the screen
  return (
    <div>
      {/* Show Event Box */}
      <div
        className="eventCSS"
        style={{
          backgroundColor: `${viewColor}`,
        }}
      >
        {showEvents()}
      </div>

      {/* Show available days */}
      <div hidden={!showDays} className="dayCSS">
        {console.log("Return: In Select a Date", showDays)}
        Select a Date
        {showAvailableDays()}
      </div>

      {/* Show available Times */}
      <div hidden={!showTimes} className="timeCSS">
        {console.log("Return: In Select a Time", showTimes)}
        Select a Time
        {showAvailableTimes()}
      </div>

      {/* Show Confirmation Button */}
      <div hidden={!showButton}>
        <button
          className={"activeTimeSlotButton"}
          onClick={() => {
            setShowCreateNewMeetModal(true);
            setShowDays(false);
            setShowTimes(false);
            setShowButton(false);
          }}
        >
          Confirm Date and Time
        </button>
        {meetDate}
        {meetTime}
      </div>

      {/* Show Creating Meeting Page */}
      <div hidden={!showCreateNewMeetModal}>
        {console.log("Return: In Creating Meeting Page", showCreateNewMeetModal)}
        Here is the Create Modal Page
        {openCreateNewMeetModal()}
      </div>
    </div>
  );
}
