import React, { useContext, useState } from "react";

import { makeStyles } from "@mui/styles";
import GoogleLogin from "react-google-login";
import axios from "axios";
import { Grid, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
//import { AuthContext } from '../auth/AuthContext';
import { withRouter } from "react-router";
import Google from "../images/Google.svg";
import LoginContext from "../LoginContext";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const useStyles = makeStyles({
  textFieldBackgorund: {
    backgroundColor: "#F3F3F8",
    border: "2px solid #636366",
    borderRadius: "3px",
  },
});

function SocialLogin(props) {
  // const Auth = useContext(AuthContext);
  const loginContext = useContext(LoginContext);
  const classes = useStyles();
  const history = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFName, setNewFName] = useState("");
  const [newLName, setNewLName] = useState("");
  const [socialId, setSocialId] = useState("");
  const [refreshToken, setrefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessExpiresIn, setaccessExpiresIn] = useState("");
  const client_id = CLIENT_ID;
  const client_secret = CLIENT_SECRET;
  console.log(client_id);
  const redirect_uris = ["https://www.skedul", "https://www.skedul/schedule", "https://www.skedul/", "https://skedul", "http://localhost:3000", "http://localhost"];
  const responseGoogle = (response) => {
    console.log("response", response);

    let auth_code = response.code;
    let authorization_url = "https://accounts.google.com/o/oauth2/token";

    console.log("auth_code", auth_code);
    var details = {
      code: auth_code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: "http://localhost:3000",
      //redirectUri: 'https://skedul.online',
      grant_type: "authorization_code",
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + "=" + encodedValue);
    }
    formBody = formBody.join("&");
    console.log(formBody);

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
                  pathname: "/schedule",
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
  console.log(newEmail);

  const _socialLoginAttempt = (email, accessToken, socialId) => {
    axios
      .get(BASE_URL + "UserSocialLogin/" + email)
      .then((res) => {
        console.log(res);
        if (res.data.result !== false) {
          document.cookie = "user_uid=" + res.data.result[0];
          document.cookie = "user_email=" + email;
          document.cookie = "user_access=" + res.data.result[1];
          setLoggedIn(true);
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
          console.log(email);
          history.push({
            pathname: "/schedule",
            state: {
              email: email.toString(),
              accessToken: res.data.result[1],
            },
          });
          // Successful log in, Try to update tokens, then continue to next page based on role
        } else {
          console.log("log in error");
          setNewEmail(email);
          setSocialSignUpModalShow(true);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
  };

  const hideSignUp = () => {
    //setSignUpModalShow(false);
    setSocialSignUpModalShow(false);
    history.push("/");
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
        hideSignUp();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const socialSignUpModal = () => {
    const modalStyle = {
      position: "absolute",
      top: "10%",
      left: "38%",
      width: "400px",
    };
    const headerStyle = {
      border: "none",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      fontSize: "20px",
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
      <Modal show={socialSignUpModalShow} onHide={hideSignUp} style={modalStyle}>
        <Form as={Container}>
          <Modal.Header style={headerStyle} closeButton>
            <Modal.Title>Sign Up with Social Media</Modal.Title>
          </Modal.Header>

          <Modal.Body style={bodyStyle}>
            <Form.Group className="formEltMargin">
              <Form.Group as={Row} className="formEltMargin">
                <Col>
                  <Form.Control type="text" placeholder="First Name" value={newFName} onChange={handleNewFNameChange} />
                </Col>
                <Col>
                  <Form.Control type="text" placeholder="Last Name" value={newLName} onChange={handleNewLNameChange} />
                </Col>
              </Form.Group>

              <Col>
                <Form.Group as={Row} className="formEltMargin">
                  <Form.Control plaintext readOnly value={newEmail} className={classes.textFieldBackgorund} />
                </Form.Group>
              </Col>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer style={footerStyle}>
            <Row
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginTop: "1rem",
              }}
            >
              <Col
                xs={6}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="submit"
                  onClick={hideSignUp}
                  style={{
                    marginTop: "1rem",
                    width: "93px",
                    height: "40px",

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
              </Col>
              <Col
                xs={6}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Button
                  type="submit"
                  onClick={handleSocialSignUpDone}
                  style={{
                    marginTop: "1rem",
                    width: "93px",
                    height: "40px",

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
          </Modal.Footer>
        </Form>
      </Modal>
    );
  };
  return (
    <Grid container spacing={3} display="flex" flexDirection="row" justifyContent="center">
      <Grid item xs={4}>
        <Button style={{}}>
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
            render={(renderProps) => <img src={Google} onClick={renderProps.onClick} disabled={renderProps.disabled} alt={""}></img>}
          />
        </Button>
      </Grid>

      {socialSignUpModal()}
    </Grid>
  );
}

export default withRouter(SocialLogin);
