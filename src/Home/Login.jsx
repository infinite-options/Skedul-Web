import React from "react";
import "../styles/login.css";
import { Box, TextField, Button, Grid } from "@mui/material";
import { useHistory } from "react-router-dom";
import { Typography } from "@mui/material";
import axios from "axios";
import { useState, useContext } from "react";
import LoginContext from "../LoginContext";
import { Container, Row, Col } from "react-bootstrap";
import Apple from "../images/Apple.svg";
import Logo from "../images/Logo.svg";
import Login1 from "../images/Login1.svg";
import Login2 from "../images/Login2.svg";
import Login3 from "../images/Login3.svg";
import Login4 from "../images/Login4.svg";
import Login5 from "../images/Login5.svg";
import Login6 from "../images/Login6.svg";
import Login7 from "../images/Login7.svg";
import Login8 from "../images/Login8.svg";
import Login9 from "../images/Login9.svg";
import Login10 from "../images/Login10.svg";
import GoogleSignIn from "./Google/GoogleSignIn";
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Navigation Bar component function */
export default function Login() {
  const loginContext = useContext(LoginContext);
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  console.log("in login page");
  const history = useHistory();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState();
  const [validation, setValidation] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [userID, setUserID] = useState("");
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("event", event, email, password);
    axios
      .get(
        BASE_URL + "UserLogin/" + email.toString() + "," + password.toString()
      )
      .then((response) => {
        console.log(response.data);
        if (response.data.result !== false) {
          document.cookie = "user_uid=" + response.data.result;
          document.cookie = "user_email=" + email;
          document.cookie = "user_access=" + accessToken.toString();
          setLoggedIn(true);
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            user: {
              ...loginContext.loginState.user,
              id: response.data.result.toString(),
              email: email.toString(),
              user_access: "",
            },
          });
          history.push({
            pathname: "/schedule",
            state: {
              email: email.toString(),
              accessToken: "",
            },
          });
        } else {
          setLoggedIn(false);
          setValidation(response.data.message);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  if (
    document.cookie
      .split(";")
      .some((item) => item.trim().startsWith("user_uid="))
  ) {
    history.push({
      pathname: "/schedule",
      state: {
        email: email.toString(),
        accessToken: accessToken.toString(),
      },
    });
  } else {
  }
  return (
    <div
      className="main"
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        width="100%"
        height="130px"
        backgroundColor="rgb(201, 201, 235)"
        padding="10px"
      >
        <Box
          display="flex"
          flexWrap="nowrap"
          justifyContent="space-between"
          alignItems="center"
        >
          <TextField
            variant="outlined"
            label="Email"
            size="small"
            error={Boolean(validation)}
            onChange={handleEmailChange}
            sx={{ margin: "0 10px" }}
          />
          <TextField
            variant="outlined"
            label="Password"
            size="small"
            type="password"
            error={Boolean(validation)}
            onChange={handlePasswordChange}
            sx={{ margin: "0 10px" }}
          />
          <Button
            onClick={handleSubmit}
            style={{
              width: "75px",
              height: "40px",
              textAlign: "left",
              font: "normal normal normal 18px/21px SF Pro Display",
              letterSpacing: "0px",
              color: "#F3F3F8",
              textTransform: "none",
              background: "#2C2C2E 0% 0% no-repeat padding-box",
              borderRadius: "3px",
              margin: "0 10px",
            }}
          >
            Login
          </Button>

          <GoogleSignIn
            email={email}
            setEmail={setEmail}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
            accessToken={accessToken}
            setAccessToken={setAccessToken}
            userID={userID}
            setUserID={setUserID}
          />
          <Button
            style={{
              //borderRadius: '32px',
              backgroundImage: `url(${Apple})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",

              height: "42px",
              //background: `transparent url(${Google}) 0% 0% no-repeat padding-box`,
            }}
          ></Button>
        </Box>

        <Box
          display="flex"
          flexWrap="nowrap"
          flexDirection="column"
          justifyContent="space-between"
          alignItems="center"
        >
          Don't have an account?
          <Button
            onClick={() => history.push("/signup")}
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
        </Box>
      </Box>
      <Box display="flex" flexDirection="row" alignSelf="center">
        <Typography
          style={{
            textAlign: "left",
            font: "italic normal bold 32px/38px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
          }}
        >
          Peer to peer&nbsp;
        </Typography>
        <img src={Logo} />
        <Typography
          style={{
            textAlign: "left",
            font: "italic normal bold 32px/38px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
          }}
        >
          ing made easy!
        </Typography>
      </Box>
      <Box display="flex" flexDirection="row" alignSelf="center">
        <Typography
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          Share available times with friends, colleagues and others
        </Typography>
      </Box>
      <Box display="flex" flexDirection="row" alignSelf="center">
        <Typography
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          People can easily schedule time on your calendar in the{" "}
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            View
          </span>{" "}
          you provide
        </Typography>
      </Box>
      <Box display="flex" flexDirection="row" alignSelf="center">
        <Typography
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          Keep track of your{" "}
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            SKEDUL
          </span>
        </Typography>
      </Box>
      <br />
      <Box display="flex" flexDirection="row" alignSelf="center">
        <Typography
          style={{
            textAlign: "left",
            font: "italic normal bold 32px/38px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
          }}
        >
          How to use&nbsp;
        </Typography>
        <img src={Logo} />
      </Box>
      <Box margin="20px">
        <Box
          position="absolute"
          left="105px"
          width="75vw"
          height="50px"
          backgroundColor="#f3a3bb"
          zIndex="5"
        ></Box>
        <Typography
          style={{
            position: "relative",
            zIndex: "10",
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          1. Create a{" "}
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            &nbsp;View&nbsp;
          </span>
          on your calendar
        </Typography>
        <img src={Login2} style={{ position: "relative", zIndex: "10" }} />
      </Box>
      <Box margin="20px">
        <Box
          position="absolute"
          left="105px"
          width="75vw"
          height="50px"
          backgroundColor="#f4d484"
          zIndex="5"
        ></Box>
        <Typography
          style={{
            position: "relative",
            zIndex: "10",
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          2. Create{" "}
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            &nbsp;Event Types&nbsp;
          </span>
          for the view
        </Typography>
        <img src={Login4} style={{ position: "relative", zIndex: "10" }} />
      </Box>
      <Box margin="20px">
        <Box
          position="absolute"
          left="105px"
          width="75vw"
          height="50px"
          backgroundColor="#e45c1c"
          zIndex="5"
        ></Box>
        <Typography
          style={{
            position: "relative",
            zIndex: "10",
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          3. Copy/ Paste{" "}
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            &nbsp;Event Type&nbsp;
          </span>
          links to share with friends, family and colleagues
        </Typography>
        <img src={Login6} style={{ position: "relative", zIndex: "10" }} />
      </Box>
      <Box margin="20px">
        <Box
          position="absolute"
          left="105px"
          width="75vw"
          height="50px"
          backgroundColor="#74d3a3"
          zIndex="5"
        ></Box>
        <Typography
          style={{
            position: "relative",
            zIndex: "10",
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          4. Others can easily
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            &nbsp;View&nbsp;
          </span>
          your calendar and pick a date & time
        </Typography>
        <img src={Login8} style={{ position: "relative", zIndex: "10" }} />
      </Box>
      <Box margin="20px">
        <Box
          position="absolute"
          left="105px"
          width="75vw"
          height="50px"
          backgroundColor="#f4e4cc"
          zIndex="5"
        ></Box>
        <Typography
          style={{
            position: "relative",
            zIndex: "10",
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1rem",
          }}
        >
          5. See the meetings on your
          <span
            style={{
              font: "normal normal normal 24px/29px Prohibition",
              textTransform: "uppercase",
            }}
          >
            &nbsp;Skedul&nbsp;
          </span>
          and on your Google calendar
        </Typography>
        <img src={Login10} style={{ position: "relative", zIndex: "10" }} />{" "}
      </Box>
    </div>
  );
}
