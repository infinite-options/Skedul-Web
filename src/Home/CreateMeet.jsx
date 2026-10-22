import React, { useContext, useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import moment from "moment";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { Row, Col, Container, Form, Modal } from "react-bootstrap";
import { Box, Typography } from "@mui/material";
import { Grid } from "@mui/material";

import "../styles/createmeet.css";
import LoginContext from "../LoginContext";
import GoogleSignUp from "./Google/GoogleSignUp";
import { current } from "@reduxjs/toolkit";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

export default function CreateMeet() {
  const loginContext = useContext(LoginContext);
  const history = useHistory();
  let gapi = window.gapi;
  const [accessToken, setAccessToken] = useState("");

  const [selectedEvent, setSelectedEvent] = useState([]);
  const [viewColor, setViewColor] = useState("");
  const [viewID, setViewID] = useState("");
  const [eventName, setEventName] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);

  const [googleAuthedEmail, setGoogleAuthedEmail] = useState("");
  const [googleAuthedName, setGoogleAuthedName] = useState("");

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
  // true once the Google freeBusy check succeeded for the selected date
  const [freeBusyChecked, setFreeBusyChecked] = useState(false);
  // true if the freeBusy check failed (e.g. expired Google token)
  const [freeBusyError, setFreeBusyError] = useState(false);
  // Visitor's own token (calendar.freebusy only) so we can hide times they're busy
  const [visitorAccessToken, setVisitorAccessToken] = useState("");
  const [visitorAccessError, setVisitorAccessError] = useState("");
  const [duration, setDuration] = useState(null);
  const [dateString, setDateString] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [viewTimeSlots, setViewTimeSlots] = useState("");

  const [selectedUser, setSelectedUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [userID, setUserID] = useState("");
  const [eventDuration, setEventDuration] = useState(null);

  const [showCreateNewMeetModal, setShowCreateNewMeetModal] = useState(false);
  const [meetName, setMeetName] = useState("");
  const [meetLocation, setMeetLocation] = useState("");
  const [meetDate, setMeetDate] = useState("");
  const [meetTime, setMeetTime] = useState("");
  const [attendees, setAttendees] = useState([{ email: "" }]);

  const client_id = CLIENT_ID;
  const client_secret = CLIENT_SECRET;

  // From the /event/:eventID route (App.js); slicing the URL broke on
  // trailing slashes, query strings and in-app navigation.
  const { eventID } = useParams();
  // Every Circle purchases link here with ?booking=<signed token>; Skedul limits
  // bookings to the units purchased.
  const bookingToken = new URLSearchParams(useLocation().search).get("booking");
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!bookingToken) return;
    axios
      .post(BASE_URL + "BookingStatus", { booking_token: bookingToken, event_id: eventID })
      .then((res) => setBookingStatus(res.data.result))
      .catch((err) =>
        setBookingError(
          err.response?.data?.message ||
            "This booking link is invalid or expired. Open it again from Every Circle."
        )
      );
  }, [bookingToken, eventID, refreshKey]);
  const bookingsUsedUp = !!bookingStatus && bookingStatus.remaining <= 0;

  function handleCallBackResponse(response) {
    var userObject = jwt_decode(response.credential);
    if (userObject) {
      let email = userObject.email;
      let name = userObject.name;
      console.log(userObject);
      setGoogleAuthedEmail(email);
      setGoogleAuthedName(name);
      setSignedIn(true);
    }
  }
  // Ask the visitor (via Google popup) to let us see when they're busy.
  // Must be called from a click so the browser doesn't block the popup.
  function requestVisitorCalendarAccess() {
    if (!window.google || !window.google.accounts) return;
    setVisitorAccessError("");
    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: "https://www.googleapis.com/auth/calendar.freebusy",
      login_hint: googleAuthedEmail,
      callback: (response) => {
        if (response && response.access_token) {
          setVisitorAccessToken(response.access_token);
        } else {
          console.error("Visitor calendar access denied", response);
          setVisitorAccessError(
            "We need access to your calendar to show times that work for you."
          );
        }
      },
      error_callback: (error) => {
        console.error("Visitor calendar access popup closed", error);
        setVisitorAccessError(
          "We need access to your calendar to show times that work for you."
        );
      },
    });
    tokenClient.requestAccessToken();
  }

  useEffect(() => {
    /* global google */
    console.log("in useeffect google", window.google);

    if (window.google) {
      console.log("in if");
      //  initializes the Sign In With Google client based on the configuration object
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCallBackResponse,
      });
      //    method renders a Sign In With Google button in your web pages.
      google.accounts.id.renderButton(document.getElementById("signInDiv"), {
        size: "large",
        text: "signin_with",
        shape: "pill",
        theme: "dark",
      });
      // access tokens
    }
  }, [isLoading]);
  useEffect(() => {
    const url = BASE_URL + `GetEvent/${eventID}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        //console.log(json.result.result[0]);
        setSelectedEvent(json.result.result[0]);
        let viewID = json.result.result[0].view_id;
        let userID = json.result.result[0].user_id;
        let duration = json.result.result[0].duration;
        setUserID(userID);
        setEventDuration(duration);
        axios
          .get(BASE_URL + `GetView/${viewID}`)
          .then((response) => {
            let schedule = JSON.parse(response.data.result.result[0].schedule);
            var editedSchedule = editSchedule(schedule, duration);
            setSelectedSchedule(editedSchedule);
            setViewID(response.data.result.result[0].view_unique_id);
            setViewColor(response.data.result.result[0].color);
          })
          .catch((error) => {
            console.log(error);
          });

        // Owner name/email only; the owner's Google token stays on the server
        // (EventFreeBusy / BookEvent).
        axios
          .get(BASE_URL + `EventOwner/${eventID}`)
          .then((response) => {
            const owner = response.data.result || {};
            setSelectedUser(owner.user_unique_id);
            setUserEmail(owner.user_email_id);
            setNewAttendees((a) => {
              a[0].email = owner.user_email_id;
              return a;
            });
            setAttendees([{ email: owner.user_email_id }]);
            setUserName(
              (owner.user_first_name || "") + "" + (owner.user_last_name || "")
            );
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
  }, [selectedEvent, selectedSchedule, refreshKey]);

  useEffect(() => {
    if (timeSelected) {
      let allTimeAASlots = [];
      Promise.all(
        viewTimeSlots.map((slot, i) => {
          let st = slot["start_time"];
          let et = slot["end_time"];

          if (i < viewTimeSlots.length - 1 && viewTimeSlots[i + 1]) {
            let nextSlotStartTime = viewTimeSlots[i + 1]["start_time"];
            let currentSlotEndTime = slot["end_time"];

            // Check if end time of current slot is one second before the start time of the next slot
            if (currentSlotEndTime + 1 === nextSlotStartTime) {
              st = slot["start_time"];
              et = viewTimeSlots[i + 1]["end_time"];
            }
          }

          console.log("Earliest Start Time:", st);
          console.log("Latest End Time:", et);

          return axios
            .get(
              BASE_URL +
                "AvailableAppointments/" +
                dateString +
                "/" +
                duration +
                "/" +
                st +
                "," +
                et
            )
            .then((res) => {
              res.data.result.forEach((r) => {
                allTimeAASlots.push(r["begin_time"]);
              });
            });
        })
      )
        .then(() => {
          setTimeAASlots(allTimeAASlots);
          console.log("allTimeAASlots", allTimeAASlots);
          setTimeSelected(false);
        })
        .catch((error) => {
          console.error("Error fetching slots:", error);
        });
    }
  });

  function getTimezoneOffset() {
    function z(n) {
      return (n < 10 ? "0" : "") + n;
    }
    var offset = new Date().getTimezoneOffset();
    var sign = offset < 0 ? "+" : "-";
    offset = Math.abs(offset);
    // RFC 3339 offset (e.g. -07:00), as required by the Google Calendar API
    return sign + z((offset / 60) | 0) + ":" + z(offset % 60);
  }

  useEffect(() => {
    if (timeSelected) {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + accessToken,
      };

      let tzOffset = getTimezoneOffset();
      let free = [];
      setFreeBusyChecked(false);
      console.log("GetView result viewTimeSlots", viewTimeSlots);

      const data = {
        // timeMin: dateString + "T" + startTime + ":00-0800",
        // timeMax: dateString + "T" + endTime + ":00-0800",
        timeMin: dateString + "T" + "00:00:00" + tzOffset,
        timeMax: dateString + "T" + "23:59:00" + tzOffset,
        items: [
          {
            id: "primary",
          },
        ],
      };
      // const timeMin = dateString + "T" + startTime + ":00-0800";
      // const timeMax = dateString + "T" + endTime + ":00-0800";
      // const timeMin = dateString + "T" + st + ":00" + tzOffset;
      // const timeMax = dateString + "T" + et + ":00" + tzOffset;
      // timeMin and timeMax reformat the schedule.Sunday[0] startTime and endTime

      setFreeBusyError(false);
      // Ask Google which times are already busy on the owner's calendar.
      // Check both the owner's and the visitor's calendars; a time is only
      // offered if it is free on both.
      const freeBusyURL = `https://www.googleapis.com/calendar/v3/freeBusy?key=${API_KEY}`;
      // Owner's busy times come from the Skedul backend, which holds the owner's token.
      const ownerRequest = axios.post(BASE_URL + "EventFreeBusy", {
        event_id: eventID,
        time_min: data.timeMin,
        time_max: data.timeMax,
      });
      const visitorRequest = visitorAccessToken
        ? axios.post(freeBusyURL, data, {
            headers: {
              ...headers,
              Authorization: "Bearer " + visitorAccessToken,
            },
          })
        : Promise.reject(new Error("Visitor calendar access not granted"));
      Promise.all([ownerRequest, visitorRequest])
        .then(([ownerResponse, visitorResponse]) => {
          let busy = ownerResponse.data.busy.concat(
            visitorResponse.data.calendars.primary.busy
          );
          for (let i in viewTimeSlots) {
            let st = viewTimeSlots[i]["start_time"];
            let et = viewTimeSlots[i]["end_time"];
            let timeMin = dateString + "T" + st + ":00" + tzOffset;
            let timeMax = dateString + "T" + et + ":00" + tzOffset;

            let start_time = Date.parse(timeMin) / 1000;
            let end_time = Date.parse(timeMax) / 1000;
            let appt_start_time = start_time;
            // start_time and end_time === startTime and endTime

            let seconds = convert(duration);
            // Loop through each appt slot in the search range.
            while (appt_start_time <= end_time) {
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

                // If the appt overlaps a current appt at all, slot is taken.
                if (appt_start_time < this_end && appt_end_time > this_start) {
                  slot_available = false;
                  return; // No need to continue if it's taken.
                }
              });

              // If we made it through all appts and the slot is still available, it's an open slot.
              if (slot_available) {
                free.push(
                  moment(new Date(appt_start_time * 1000)).format("HH:mm:ss")
                );
              }
              // + duration minutes
              appt_start_time += 60 * 30;
            }
          }
          setTimeSlots(free);
          setFreeBusyChecked(true);
        })
        .catch((error) => {
          // Without Google's answer we can't tell which times are busy, so
          // show no times rather than risk double-booking.
          console.error("Google freeBusy check failed", error);
          setFreeBusyError(true);
        });
    }
    // }
    setTimeSelected(false);
  });

  function convertDateToCurrentTimeZone(date) {
    let currentTZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log("txt ", currentTZ);
    let localDateString = new Date(
      (typeof date === "string" ? new Date(date) : date).toLocaleString(
        "en-US",
        { timeZone: currentTZ }
      )
    );
    console.log("txt localDateString ", localDateString);

    let localDate = moment(localDateString).format("YYYY-MM-DD");
    let localTime = moment(localDateString).format("HH:mm");
    var localDayOfWeek = moment(localDateString, "YYYY-MM-DD HH:mm:ss").format(
      "dddd"
    );

    // let options = {
    //   weekday: "long",
    // }
    // let localDayOfWeek = localDateString.toLocaleString("en-US", options);

    // console.log("txt : local date ", localDateString, " , formatted date : ", localDate, " , formatted time ", localTime, " , localDayOfWeek ", localDayOfWeek);

    let dateObj = {
      localDate: localDate,
      localTime: localTime,
      localDayOfWeek: localDayOfWeek,
    };
    console.log("txt : dateObj = ", dateObj, " ** ", localTime);
    return dateObj;
  }
  function convertScheduleTolocalTimeZone(schedule) {
    var dates = Last7Days();
    // console.log("txt :  dates ", dates);
    let tzOffset = getTimezoneOffset();
    let localSchedule = {};

    Object.keys(schedule).map((day) => {
      let dailySchedule = schedule[day];
      if (localSchedule[day] === undefined) {
        localSchedule[day] = [];
      }
      if (dailySchedule.length !== 0) {
        for (let i in dailySchedule) {
          dailySchedule[i]["date"] = dates[day];

          let DSEobj = {};

          // convert date and START time to local timezone
          // change offset to UTC's ********************
          var dateString_startTime =
            dailySchedule[i]["date"].toString() +
            " " +
            dailySchedule[i]["start_time"].toString() +
            ":00-0000";
          console.log(
            "txt : original dateString_startTime",
            dateString_startTime
          );
          var localStartDateTime =
            convertDateToCurrentTimeZone(dateString_startTime);
          DSEobj = {
            date: localStartDateTime.localDate,
            start_time: localStartDateTime.localTime,
          };
          // console.log("txt : DSEobj", DSEobj);

          // convert date and END time to local timezone
          // change offset to UTC's ********************
          var dateString_endTime =
            dailySchedule[i]["date"].toString() +
            " " +
            dailySchedule[i]["end_time"].toString() +
            ":00-0000";
          console.log("txt : original dateString_endTime", dateString_endTime);
          var localEndDateTime =
            convertDateToCurrentTimeZone(dateString_endTime);

          if (localEndDateTime.localDate !== localStartDateTime.localDate) {
            let endTime = localStartDateTime.localDate + " 23:59:00";
            let end_time = moment(endTime).format("HH:mm");
            DSEobj = { ...DSEobj, end_time: end_time.toString() };
            console.log("txt : DSEobj 1", DSEobj);
            localSchedule[localStartDateTime.localDayOfWeek].push(DSEobj);
            var endTimeLocal = localEndDateTime.localTime;
            DSEobj = {
              date: localEndDateTime.localDate,
              start_time: "00:00",
              end_time: endTimeLocal,
            };
            console.log("txt : DSEobj 2 in if", DSEobj);
          } else {
            DSEobj["end_time"] = localEndDateTime.localTime;
            console.log("txt : DSEobj 3", DSEobj);
          }
          if (localSchedule[localEndDateTime.localDayOfWeek] === undefined) {
            localSchedule[localEndDateTime.localDayOfWeek] = [];
          }
          localSchedule[localEndDateTime.localDayOfWeek].push(DSEobj);

          // console.log("txt : DSEobj 3", DSEobj);
        }
      }
    });
    console.log("txt : localSchedule ", localSchedule);
    console.log("txt : schedule2 ", schedule);
    return localSchedule;
  }
  function editSchedule(schedule, duration) {
    // console.log("txt : schedule ", schedule);
    let localSchedule = convertScheduleTolocalTimeZone(schedule);
    // console.log("txt : localSchedule ", localSchedule);
    Object.keys(localSchedule).map((day) => {
      let dailySchedule = localSchedule[day];
      if (dailySchedule.length !== 0 && "end_time" in dailySchedule[0]) {
        for (let i in dailySchedule) {
          let durationMoment = moment.duration(duration)._data;
          let duration_hours = durationMoment.hours;
          let duration_minutes = durationMoment.minutes;
          // console.log("original end time = ", moment(dailySchedule[0]['end_time'], 'HHmmss').format("HH:mm"));
          // console.log("duration hours", duration_hours);
          // console.log("duration minutes", duration_minutes);
          // console.log("updated end time ", moment(dailySchedule[0]['end_time'],'HHmmss').subtract({hours: duration_hours, minutes: duration_minutes}).format("HH:mm"))

          // subtracting duration from end
          dailySchedule[i]["end_time"] = moment(
            dailySchedule[i]["end_time"],
            "HHmmss"
          )
            .subtract({ hours: duration_hours, minutes: duration_minutes })
            .format("HH:mm");
        }
      }
    });
    return localSchedule;
  }

  function getView() {
    axios
      .get(BASE_URL + `GetView/${viewID}`)
      .then((response) => {
        let schedule = JSON.parse(response.data.result.result[0].schedule);
        console.log(" GetView result schedule = ", schedule);
        var editedSchedule = editSchedule(schedule, eventDuration);
        console.log(" GetView result editedSchedule= ", editedSchedule);
        setSelectedSchedule(editedSchedule);
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

  const [newAttendees, setNewAttendees] = useState([
    { email: "" },
    { email: "" },
  ]);
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

  // Book through the Skedul backend: it creates the owner's Google Calendar event
  // (with invites) and records the meeting, enforcing the Every Circle purchase
  // limit when the page was opened with a booking token.
  function bookMeeting() {
    const start_time = moment(meetDate + "T" + meetTime).format();
    const et = Date.parse(start_time) / 1000 + convert(duration);
    const end_time = moment(new Date(et * 1000)).format();
    const guests = [...attendees, { email: googleAuthedEmail }].filter(
      (a) => a && a.email
    );
    setIsBooking(true);
    setBookingError("");
    axios
      .post(BASE_URL + "BookEvent", {
        event_id: eventID,
        booking_token: bookingToken || undefined,
        summary: meetName || eventName,
        location: meetLocation,
        start: start_time,
        end: end_time,
        attendees: guests,
        meeting_date: meetDate,
        meeting_time: meetTime,
      })
      .then((res) => {
        const result = res.data.result || {};
        if (result.allowed !== undefined) setBookingStatus(result);
        setShowCreateNewMeetModal(false);
        setTimeSelected(false);
        setShowDays(false);
        setShowTimes(false);
        setMeetingConfirmed(true);
        setTimeAASlots([]);
        setTimeSlots([]);
        setMeetName("");
        setMeetLocation("");
        setAttendees([{ email: "" }]);
      })
      .catch((err) => {
        setBookingError(
          err.response?.data?.message ||
            "Could not book this time. Please try again."
        );
        if (err.response?.status === 409) setRefreshKey((k) => k + 1);
      })
      .finally(() => setIsBooking(false));
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
  function Last7Days() {
    var result = [];
    var resultDay = [];
    let date = {};
    for (var i = 0; i < 7; i++) {
      var d = new Date();
      var x = new Date().getDay();
      d.setDate(d.getDate() + i);
      x = moment(d).format("dddd");
      result.push(formatDate(d));
      resultDay.push(x);
      date[x] = moment(d).format("YYYY-MM-DD");
    }
    // console.log("txt : 01 ", date);
    return date;
  }
  function renderAvailableApptsVertical() {
    Last7Days();
    let result = [];
    console.log("GetView result times slots ", timeSlots, "AND ", timeAASlots);
    // Only offer times once Google freeBusy has answered, so times that are
    // busy on the owner's Google Calendar can never be booked. An empty
    // timeSlots means the calendar is fully busy.
    if (freeBusyError) {
      return (
        <Typography style={{ color: "#c62828" }}>
          We couldn't check this calendar's availability right now. Please try
          again later.
        </Typography>
      );
    }
    if (!freeBusyChecked) {
      return <Typography>Checking availability…</Typography>;
    }
    if (timeAASlots.length === 0) {
      result = timeSlots;
    } else {
      result = timeSlots.filter((o1) => timeAASlots.some((o2) => o1 === o2));
    }
    console.log(timeAASlots);
    return (
      <div>
        <div style={{ height: "10rem" }}>
          <Grid
            container
            direction="column"
            spacing={1}
            style={{ height: "20rem" }}
          >
            {result.map(function (element) {
              return (
                <Box
                  sx={{
                    cursor: "pointer",
                  }}
                  className={
                    meetTime === element
                      ? `${"activeTimeButton"}`
                      : `${"timeButton"}`
                  }
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
    let dateRange = Last7Days();
    // console.log(dateRange);

    return (
      <Col>
        {selectedSchedule.Sunday.length <= 0 ? (
          ""
        ) : (
          <div>
            {dateRange.hasOwnProperty("Sunday") ? (
              <Col
                style={{
                  cursor: "pointer",
                }}
                className={
                  dateString === dateRange["Sunday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Sunday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Sunday);
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
                className={
                  dateString === dateRange["Monday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Monday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Monday);
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
                className={
                  dateString === dateRange["Tuesday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Tuesday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Tuesday);
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
                className={
                  dateString === dateRange["Wednesday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Wednesday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Wednesday);
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
                className={
                  dateString === dateRange["Thursday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Thursday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Thursday);
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
                className={
                  dateString === dateRange["Friday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Friday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Friday);
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
                className={
                  dateString === dateRange["Saturday"]
                    ? `${"activeTimeSlotButton"}`
                    : `${"timeslotButton"}`
                }
                onClick={() => {
                  setTimeSelected(true);
                  setShowTimes(true);
                  setDateString(dateRange["Saturday"]);
                  setTimeAASlots([]);
                  setTimeSlots([]);
                  setViewTimeSlots(selectedSchedule.Saturday);
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
        )}
      </Col>
    );
  }

  return (
    <div className="container">
      {isLoading ? (
        <Row>
          <Col>
            <Typography>Just schedule this meeting</Typography>
            <div id="signInDiv"></div>
            {/* <button
              style={{
                background: "#2C2C2E 0% 0% no-repeat padding-box",
                border: "2px solid #2C2C2E",
                borderRadius: "3px",
                color: " #F3F3F8",
              }}
            >
              Proceed
            </button> */}
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
          {signedin ? (
            <div>
              {bookingToken ? (
                <Row style={{ margin: "16px 10px 0" }}>
                  <Typography
                    style={{ color: bookingError || bookingsUsedUp ? "#c62828" : "#2C2C2E" }}
                  >
                    {!bookingStatus
                      ? bookingError || "Checking your bookings…"
                      : bookingsUsedUp
                      ? `You've used all ${bookingStatus.allowed} booking${bookingStatus.allowed === 1 ? "" : "s"} for this purchase.`
                      : `Bookings remaining for this purchase: ${bookingStatus.remaining} of ${bookingStatus.allowed}`}
                  </Typography>
                </Row>
              ) : null}
              <Row>
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
                      if (bookingToken && (!bookingStatus || bookingsUsedUp)) return;
                      if (!visitorAccessToken) {
                        requestVisitorCalendarAccess();
                      }
                      setShowDays(true);
                      setMeetingConfirmed(false);
                      setTimeSelected(false);
                      setTimeSlots([]);
                      setTimeAASlots([]);
                      setDuration(selectedEvent.duration);
                      getView();
                      setViewID(selectedEvent.view_id);
                      setEventName(selectedEvent.event_name);
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
                        {Number(selectedEvent.duration.substring(0, 2)) > 1
                          ? selectedEvent.duration.substring(3, 5) !== "59"
                            ? Number(selectedEvent.duration.substring(0, 2)) +
                              " hrs " +
                              Number(selectedEvent.duration.substring(3, 5)) +
                              " min"
                            : Number(selectedEvent.duration.substring(0, 2)) +
                              1 +
                              " hrs"
                          : Number(selectedEvent.duration.substring(0, 2)) == 1
                          ? "60 min"
                          : selectedEvent.duration.substring(3, 5) + " min"}
                      </div>
                      <div>
                        Location:{" "}
                        {selectedEvent.location === ""
                          ? "None Specified"
                          : selectedEvent.location}
                      </div>
                      <div>
                        -
                        {JSON.parse(
                          selectedEvent.buffer_time
                        ).before.time.substring(3, 5)}{" "}
                        / +
                        {JSON.parse(
                          selectedEvent.buffer_time
                        ).after.time.substring(3, 5)}
                      </div>
                    </div>
                  </div>
                  {console.log(showCreateNewMeetModal)}
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
                      {meetTime.substring(0, 5)} <br />
                      {moment(meetDate).format("MMMM DD, YYYY")}
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
                  {showDays === true &&
                  googleAuthedEmail.length != 0 &&
                  !visitorAccessToken ? (
                    <div>
                      <Typography style={{ marginBottom: "10px" }}>
                        {visitorAccessError ||
                          "Allow access to your Google Calendar so we only show times you're free."}
                      </Typography>
                      <button
                        style={{
                          background: "#2C2C2E 0% 0% no-repeat padding-box",
                          border: "2px solid #2C2C2E",
                          borderRadius: "3px",
                          color: " #F3F3F8",
                        }}
                        onClick={requestVisitorCalendarAccess}
                      >
                        Check my calendar
                      </button>
                    </div>
                  ) : null}
                  {showDays === true &&
                  googleAuthedEmail.length != 0 &&
                  visitorAccessToken ? (
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
                      {renderAvailableApptsVertical()}
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
                      {console.log("here")}
                      <Typography className={"colHeader"}>
                        Meeting Name
                      </Typography>
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
                      <Typography className={"colHeader"}>
                        Date and Time
                      </Typography>
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
                      <Typography className={"colHeader"}>
                        {" "}
                        Event Type{" "}
                      </Typography>
                      <Row className={"colBody"}>
                        {eventName}-
                        {Number(duration.substring(0, 2)) > "01"
                          ? duration.substring(3, 5) !== "59"
                            ? Number(duration.substring(0, 2)) +
                              " hours " +
                              Number(duration.substring(3, 5)) +
                              " minutes"
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
                      <Typography className={"colHeader"}>
                        {" "}
                        Location{" "}
                      </Typography>
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
                            disabled={isBooking || bookingsUsedUp}
                            onClick={bookMeeting}
                          >
                            {isBooking ? "Scheduling…" : "Schedule Meeting"}
                          </button>
                          {bookingError ? (
                            <div style={{ color: "#c62828", marginTop: "6px" }}>
                              {bookingError}
                            </div>
                          ) : null}
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
                      You are all set for{" "}
                      {moment(meetDate).format("MMMM DD, YYYY")} at{" "}
                      {meetTime.substring(0, 5)} <br /> The email invite has
                      been sent to{" "}
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
                <div>
                  <div id="signInDiv"></div>
                </div>

                {/* <button
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
                </button> */}
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
                <div>
                  <GoogleSignUp />
                </div>
              </Col>
            </Row>
          )}
        </div>
      )}
    </div>
  );
}
