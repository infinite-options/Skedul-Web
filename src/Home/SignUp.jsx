import React, { useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import "../styles/signup.css";
import { Typography } from "@mui/material";
import { useHistory } from "react-router-dom";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import axios from "axios";
import GoogleSignUp from "./Google/GoogleSignUp";
const moment = require("moment-timezone");

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Navigation Bar component function */
export default function Login() {
  const history = useHistory();

  console.log("In Sign Up page");
  const [createAccountFlag, setCreateAccountFlag] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFName, setNewFName] = useState("");
  const [newLName, setNewLName] = useState("");

  const hideSignUp = () => {
    //setSignUpModalShow(false);
    history.push("/");
    setNewEmail("");
    setNewPassword("");
    setNewFName("");
    setNewLName("");
  };

  const handleNewEmailChange = (event) => {
    setNewEmail(event.target.value);
  };

  const handleNewPasswordChange = (event) => {
    setNewPassword(event.target.value);
  };

  const handleNewFNameChange = (event) => {
    setNewFName(event.target.value);
  };

  const handleNewLNameChange = (event) => {
    setNewLName(event.target.value);
  };

  const handleSignUpDone = () => {
    axios
      .post(BASE_URL + "UserSignUp", {
        email_id: newEmail,
        password: newPassword,
        first_name: newFName,
        last_name: newLName,
        time_zone: moment.tz.guess(),
      })
      .then((response) => {
        console.log(response.data);
        hideSignUp();
      })
      .catch((error) => {
        console.log("its in landing page");
        console.log(error);
      });
  };
  return (
    <Container
      style={{
        background: "#F3F3F8 0% 0% no-repeat padding-box",

        minWidth: "100%",
      }}
    >
      <Row style={{ height: "150%" }}>
        <Col style={{ maxWidth: "45%", height: "150%" }}>
          <Box
            style={{
              maxWidth: "45%",
              margin: "0",
              height: "150%",
              backgroundColor: "#F3F3F8",
            }}
          >
            <Typography>SIGN UP</Typography>

            <GoogleSignUp />

            <Box
              marginTop="1rem"
              marginBottom="1rem"
              display="flex"
              justifyContent="center"
              style={{ fontWeight: "bold" }}
            >
              OR
            </Box>
            <Grid
      container
      spacing={3}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <Grid item xs={4}>
        <div id="signUpDiv">
          <Button
            class="btn btn-outline-dark"
            onClick={() => {setCreateAccountFlag(true)}}
            role="button"
            style={{
              textTransform: "none",
              borderRadius: "50px",
              width: "20rem",
            }}
          >
            Create Account
          </Button>
        </div>
      </Grid>
      </Grid>
            {createAccountFlag && <Form as={Container}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "50% 50%",
                  gridTemplateRows: "20% 20% 20% 20% 20%",
                  height: "150%",
                  width: "45%",
                }}
              >
                <div style={{ gridColumnStart: "1" }}>
                  <Form.Control
                    className={"textFieldBackgorund"}
                    type="text"
                    placeholder="First Name"
                    value={newFName}
                    onChange={handleNewFNameChange}
                  />
                </div>
                <div style={{ gridColumnStart: "2" }}>
                  <Form.Control
                    className={"textFieldBackgorund"}
                    type="text"
                    placeholder="Last Name"
                    value={newLName}
                    onChange={handleNewLNameChange}
                  />
                </div>
                <div
                  style={{
                    gridColumnStart: "1",
                    gridColumnEnd: "3",
                    gridRowStart: "2",
                  }}
                >
                  <Form.Control
                    className={"textFieldBackgorund"}
                    type="text"
                    placeholder="Email address"
                    value={newEmail}
                    onChange={handleNewEmailChange}
                  />
                </div>
                <div
                  style={{
                    gridColumnStart: "1",
                    gridColumnEnd: "3",
                    gridRowStart: "3",
                  }}
                >
                  <Form.Control
                    className={"textFieldBackgorund"}
                    type="password"
                    placeholder="Create Password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                  />
                </div>
                <div
                  style={{
                    gridColumnStart: "1",
                    gridRowStart: "4",
                  }}
                >
                  <Button
                    onClick={handleSignUpDone}
                    style={{
                      marginTop: "1rem",
                      width: "93px",
                      height: "40px",
                      textAlign: "left",
                      font: "normal normal normal 18px/21px SF Pro Display",
                      letterSpacing: "0px",
                      color: "#2C2C2E",
                      textTransform: "none",
                      border: " 2px solid #2C2C2E",
                      borderRadius: " 3px",
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
                <div
                  style={{
                    gridColumnStart: "2",
                    gridRowStart: "4",
                  }}
                >
                  <Button
                    onClick={hideSignUp}
                    style={{
                      marginTop: "1rem",
                      width: "93px",
                      height: "40px",
                      textAlign: "left",
                      font: "normal normal normal 18px/21px SF Pro Display",
                      letterSpacing: "0px",
                      color: "#F3F3F8",
                      textTransform: "none",
                      background: "#2C2C2E 0% 0% no-repeat padding-box",
                      borderRadius: "3px",
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Form>}
          </Box>
        </Col>

        {/* Side text */}
        <Col
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "left",
            position: "relative",
            top: "100%",
            marginTop: "10%",
          }}
        >
          <Typography
            style={{
              textAlign: "left",
              font: "italic normal bold 30px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
            }}
          >
            You are steps away from controlling your calendar!
          </Typography>
          <Typography
            style={{
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1rem",
              paddingLeft: "10px",
            }}
          >
            1. Create a{" "}
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
                color: "#F5B51D",
              }}
            >
              &nbsp;View&nbsp;
            </span>{" "}
            on your calendar
          </Typography>
          <Typography
            style={{
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1rem",
              paddingLeft: "10px",
            }}
          >
            2. Create{" "}
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
                color: "#F1E3C8",
              }}
            >
              &nbsp;EVENT types&nbsp;
            </span>{" "}
            for the view
          </Typography>
          <Typography
            style={{
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1rem",
              paddingLeft: "10px",
            }}
          >
            3. Copy / Paste
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
                color: "#F3A3BB",
              }}
            >
              &nbsp;EVENT type&nbsp;
            </span>
            links to share with friends, family and colleagues
          </Typography>
          <Typography
            style={{
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1rem",
              paddingLeft: "10px",
            }}
          >
            4. Others can easily
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
                color: "#E45B1B",
              }}
            >
              &nbsp;VIEW&nbsp;
            </span>{" "}
            your calendar and pick a date & time
          </Typography>
          <Typography
            style={{
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1rem",
              paddingLeft: "10px",
            }}
          >
            5. See the meetings on your
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
                color: "#72D0A0",
              }}
            >
              &nbsp;SKEDUL&nbsp;
            </span>{" "}
            and on your google calendar
          </Typography>
        </Col>
      </Row>
    </Container>
  );
}
