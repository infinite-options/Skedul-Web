import React, { useState, useEffect, useContext } from "react";
import jwt_decode from "jwt-decode";
import axios from "axios";
import { Col, Row, Container, Form, Modal } from "react-bootstrap";
import { Grid, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import * as ReactBootStrap from "react-bootstrap";
import LoginContext from "../../LoginContext";

const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

function GoogleSignIn(props) {
  const {
    email,
    setEmail,
    loggedIn,
    setLoggedIn,
    accessToken,
    setAccessToken,
    userID,
    setUserID,
  } = props;
  const history = useHistory();
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [showSpinner, setShowSpinner] = useState(false);

  const loginContext = useContext(LoginContext);
  // gets back ID token, decoded to get email and other account info, used to sign in
  function handleCallBackResponse(response) {
    var userObject = jwt_decode(response.credential);
    if (userObject) {
      let email = userObject.email;
      setEmail(email);
      let user_id = "";
      axios.get(BASE_URL + `UserToken/${email}`).then((response) => {
        setAccessToken(response["data"]["google_auth_token"]);
        user_id = response["data"]["user_unique_id"];
        var old_at = response["data"]["google_auth_token"];
        var refreshToken = response["data"]["google_refresh_token"];
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
        document.cookie =
          "user_access=" + response["data"]["google_auth_token"];
        setUserID(response["data"]["user_unique_id"]);

        fetch(
          `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`,
          {
            method: "GET",
          }
        )
          .then((response) => {
            if (response["status"] === 400) {
              let authorization_url =
                "https://accounts.google.com/o/oauth2/token";

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
                  "Content-Type":
                    "application/x-www-form-urlencoded;charset=UTF-8",
                },
                body: formBody,
              })
                .then((response) => {
                  return response.json();
                })
                .then((responseData) => {
                  return responseData;
                })
                .then((data) => {
                  let at = data["access_token"];
                  setAccessToken(at);
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
            }
          })
          .catch((err) => {
            console.log(err);
          });
      });
      socialGoogle(email);
    }
  }
  const socialGoogle = async (email) => {
    setShowSpinner(true);

    axios
      .get(BASE_URL + "UserSocialLogin/" + email)
      .then((res) => {
        if (res.data.result !== false) {
          document.cookie = "user_uid=" + res.data.result[0];
          document.cookie = "user_email=" + email;
          document.cookie = "user_access=" + res.data.result[1];
          setLoggedIn(true);
          setAccessToken(res.data.result[1]);
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
          history.push({
            pathname: "/schedule",
            state: {
              email: email.toString(),
              accessToken: res.data.result[1],
            },
          });
          setShowSpinner(false);
          // Successful log in, Try to update tokens, then continue to next page based on role
        } else {
          setSocialSignUpModalShow(true);
          setShowSpinner(false);
        }
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response);
        }
        console.log(err);
      });
  };

  useEffect(() => {
    /* global google */

    if (window.google) {
      //  initializes the Sign In With Google client based on the configuration object
      google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleCallBackResponse,
      });
      //    method renders a Sign In With Google button in your web pages.
      google.accounts.id.renderButton(document.getElementById("signInDiv"), {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "circle",
        type: "icon",
      });
      // access tokens
    }
  }, []);
  const hideSignUp = () => {
    //setSignUpModalShow(false);
    setSocialSignUpModalShow(false);
    history.push("/");
  };

  const socialSignUpModal = () => {
    const modalStyle = {
      position: "absolute",
      top: "30%",
      left: "2%",
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
    return (
      <Modal
        show={socialSignUpModalShow}
        onHide={hideSignUp}
        style={modalStyle}
      >
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>User Does Not Exist</Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <div>The user {email} does not exist! Please Sign Up!</div>
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
                onClick={() => history.push("/signup")}
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
      </Modal>
    );
  };
  return (
    <div className="m-2">
      <div id="signInDiv"></div>
      {showSpinner ? (
        <div className="w-100 d-flex flex-column justify-content-center align-items-center">
          <ReactBootStrap.Spinner animation="border" role="status" />
        </div>
      ) : (
        ""
      )}

      {socialSignUpModal()}
    </div>
  );
}

export default GoogleSignIn;
