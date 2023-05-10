import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import "../styles/schedule.css";
import { Container, Row, Col, Modal } from "react-bootstrap";
import { Typography } from "@mui/material";
import moment from "moment";
import LoginContext from "../LoginContext";
import Bookmark from "../images/bookmark.svg";
import Edit from "../images/edit.svg";
import Link from "../images/link.svg";
import { updateTheCalenderEvent } from "./GoogleApiService";
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

export default function Schedule(props) {
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
    const loginContext = useContext(LoginContext);
    const [allViews, setAllViews] = useState([]);

    const [allSchedule, setAllSchedule] = useState([]);
    const [allMeetings, setAllMeetings] = useState([]);
    const [allEvents, setAllEvents] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState([]);
    const [allGoogleMeetings, setAllGoogleMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const [showUpdateMeetModal, setShowUpdateMeetModal] = useState(false);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState("");
    const [selectedMeetingDate, setSelectedMeetingDate] = useState("");
    const [selectedMeetingTime, setSelectedMeetingTime] = useState("");
    const [selectedMeetingDuration, setSelectedMeetingDuration] = useState("");
    const [responseStatus, setResponseStatus] = useState("");
    console.log(
        "selecteduser",

        loginContext,
        document.cookie
    );

    var selectedUser = "";
    if (
        document.cookie
            .split(";")
            .some((item) => item.trim().startsWith("user_uid="))
    ) {
        selectedUser = document.cookie
            .split("; ")
            .find((row) => row.startsWith("user_uid="))
            .split("=")[1];
    }
    var at = "";

    var userEmail = "";
    // if (
    //   document.cookie
    //     .split(';')
    //     .some((item) => item.trim().startsWith('user_uid='))
    // ) {
    //   at = document.cookie
    //     .split('; ')
    //     .find((row) => row.startsWith('user_access='))
    //     .split('=')[1];
    // }
    at = loginContext.loginState.user.user_access;
    userEmail = loginContext.loginState.user.email;

    const [accessToken, setAccessToken] = useState(at);
    // console.log(
    //   'selecteduser',

    //   loginContext,
    //   document.cookie
    // );

    useEffect(() => {
        let today = new Date();
        let dateNew = moment(today);
        let startDate = dateNew.startOf("week").format("YYYY-MM-DD");
        let start = startDate + "T00:00:00-07:00";
        let endDate = moment(startDate).add(12, "days").format("YYYY-MM-DD");
        let end = endDate + "T23:59:59-07:00";

        const url = BASE_URL + `GetAllViews/${selectedUser}`;
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                //console.log(json);
                setAllViews(json.result.result);
                setSelectedSchedule(JSON.parse(json.result.result[0].schedule));
            })
            .catch((error) => console.log(error));
        axios
            .get(BASE_URL + `UserDetails/${selectedUser}`)
            .then((response) => {
                console.log(response.data);

                var old_at = response.data.google_auth_token;
                var refresh_token = response.data.google_refresh_token;
                //console.log(refresh_token);
                setAccessToken(old_at);
                console.log("in events", old_at);
                const headers = {
                    Accept: "application/json",
                    Authorization: "Bearer " + old_at,
                };
                setAccessToken(at);
                console.log("in events", at);
                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMax=${end}&timeMin=${start}&key=${API_KEY}`;
                axios
                    .get(url, {
                        headers: headers,
                    })
                    .then((response) => {
                        setAllGoogleMeetings(response.data.items);
                    })
                    .catch((error) => console.log(error));
                fetch(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`,
                    {
                        method: "GET",
                    }
                ).then((response) => {
                    //console.log('in events', response);
                    if (response["status"] === 400) {
                        //console.log('in events if');
                        let authorization_url =
                            "https://accounts.google.com/o/oauth2/token";

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
                            var encodedValue = encodeURIComponent(
                                details[property]
                            );
                            formBody.push(encodedKey + "=" + encodedValue);
                        }
                        formBody = formBody.join("&");

                        fetch(authorization_url, {
                            method: "POST",
                            headers: {
                                "Content-Type":
                                    "application/x-www-form-urlencoded;charset=UTF-8",
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
                                const headers = {
                                    Accept: "application/json",
                                    Authorization: "Bearer " + at,
                                };
                                setAccessToken(at);
                                console.log("in events", at);
                                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMax=${end}&timeMin=${start}&key=${API_KEY}`;
                                axios
                                    .get(url, {
                                        headers: headers,
                                    })
                                    .then((response) => {
                                        setAllGoogleMeetings(
                                            response.data.items
                                        );
                                    })
                                    .catch((error) => console.log(error));
                                let updateURL =
                                    BASE_URL +
                                    `UpdateAccessToken/${selectedUser}`;
                                axios
                                    .post(updateURL, {
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
                        console.log(old_at);
                    }
                });
            })
            .catch((error) => {
                console.log(error);
            });
    }, [refreshKey]);

    useEffect(() => {
        const url = BASE_URL + `GetAllEventsUser/${selectedUser}`;
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                //console.log(json);
                setAllEvents(json.result.result);
            })
            .catch((error) => console.log(error));
    }, [refreshKey]);

    useEffect(() => {
        const url = BASE_URL + `GetSchedule/${selectedUser}`;
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                //console.log(json);
                if (json.result !== undefined && json.result !== null) {
                    setAllSchedule(json.result);
                }
            })
            .catch((error) => console.log(error));
    }, [refreshKey]);
    useEffect(() => {
        const url = BASE_URL + `GetMeeting/${selectedUser}`;
        fetch(url)
            .then((response) => response.json())
            .then((json) => {
                // console.log(json);
                // console.log(json.result.result);
                setAllMeetings(json.result.result);
            })
            .catch((error) => console.log(error));
    }, [refreshKey]);

    // useEffect(() => {
    //   let today = new Date();
    //   let dateNew = moment(today);
    //   let startDate = dateNew.startOf('week').format('YYYY-MM-DD');
    //   let start = startDate + 'T00:00:00-07:00';
    //   let endDate = moment(startDate).add(12, 'days').format('YYYY-MM-DD');
    //   let end = endDate + 'T23:59:59-07:00';
    //   const headers = {
    //     Accept: 'application/json',
    //     Authorization: 'Bearer ' + accessToken,
    //   };
    //   console.log(accessToken);
    //   const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?orderBy=startTime&singleEvents=true&timeMax=${end}&timeMin=${start}&key=${API_KEY}`;
    //   axios
    //     .get(url, {
    //       headers: headers,
    //     })
    //     .then((response) => {
    //       setAllGoogleMeetings(response.data.items);
    //     })
    //     .catch((error) => console.log(error));
    // }, [refreshKey]);
    useEffect(() => {
        if (allSchedule != undefined && allGoogleMeetings != undefined) {
            if (
                allEvents.length !== 0 ||
                allSchedule.length !== 0 ||
                allViews.length !== 0 ||
                allGoogleMeetings != undefined
            ) {
                setIsLoading(false);
            }
        }
    }, [
        allViews,
        allEvents,
        allSchedule,
        allGoogleMeetings,
        selectedSchedule,
        //accessToken,
        refreshKey,
    ]);

    const openUpdateMeetModal = () => {
        setShowUpdateMeetModal((prevState) => {
            return { showUpdateMeetModal: !prevState.showUpdateMeetModal };
        });
    };

    const closeUpdateMeetModal = () => {
        setShowUpdateMeetModal(false);
    };
    function updateMeet() {
        let startTime =
            selectedMeetingDate + "T" + selectedMeetingTime + ":00-08:00";

        let duration = moment.utc(selectedMeetingDuration).format("HH:mm:ss");

        let etime = moment(selectedMeetingTime, "HH:mm:ss")
            .add(duration, "milliseconds")
            .format("HH:mm");

        let endTime = selectedMeetingDate + "T" + etime + ":00-08:00";
        console.log(selectedMeetingDuration, duration);
        console.log(selectedMeetingTime, etime);
        console.log(startTime, endTime);
        var event = {
            id: selectedMeeting["id"],
            summary: selectedMeeting["summary"],
            location: selectedMeeting["location"],
            creator: selectedMeeting["creator"],
            organizer: selectedMeeting["organizer"],
            start: {
                dateTime: startTime,
            },
            end: {
                dateTime: endTime,
            },

            attendees: selectedMeeting["attendees"],
        };
        console.log(event);
        const headers = {
            Accept: "application/json",
            Authorization: "Bearer " + accessToken,
        };
        let meetID = selectedMeeting["id"];

        // updateTheCalenderEvent(event);
        // closeAcceptModal();

        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetID}?key=${API_KEY}`;
        axios
            .patch(url, event, {
                headers: headers,
            })
            .then((response) => {
                console.log(response);

                // closeAcceptModal();
                setRefreshKey((oldKey) => oldKey + 1);
                closeUpdateMeetModal();
                closeAcceptModal();
            })
            .catch((error) => console.log(error));
    }
    function handleUpdate(i, event) {
        const fields = [...selectedMeeting["attendees"]];
        //console.log(i);
        fields[i][event.target.name] = event.target.value;
        setSelectedMeeting({
            ...selectedMeeting,
            attendees: fields,
        });
    }

    function handleAdd() {
        const fields = [...selectedMeeting["attendees"]];
        //console.log(fields);
        fields.push({ email: "" });
        //console.log(fields);
        setSelectedMeeting({
            ...selectedMeeting,
            attendees: fields,
        });
    }

    function handleRemove(i) {
        const emails = [...selectedMeeting["attendees"]];
        emails.splice(i, 1);
        setSelectedMeeting({
            ...selectedMeeting,
            attendees: emails,
        });
    }

    const updateModal = () => {
        const modalStyle = {
            position: "absolute",
            top: "10%",
            left: "38%",
            width: "400px",
        };
        const headerStyle = {
            border: "none",
            //textAlign: 'center',
            display: "flex",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#2C2C2E",
            textTransform: "uppercase",
            backgroundColor: " #F3F3F8",
        };
        const footerStyle = {
            border: "none",
            backgroundColor: " #F3F3F8",
        };
        const bodyStyle = {
            backgroundColor: " #F3F3F8",
        };
        const colHeader = {
            margin: "5px",
        };

        return (
            <Modal
                show={showUpdateMeetModal}
                onHide={closeUpdateMeetModal}
                style={modalStyle}
            >
                <Modal.Header style={headerStyle} closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>

                <Modal.Body style={bodyStyle}>
                    <Row style={colHeader}>
                        <input
                            style={{
                                width: "345px",
                                backgroundColor: " #F3F3F8",
                                border: "2px solid #636366",
                                borderRadius: "3px",
                            }}
                            value={selectedMeeting["summary"]}
                            //value={eventName}
                            onChange={(e) => {
                                setSelectedMeeting({
                                    ...selectedMeeting,
                                    summary: e.target.value,
                                });
                            }}
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
                                value={selectedMeetingDate}
                                onChange={(e) =>
                                    setSelectedMeetingDate(e.target.value)
                                }
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
                                value={selectedMeetingTime}
                                onChange={(e) =>
                                    setSelectedMeetingTime(e.target.value)
                                }
                            />
                        </Col>
                    </Row>

                    <Typography className={"colHeader"}> Email </Typography>
                    <Row style={colHeader} className={"colBody"}>
                        Organizer : &nbsp;{selectedMeeting["creator"]["email"]}
                    </Row>
                    <Row style={colHeader} className={"colBody"}>
                        Attendees : &nbsp;
                    </Row>

                    <Row style={colHeader}>
                        {Object.values(selectedMeeting.attendees).map(
                            (field, idx) => {
                                return (
                                    <div>
                                        <button
                                            style={{
                                                padding: "0px",
                                                margin: "0px",
                                                width: "20px",
                                                height: "25px",
                                                border: "1px solid #2C2C2E",
                                                borderRadius: " 2px",
                                                backgroundColor: "#F3F3F8",
                                            }}
                                            onClick={() => handleRemove(idx)}
                                        >
                                            -
                                        </button>{" "}
                                        &nbsp;
                                        <input
                                            style={{
                                                width: "254px",
                                                backgroundColor: " #F3F3F8",
                                                border: "1px solid #636366",
                                                borderRadius: "3px",
                                            }}
                                            type="text"
                                            id="email"
                                            name="email"
                                            value={field.email}
                                            onChange={(e) =>
                                                handleUpdate(idx, e)
                                            }
                                        />{" "}
                                        &nbsp;
                                        <button
                                            style={{
                                                padding: "0px",
                                                margin: "0px",
                                                width: "20px",
                                                height: "25px",
                                                border: "1px solid #2C2C2E",
                                                borderRadius: " 2px",
                                                backgroundColor: "#F3F3F8",
                                            }}
                                            onClick={() => handleAdd()}
                                        >
                                            +
                                        </button>
                                    </div>
                                );
                            }
                        )}
                    </Row>
                    <Typography className={"colHeader"}> Location </Typography>
                    <Row style={colHeader}>
                        <input
                            style={{
                                width: "254px",
                                backgroundColor: " #F3F3F8",
                                border: "1px solid #636366",
                                borderRadius: "3px",
                            }}
                            value={selectedMeeting["location"]}
                            onChange={(e) => {
                                setSelectedMeeting({
                                    ...selectedMeeting,
                                    location: e.target.value,
                                });
                            }}
                        />
                    </Row>
                </Modal.Body>
                <Modal.Footer style={footerStyle}>
                    <Row>
                        <Col xs={4}>
                            <button
                                style={{
                                    backgroundColor: " #F3F3F8",
                                    border: "2px solid #2C2C2E",
                                    borderRadius: "3px",
                                    color: "#2C2C2E",
                                }}
                                onClick={() => {
                                    closeUpdateMeetModal();
                                }}
                            >
                                Cancel
                            </button>
                        </Col>
                        <Col>
                            <button
                                style={{
                                    backgroundColor: " #F3F3F8",

                                    border: "2px solid #2C2C2E",
                                    borderRadius: "3px",
                                    color: " #2C2C2E",
                                }}
                                onClick={(e) => {
                                    //createMeet();
                                    updateMeet();
                                }}
                            >
                                Update Meeting
                            </button>
                        </Col>
                    </Row>
                </Modal.Footer>
            </Modal>
        );
    };

    const openAcceptModal = () => {
        setShowAcceptModal((prevState) => {
            return { showAcceptModal: !prevState.showAcceptModal };
        });
    };

    const closeAcceptModal = () => {
        setShowAcceptModal(false);
    };
    function accept() {
        const headers = {
            Accept: "application/json",
            Authorization: "Bearer " + accessToken,
        };
        let meetID = selectedMeeting["id"];

        var response = {
            attendees: [{ email: userEmail, responseStatus: responseStatus }],
        };
        // updateTheCalenderEvent(event);
        // closeAcceptModal();
        console.log(response);
        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetID}?key=${API_KEY}`;
        axios
            .patch(url, response, {
                headers: headers,
            })
            .then((response) => {
                console.log(response);

                // closeAcceptModal();
                setRefreshKey((oldKey) => oldKey + 1);
            })
            .catch((error) => console.log(error));
    }
    const acceptModal = () => {
        const modalStyle = {
            position: "absolute",
            top: "10%",
            left: "10%",
            width: "400px",
        };
        const headerStyle = {
            border: "none",
            //textAlign: 'center',
            display: "flex",
            alignItems: "center",
            fontSize: "24px",
            fontWeight: "bold",
            color: "#2C2C2E",
            textTransform: "uppercase",
            backgroundColor: " #F3F3F8",
        };
        const footerStyle = {
            border: "none",
            backgroundColor: " #F3F3F8",
        };
        const bodyStyle = {
            backgroundColor: " #F3F3F8",
        };
        const colHeader = {
            margin: "5px",
        };

        return (
            <Modal
                show={showAcceptModal}
                onHide={closeAcceptModal}
                style={modalStyle}
            >
                <Modal.Header style={headerStyle} closeButton>
                    <Modal.Title></Modal.Title>
                </Modal.Header>

                <Modal.Body style={bodyStyle}>
                    <Row>
                        <Col
                            //className={"colHeader"}
                            style={{
                                textAlign: "left",
                                font: "normal normal bold 20px/24px SF Pro Display",
                                letterSpacing: "0px",
                                color: "#2C2C2E",
                                opacity: 1,
                                textTransform: "capitalize",
                            }}
                        >
                            {selectedMeeting["summary"]}
                        </Col>
                        <Col>
                            <span
                                style={{
                                    //textAlign: 'right',
                                    font: "normal normal bold 12px/14px SF Pro Display",
                                    letterSpacing: "0px",
                                    color: "#636366",
                                    opacity: 1,
                                    textTransform: "capitalize",
                                    textDecoration: "underline",
                                }}
                            >
                                {" "}
                                Edit Event
                            </span>
                            &nbsp;&nbsp;
                            <img
                                src={Edit}
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    cursor: "pointer",
                                    marginRight: "5px",
                                }}
                                onClick={() => {
                                    openUpdateMeetModal();
                                }}
                                alt="edit event"
                            />
                        </Col>
                    </Row>
                    <Typography className={"colHeader"}>
                        Date and Time
                    </Typography>
                    <Row>
                        <Col className={"colBody"}>
                            {moment(
                                selectedMeeting["start"]["dateTime"]
                            ).format("MMMM DD, YYYY")}
                        </Col>
                        <Col className={"colBody"}>
                            {moment(
                                selectedMeeting["start"]["dateTime"]
                            ).format("hh:mm a")}
                            -
                            {moment(selectedMeeting["end"]["dateTime"]).format(
                                "hh:mm a"
                            )}
                        </Col>
                    </Row>
                    {/* <Typography className={"colHeader"}> Event Type </Typography>
          <Row style={colHeader} className={"colBody"}>
            None Specified
          </Row> */}

                    <Typography className={"colHeader"}> Email </Typography>
                    <Row style={colHeader} className={"colBody"}>
                        Organizer : &nbsp;{selectedMeeting["creator"]["email"]}
                    </Row>
                    <Row style={colHeader} className={"colBody"}>
                        Attendees : &nbsp;
                        <div>
                            {selectedMeeting["attendees"].map((attendee) => (
                                <div>{attendee["email"]}</div>
                            ))}
                        </div>
                    </Row>

                    <Row></Row>
                    <Typography className={"colHeader"}> Location </Typography>
                    {selectedMeeting["location"] === undefined ? (
                        <Row style={colHeader} className={"colBody"}>
                            No location given
                        </Row>
                    ) : (
                        <Row style={colHeader} className={"colBody"}>
                            {selectedMeeting["location"]}
                        </Row>
                    )}
                </Modal.Body>
                <Modal.Footer style={footerStyle}>
                    <Row>
                        <Col>
                            <button
                                style={{
                                    backgroundColor:
                                        responseStatus === "accepted" ||
                                        selectedMeeting["attendees"][0][
                                            "responseStatus"
                                        ] === "accepted"
                                            ? "#2C2C2E"
                                            : "#F3F3F8",
                                    border: "2px solid #2C2C2E",
                                    borderRadius: "3px",
                                    color:
                                        responseStatus === "accepted" ||
                                        selectedMeeting["attendees"][0][
                                            "responseStatus"
                                        ] === "accepted"
                                            ? "#F3F3F8"
                                            : "#2C2C2E",
                                }}
                                onClick={() => {
                                    setResponseStatus("accepted");
                                    setRefreshKey((oldKey) => oldKey + 1);
                                    accept();
                                }}
                            >
                                Accept
                            </button>
                        </Col>
                        <Col>
                            <button
                                style={{
                                    backgroundColor:
                                        responseStatus === "declined" ||
                                        selectedMeeting["attendees"][0][
                                            "responseStatus"
                                        ] === "declined"
                                            ? "#2C2C2E"
                                            : "#F3F3F8",
                                    border: "2px solid #2C2C2E",
                                    borderRadius: "3px",
                                    color:
                                        responseStatus === "declined" ||
                                        selectedMeeting["attendees"][0][
                                            "responseStatus"
                                        ] === "declined"
                                            ? "#F3F3F8"
                                            : "#2C2C2E",
                                }}
                                onClick={() => {
                                    setResponseStatus("declined");
                                    accept();
                                }}
                            >
                                Decline
                            </button>
                        </Col>
                        <Col>
                            <button
                                style={{
                                    backgroundColor: showUpdateMeetModal
                                        ? "#2C2C2E"
                                        : "#F3F3F8",
                                    border: "2px solid #2C2C2E",
                                    borderRadius: "3px",
                                    color: showUpdateMeetModal
                                        ? "#F3F3F8"
                                        : "#2C2C2E",
                                }}
                                onClick={(e) => {
                                    openUpdateMeetModal();
                                }}
                            >
                                Reschedule
                            </button>
                        </Col>
                    </Row>
                </Modal.Footer>
            </Modal>
        );
    };
    const weekdaysAndDateDisplay = () => {
        let arr = [];
        let today = new Date();
        let dateNew = moment(today);
        let startDate = dateNew.startOf("week");
        for (let i = 0; i < 12; i++) {
            arr.push(
                <Col
                    key={"day" + i}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Col
                        style={{
                            font: "normal normal bold 16px SF Pro Display",
                            textAlign: "center",
                            padding: "20px 0px",
                        }}
                    >
                        <div
                            style={{
                                color: "#2C2C2E",
                            }}
                        >
                            {startDate.format("dddd")}
                        </div>
                        <br />
                        <div style={{ color: "#636366" }}>
                            {startDate.format("D")}
                        </div>
                    </Col>
                </Col>
            );
            startDate.add(1, "day");
        }
        return arr;
    };

    const timeDisplay = () => {
        //this essentially creates the time row
        let arr = [];
        for (let i = 0; i < 24; ++i) {
            // if (i < 12) {
            arr.push(
                <Row key={"weekEvent" + i}>
                    <Col
                        style={{
                            textAlign: "left",
                            height: "55px",
                            font: "normal normal normal 12px/14px SF Pro Display",
                            //borderBottom: '1px solid #AFAFB3',
                        }}
                    >
                        {i == 0
                            ? "12AM"
                            : i == 12
                            ? i + "PM"
                            : i > 11
                            ? i - 12 + "PM"
                            : i + "AM"}
                    </Col>
                </Row>
            );
        }
        return arr;
    };

    const sortSchedule = () => {
        var arr = Object.values(allSchedule);
        //console.log(arr);
        var dic = {};
        let today = new Date();

        let dateNew = moment(today);

        for (let i = 0; i < arr.length; i++) {
            //console.log(arr[i], arr.length);
            let day = arr[i];
            //xconsole.log(day);
            for (let j = 0; j < day.length; j++) {
                //console.log(day[j]);
                let tempStart = day[j].schedule.start_time;
                let tempEnd = day[j].schedule.end_time;
                //console.log(day[j], day.length);
                let key = i + "_" + tempStart.substring(0, 2);
                //console.log(key);
                if (dic[key] == null) {
                    dic[key] = [];
                }
                dic[key].push(day[j]);
            }
        }
        for (let i = 0; i < arr.length; i++) {
            //console.log(arr[i], arr.length);
            let day = arr[i];
            // console.log(day);
            for (let j = 0; j < day.length; j++) {
                //console.log(day[j]);
                let tempStart = day[j].schedule.start_time;
                let tempEnd = day[j].schedule.end_time;
                //console.log(day[j], day.length);
                let key = 7 + i + "_" + tempStart.substring(0, 2);
                //console.log(key);
                if (dic[key] == null) {
                    dic[key] = [];
                }
                dic[key].push(day[j]);
            }
        }

        return dic;
    };
    const sortMeetings = () => {
        var arr = allGoogleMeetings;

        console.log("meetings", arr, allGoogleMeetings);
        var dic = {};
        for (let i = 0; i < arr.length; i++) {
            let tempStart = arr[i].start.dateTime;
            let tempEnd = arr[i].end.dateTime;
            let tempStartTime = new Date(
                new Date(tempStart).toLocaleString("en-US")
            );
            // console.log(tempStartTime.getDate());
            let key = tempStartTime.getDate() + "_" + tempStartTime.getHours();
            if (dic[key] == null) {
                dic[key] = [];
            }
            dic[key].push(arr[i]);
        }
        return dic;
    };

    function leftFillNum(num, targetLength) {
        return num.toString().padStart(targetLength, 0);
    }
    function hex2dec(hex) {
        return hex
            .replace("#", "")
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
        return (
            "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")
        );
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
            cmyks.map((cmyk) => cmyk[0]).reduce((a, b) => a + b, 0) /
            cmyks.length;
        let m =
            cmyks.map((cmyk) => cmyk[1]).reduce((a, b) => a + b, 0) /
            cmyks.length;
        let y =
            cmyks.map((cmyk) => cmyk[2]).reduce((a, b) => a + b, 0) /
            cmyks.length;
        let k =
            cmyks.map((cmyk) => cmyk[3]).reduce((a, b) => a + b, 0) /
            cmyks.length;
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
        var res = [];
        var unique = [];
        var tempStart = null;
        var tempEnd = null;
        var arr = dic[day + "_" + hour];
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
            // console.log(arr[i]);
            tempStart = arr[i].schedule.start_time;
            tempEnd = arr[i].schedule.end_time;
            // console.log(tempStart, tempEnd);
            let minsToMarginTop = (tempStart.substring(3, 5) / 60) * 55;
            let hourDiff = tempEnd.substring(0, 2) - tempStart.substring(0, 2);
            let minDiff =
                tempEnd.substring(3, 5) / 60 - tempStart.substring(3, 5) / 60;
            let height = (hourDiff + minDiff) * 55;
            sameTimeEventCount++;
            let color = "lightslategray";
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

            let newElement = (
                <div key={"event" + i}>
                    <div
                        className="clickButton"
                        data-toggle="tooltip"
                        data-placement="right"
                        title={
                            arr[i].name +
                            "\nStart: " +
                            tempStart +
                            "\nEnd: " +
                            tempEnd
                        }
                        key={i}
                        style={{
                            zIndex: 1,
                            marginTop: minsToMarginTop + "px",
                            marginLeft: addmarginLeft + "px",
                            padding: "3px",
                            fontSize: fontSize + "px",

                            // border: '1px lightgray solid ',
                            // border:
                            //   this.props.highLight === arr[i].title
                            //     ? '2px solid #FF6B4A '
                            //     : '',
                            float: "left",
                            background: color,
                            width: itemWidth + "px",
                            position: "absolute",
                            height: height + "px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            opacity: "0.8",
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
    //console.log('selectedmeeting', selectedMeeting);
    const getMeetItemFromDic = (day, hour, dic) => {
        let today = new Date();
        let dateNew = moment(today);

        var res = [];
        var unique = [];
        var tempStart = null;
        var tempEnd = null;
        var arr = dic[day + "_" + hour];
        var sameTimeEventCount = 0;
        var addmarginLeft = 0;
        let itemWidth = 80;
        var fontSize = 10;
        if (arr == null) {
            return;
        }
        //console.log(arr);
        for (let i = 0; i < arr.length; i++) {
            //console.log(arr[i], arr.length);
            tempStart = arr[i].start.dateTime;
            tempEnd = arr[i].end.dateTime;

            let tempStartTime = new Date(
                new Date(tempStart).toLocaleString("en-US")
            );
            let tempEndTime = new Date(
                new Date(tempEnd).toLocaleString("en-US")
            );
            //console.log(tempStart, tempStartTime, tempEnd, tempEndTime);
            let minsToMarginTop = (tempStartTime.getMinutes() / 60) * 55;

            let hourDiff = tempEndTime.getHours() - tempStartTime.getHours();
            let minDiff =
                tempEndTime.getMinutes() / 60 - tempStartTime.getMinutes() / 60;
            let height = (hourDiff + minDiff) * 55;
            //console.log(tempStartTime.getMinutes(), tempStartTime.getHours());
            sameTimeEventCount++;
            let color = "lightslategray";
            //check if there is already an event there overlapping from another hour
            //check if there is already an event there overlapping from another hour
            for (let i = 0; i < arr.length; i++) {
                tempStart = arr[i].start.dateTime;
                tempEnd = arr[i].end.dateTime;
                let tempStartTime = new Date(
                    new Date(tempStart).toLocaleString("en-US")
                );
                let tempEndTime = new Date(
                    new Date(tempEnd).toLocaleString("en-US")
                );
                if (
                    tempStartTime.getHours() < hour &&
                    tempEndTime.getHours() > hour
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
            if (tempEndTime.getHours() - tempStartTime.getHours() < 2) {
                fontSize = 8;
            }

            let newElement = (
                <div
                    key={"event" + i}
                    onClick={() => {
                        openAcceptModal();
                        setSelectedMeeting(arr[i]);
                        setSelectedMeetingDate(
                            moment(tempStartTime).format("YYYY-MM-DD")
                        );
                        setSelectedMeetingTime(
                            moment(tempStartTime).format("HH:mm")
                        );
                        setSelectedMeetingDuration(
                            moment(tempEndTime).diff(moment(tempStartTime))
                        );
                        //console.log(arr[i]);
                    }}
                >
                    <div
                        className="clickButton"
                        data-toggle="tooltip"
                        data-placement="right"
                        title={
                            arr[i].summary +
                            "\nStart: " +
                            tempStartTime +
                            "\nEnd: " +
                            tempEndTime
                        }
                        key={i}
                        style={{
                            zIndex: 1,
                            marginTop: minsToMarginTop + "px",
                            marginLeft: addmarginLeft + "px",
                            padding: "3px",
                            fontSize: fontSize + "px",

                            // border: '1px lightgray solid ',
                            // border:
                            //   this.props.highLight === arr[i].title
                            //     ? '2px solid #FF6B4A '
                            //     : '',
                            float: "left",
                            background: color,
                            width: itemWidth + "px",
                            position: "absolute",
                            height: height + "px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            opacity: "0.8",
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
        let dicMeet = sortMeetings();
        //console.log(dic, dicMeet);
        let today = new Date();
        let dateNew = moment(today);
        let startDate = dateNew.startOf("week");
        //console.log(new Date(startDate).getDate());
        for (let i = 0; i < 12; ++i) {
            var arr = [];
            //console.log(new Date(startDate).getDate());
            for (let j = 0; j < 24; ++j) {
                arr.push(
                    <Col
                        style={{
                            position: "relative",
                            // borderTop: '1px solid lavender',
                            // background: 'aliceblue',
                            height: "55px",
                            color: "black",
                            borderTop: "1px solid #AFAFB3",
                            margin: "0px",
                            padding: "0px",
                            width: "100%",
                        }}
                    >
                        {getScheduleItemFromDic(i, leftFillNum(j, 2), dic)}
                        {getMeetItemFromDic(
                            new Date(startDate).getDate(),
                            j,
                            dicMeet
                        )}
                    </Col>
                );
            }

            res.push(
                <Col
                    key={"daySchedule" + i}
                    style={{
                        margin: "0px",
                        padding: "0px",
                        flexGrow: "1",
                    }}
                >
                    {arr}
                </Col>
            );
            startDate.add(1, "day");
        }

        return res;
    };

    return (
        <div>
            <Container>
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
                                                textTransform: "uppercase",
                                                color: "#2C2C2E",
                                                padding: "0",
                                                font: "normal normal normal 20px/25px Prohibition",
                                                backgroundColor: `${view.color}`,
                                            }}
                                        >
                                            {view.view_name}
                                        </Typography>

                                        <Row>
                                            {allEvents.map((event) => {
                                                return (
                                                    <div>
                                                        {event.view_id ===
                                                        view.view_unique_id ? (
                                                            <div>
                                                                <div
                                                                    style={{
                                                                        marginTop:
                                                                            "20px",
                                                                        marginLeft:
                                                                            "10px",
                                                                        width: "213px",
                                                                        //height: '148px',
                                                                        backgroundColor: `${view.color}`,
                                                                        padding:
                                                                            "15px 10px",
                                                                    }}
                                                                >
                                                                    <Row>
                                                                        <Col
                                                                            style={{
                                                                                paddingLeft:
                                                                                    "7px",
                                                                            }}
                                                                        >
                                                                            <Typography
                                                                                style={{
                                                                                    textTransform:
                                                                                        "uppercase",
                                                                                    color: "#2C2C2E",
                                                                                    padding:
                                                                                        "0",
                                                                                    font: "normal normal normal 20px/25px Prohibition",
                                                                                }}
                                                                            >
                                                                                {
                                                                                    event.event_name
                                                                                }
                                                                            </Typography>
                                                                        </Col>
                                                                        <Col
                                                                            xs={
                                                                                2
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    Bookmark
                                                                                }
                                                                                alt="bookmark"
                                                                            />
                                                                        </Col>
                                                                    </Row>
                                                                    <div
                                                                        style={{
                                                                            font: "normal normal normal 14px/16px SF Pro Display",
                                                                        }}
                                                                    >
                                                                        <div>
                                                                            {Number(
                                                                                event.duration.substring(
                                                                                    0,
                                                                                    2
                                                                                )
                                                                            ) >
                                                                            "01"
                                                                                ? event.duration.substring(
                                                                                      3,
                                                                                      5
                                                                                  ) !==
                                                                                  "59"
                                                                                    ? Number(
                                                                                          event.duration.substring(
                                                                                              0,
                                                                                              2
                                                                                          )
                                                                                      ) +
                                                                                      " hrs " +
                                                                                      Number(
                                                                                          event.duration.substring(
                                                                                              3,
                                                                                              5
                                                                                          )
                                                                                      ) +
                                                                                      " min"
                                                                                    : Number(
                                                                                          event.duration.substring(
                                                                                              0,
                                                                                              2
                                                                                          )
                                                                                      ) +
                                                                                      1 +
                                                                                      " hrs"
                                                                                : Number(
                                                                                      event.duration.substring(
                                                                                          0,
                                                                                          2
                                                                                      )
                                                                                  ) ==
                                                                                  "01"
                                                                                ? "60 min"
                                                                                : event.duration.substring(
                                                                                      3,
                                                                                      5
                                                                                  ) +
                                                                                  " min"}
                                                                        </div>
                                                                        <div>
                                                                            Location:{" "}
                                                                            {event.location ===
                                                                            ""
                                                                                ? "None Specified"
                                                                                : event.location}
                                                                        </div>
                                                                        <div>
                                                                            -
                                                                            {JSON.parse(
                                                                                event.buffer_time
                                                                            ).before.time.substring(
                                                                                3,
                                                                                5
                                                                            )}{" "}
                                                                            / +
                                                                            {JSON.parse(
                                                                                event.buffer_time
                                                                            ).after.time.substring(
                                                                                3,
                                                                                5
                                                                            )}
                                                                        </div>
                                                                        <div
                                                                            onClick={() =>
                                                                                navigator.clipboard.writeText(
                                                                                    document.location.href.substring(
                                                                                        0,

                                                                                        document
                                                                                            .location
                                                                                            .href
                                                                                            .length -
                                                                                            8
                                                                                    ) +
                                                                                        "event/" +
                                                                                        `${event.event_unique_id}`
                                                                                )
                                                                            }
                                                                        >
                                                                            <img
                                                                                src={
                                                                                    Link
                                                                                }
                                                                                style={{
                                                                                    width: "13px",
                                                                                    height: "13px",
                                                                                    float: "right",
                                                                                    cursor: "pointer",
                                                                                }}
                                                                            />
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

                        <Container
                            fluid
                            style={{
                                borderTop: "1px solid #AFAFB3",
                                margin: "20px 0px",
                                padding: "0px",
                            }}
                        >
                            <Row>
                                <Col
                                    xs={1}
                                    style={{
                                        color: "#636366",
                                        font: "normal normal bold 16px SF Pro Display",
                                        paddingTop: "20px",
                                    }}
                                >
                                    <br></br>
                                    <br></br>
                                    {moment().format("MMMM")}
                                </Col>
                                <Col>
                                    <Row>{weekdaysAndDateDisplay()}</Row>
                                </Col>
                            </Row>
                        </Container>

                        <Container style={{ padding: "0" }}>
                            <Row
                                noGutters={true}
                                style={{
                                    marginLeft: "0rem",
                                    marginRight: "0rem",
                                    flexWrap: "nowrap",
                                }}
                            >
                                <Col xs={1}>
                                    <Container
                                        style={{ margin: "0", padding: "0" }}
                                    >
                                        {timeDisplay()}
                                    </Container>
                                </Col>

                                <Col>
                                    <Row
                                        style={{
                                            flexWrap: "nowrap",
                                        }}
                                    >
                                        {weekViewItems()}
                                    </Row>
                                </Col>
                            </Row>
                        </Container>
                    </div>
                )}
            </Container>
            <div>{showAcceptModal && acceptModal()}</div>
            <div>{showUpdateMeetModal && updateModal()}</div>
        </div>
    );
}