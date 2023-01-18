import React from "react";
import { makeStyles } from "@mui/styles";
import { Box, TextField, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Typography } from "@mui/material";
import Google from "../images/Google1.svg";
import { GoogleLogin } from "react-google-login";
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
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Custom Hook to make styles */
const useStyles = makeStyles({
  textFieldBackgorund: {
    backgroundColor: "#C9C9EB",
    border: "2px solid #636366",
    borderRadius: "3px",
  },
});

/* Navigation Bar component function */
export default function Login() {
  const loginContext = useContext(LoginContext);
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  console.log("in login page");
  const classes = useStyles();
  const history = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState();
  const [validation, setValidation] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [idToken, setIdToken] = useState("");
  const [socialId, setSocialId] = useState("");
  const [userID, setUserID] = useState("");
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const responseGoogle = (response) => {
    console.log(response);
    if (response.profileObj) {
      let email = response.profileObj.email;
      let user_id = "";
      setSocialId(response.googleId);
      axios.get(BASE_URL + `UserToken/${email}`).then((response) => {
        console.log("in events", response["data"]["user_unique_id"], response["data"]["google_auth_token"]);
        console.log("in events", response);
        setAccessToken(response["data"]["google_auth_token"]);
        let url = "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
        loginContext.setLoginState({
          ...loginContext.loginState,
          loggedIn: true,
          user: {
            ...loginContext.loginState.user,
            id: response["data"]["user_unique_id"],
            email: response["data"]["user_email_id"],
            user_access: response["data"]["google_auth_token"],
          },
        });
        document.cookie = "user_uid=" + response["data"]["user_unique_id"];
        document.cookie = "user_email=" + response["data"]["user_email_id"];
        document.cookie = "user_access=" + response["data"]["google_auth_token"];
        setUserID(response["data"]["user_unique_id"]);
        user_id = response["data"]["user_unique_id"];
        var old_at = response["data"]["google_auth_token"];
        console.log("in events", old_at);
        var refreshToken = response["data"]["google_refresh_token"];

        let checkExp_url = url + old_at;
        console.log("in events", checkExp_url);
        fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`, {
          method: "GET",
        })
          .then((response) => {
            console.log("in events", response);
            if (response["status"] === 400) {
              console.log("in events if");
              let authorization_url = "https://accounts.google.com/o/oauth2/token";

              var details = {
                refresh_token: refreshToken,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: "refresh_token",
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
                  var id_token = data["id_token"];
                  setAccessToken(at);
                  setIdToken(id_token);
                  console.log("in events", at);
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
              console.log(old_at);
            }
          })
          .catch((err) => {
            console.log(err);
          });
        console.log("in events", refreshToken, accessToken);
      });

      _socialLoginAttempt(email, accessToken, socialId, "GOOGLE");
    }
  };

  const _socialLoginAttempt = (email, at, socialId, platform) => {
    axios
      .get(BASE_URL + "UserSocialLogin/" + email)
      .then((res) => {
        console.log(res);
        if (res.data.result !== false) {
          document.cookie = "user_uid=" + res.data.result[0];
          document.cookie = "user_email=" + email;
          document.cookie = "user_access=" + res.data.result[1];
          setLoggedIn(true);
          setAccessToken(res.data.result[1]);
          console.log("Login socialloginattempt", at);
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            user: {
              ...loginContext.loginState.user,
              id: res.data.result[0],
              email: email.toString(),
              user_access: res.data.result[1],
            },
          });
          console.log("Login successful");
          console.log(email, document.cookie);
          history.push({
            pathname: "/schedule",
            state: { email: email.toString(), accessToken: res.data.result[1] },
          });
          // Successful log in, Try to update tokens, then continue to next page based on role
        } else {
          console.log("log in error");
          history.push("/signup");
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("event", event, email, password);
    axios
      .get(BASE_URL + "UserLogin/" + email.toString() + "," + password.toString())
      .then((response) => {
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

  if (document.cookie.split(";").some((item) => item.trim().startsWith("user_uid="))) {
    console.log("we are here");
    console.log(document.cookie);
    console.log(accessToken);

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
    <Container
      style={{
        background: "#F3F3F8 0% 0% no-repeat padding-box",
        //padding: '0px 100px',
        minWidth: "100%",
      }}
    >
      <Row
        style={{
          background: "#C9C9EB 0% 0% no-repeat padding-box",
          height: "131px",
          minWidth: "100%",
        }}
      >
        <Col
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: "30%",
          }}
        >
          <Box marginTop="6rem" marginRight="2rem">
            <TextField className={classes.textFieldBackgorund} variant="outlined" label="Email" size="small" error={validation} fullWidth={true} onChange={handleEmailChange} />
          </Box>

          <Box marginTop="6rem" marginRight="2rem">
            <TextField
              className={classes.textFieldBackgorund}
              variant="outlined"
              label="Password"
              size="small"
              type="password"
              error={validation}
              fullWidth={true}
              onChange={handlePasswordChange}
            />
          </Box>
          <Box marginTop="6rem">
            {" "}
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
              }}
              marginTop="5rem"
            >
              Login
            </Button>
            <Box color="red" style={{ textTransform: "lowercase" }}>
              <Typography>{validation}</Typography>
            </Box>
          </Box>
        </Col>

        <Col
          xs={2}
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GoogleLogin
            clientId={CLIENT_ID}
            render={(renderProps) => (
              <Button
                style={{
                  //borderRadius: '32px',
                  backgroundImage: `url(${Google})`,
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  width: "241px",
                  height: "52px",
                  //background: `transparent url(${Google}) 0% 0% no-repeat padding-box`,
                }}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
              ></Button>
            )}
            buttonText="Log In"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            isSignedIn={false}
            disable={false}
            cookiePolicy={"single_host_origin"}
          />
          <Button
            style={{
              //borderRadius: '32px',
              backgroundImage: `url(${Apple})`,
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              width: "241px",
              height: "52px",
              //background: `transparent url(${Google}) 0% 0% no-repeat padding-box`,
            }}
          ></Button>
        </Col>
        <Col
          xs={2}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {" "}
          Don't have an account?
          <Button
            marginTop="1rem"
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
        </Col>
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1rem",
        }}
      >
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
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "column",
          // float: 'left',
          alignItems: "left",
          position: "relative",
          left: "30%",
          marginTop: "1rem",
        }}
      >
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
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "3rem",
        }}
      >
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
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "2rem",
        }}
      >
        <Col
          xs={1.5}
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "1.7rem",
          }}
        >
          1. Create a{" "}
        </Col>
        <Col style={{ padding: "0px" }}>
          <img src={Login1} style={{ width: "100%", margin: 0 }} />
          <Typography
            style={{
              position: "absolute",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "1.5rem",
            }}
          >
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
        </Col>
      </Row>
      <Row>
        <img src={Login2} />
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            width: "13rem",
            display: "flex",
            flexDirection: "row",
            height: "6.8rem",
            backgroundImage: `url(${Login3})`,
            backgroundSize: "fill",
          }}
        >
          {" "}
          {/* <img src={Login7} style={{ width: '100%', position: 'relative' }} /> */}
          <Typography
            style={{
              position: "absolute",
              // top: '0',
              // bottom: '0',
              // left: '0',
              // right: '0',
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "2.5rem",
            }}
          >
            2. Create
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
              }}
            >
              &nbsp;EVENT types&nbsp;
            </span>
          </Typography>
        </div>

        <Col
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "2.7rem",
            //padding: '0px',
            paddingLeft: "8px",
          }}
        >
          for the view
        </Col>
      </Row>
      <Row>
        <img src={Login4} />
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "2rem",
        }}
      >
        <Col
          xs={1.5}
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "2.7rem",
          }}
        >
          3. Copy / Paste
        </Col>
        <Col style={{ padding: "0px" }}>
          <img src={Login5} style={{ width: "100%", margin: 0 }} />
          <Typography
            style={{
              position: "absolute",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "2.5rem",
            }}
          >
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
              }}
            >
              &nbsp;EVENT type&nbsp;
            </span>
            links to share with friends, family and colleagues
          </Typography>
        </Col>
      </Row>
      <Row>
        <img src={Login6} />
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "2rem",
        }}
      >
        <div
          style={{
            width: "15rem",
            display: "flex",
            flexDirection: "row",
            height: "6.8rem",
            backgroundImage: `url(${Login7})`,
            backgroundSize: "fill",
          }}
        >
          {" "}
          {/* <img src={Login7} style={{ width: '100%', position: 'relative' }} /> */}
          <Typography
            style={{
              position: "absolute",
              // top: '0',
              // bottom: '0',
              // left: '0',
              // right: '0',
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "2.5rem",
            }}
          >
            4. Others can easily
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
              }}
            >
              &nbsp;VIEW&nbsp;&nbsp;
            </span>
          </Typography>
        </div>

        <Col
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "2.7rem",
            paddingLeft: "10px",
          }}
        >
          your calendar and pick a date & time
        </Col>
      </Row>
      <Row>
        <img src={Login8} />
      </Row>
      <Row
        style={{
          display: "flex",
          flexDirection: "row",
          marginTop: "2rem",
        }}
      >
        <Col
          xs={1.5}
          style={{
            textAlign: "left",
            font: "normal normal normal 24px/29px SF Pro Display",
            letterSpacing: "0px",
            color: "#2C2C2E",
            marginTop: "2.7rem",
          }}
        >
          5. See the meetings on your
        </Col>
        <Col style={{ padding: "0px" }}>
          <img src={Login9} style={{ width: "100%", margin: 0 }} />
          <Typography
            style={{
              position: "absolute",
              top: "0",
              bottom: "0",
              left: "0",
              right: "0",
              textAlign: "left",
              font: "normal normal normal 24px/29px SF Pro Display",
              letterSpacing: "0px",
              color: "#2C2C2E",
              marginTop: "2.5rem",
            }}
          >
            <span
              style={{
                font: "normal normal normal 24px/29px Prohibition",
                textTransform: "uppercase",
              }}
            >
              &nbsp;SKEDUL&nbsp;
            </span>
            and on your Google calendar
          </Typography>
        </Col>
      </Row>
      <Row>
        <img src={Login10} />
      </Row>
    </Container>
  );
}
