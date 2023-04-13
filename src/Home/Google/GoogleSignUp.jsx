import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import { Grid, Button } from "@mui/material";
import LoginContext from "../../LoginContext";
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

let SCOPES =
  "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.profile";

function GoogleSignUp() {
  const loginContext = useContext(LoginContext);
  const history = useHistory();

  const [loggedIn, setLoggedIn] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newFName, setNewFName] = useState("");
  const [newLName, setNewLName] = useState("");
  const [socialId, setSocialId] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessExpiresIn, setAccessExpiresIn] = useState("");
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [alreadyExists, setAlreadyExists] = useState(false);

  let codeClient = {};

  //   run onclick for authorization and eventually sign up
  function getAuthorizationCode() {
    // Request authorization code and obtain user consent,  method of the code client to trigger the user flow
    codeClient.requestCode();
  }

  useEffect(() => {
    /* global google */

    if (window.google) {
      // initialize a code client for the authorization code flow.
      codeClient = google.accounts.oauth2.initCodeClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
          // gets back authorization code
          if (tokenResponse && tokenResponse.code) {
            let auth_code = tokenResponse.code;
            let authorization_url =
              "https://accounts.google.com/o/oauth2/token";
            var details = {
              code: auth_code,
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              redirectUri: "postmessage",
              grant_type: "authorization_code",
            };
            var formBody = [];
            for (var property in details) {
              var encodedKey = encodeURIComponent(property);
              var encodedValue = encodeURIComponent(details[property]);
              formBody.push(encodedKey + "=" + encodedValue);
            }
            formBody = formBody.join("&");
            // use authorization code, send it to google endpoint to get back ACCESS TOKEN n REFRESH TOKEN
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

              .then((data) => {
                let at = data["access_token"];
                let rt = data["refresh_token"];
                let ax = data["expires_in"];
                //  expires every 1 hr
                setAccessToken(at);
                // stays the same and used to refresh ACCESS token
                setRefreshToken(rt);
                setAccessExpiresIn(ax);
                //  use ACCESS token, to get email and other account info
                axios
                  .get(
                    "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
                      at
                  )
                  .then((response) => {
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
                      if (
                        response.data.message === "User EmailID doesnt exist"
                      ) {
                        setSocialSignUpModalShow(!socialSignUpModalShow);
                      } else {
                        setAlreadyExists(true);
                      }
                    });
                  })
                  .catch((error) => {
                    console.log(error);
                  });
                return (
                  accessToken,
                  refreshToken,
                  accessExpiresIn,
                  newEmail,
                  newFName,
                  newLName,
                  socialId
                );
              })
              .catch((err) => {
                console.log(err);
              });
          }
        },
      });
    }
  }, [getAuthorizationCode]);

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
        access_expires_in: accessExpiresIn.toString(),
      })
      .then((response) => {
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
      <Modal
        show={socialSignUpModalShow}
        onHide={hideSignUp}
        style={modalStyle}
      >
        {/* <Form as={Container}> */}
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>Sign Up with Social Media</Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <Form.Group className="formEltMargin">
            <Form.Group as={Row} className="formEltMargin">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={newFName}
                  onChange={handleNewFNameChange}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={newLName}
                  onChange={handleNewLNameChange}
                />
              </Col>
            </Form.Group>

            <Col>
              <Form.Group as={Row} className="formEltMargin">
                <Form.Control
                  plaintext
                  readOnly
                  value={newEmail}
                  className={"textFieldBackgorund"}
                />
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
        {/* </Form> */}
      </Modal>
    );
  };
  const userAlreadyExists = () => {
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

    return (
      <Modal show={alreadyExists} onHide={hideSignUp} style={modalStyle}>
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>User Already Exists</Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <div>The user {newEmail} already exists! Please Log In!</div>
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
                onClick={() => history.push("/")}
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
                Login
              </Button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  };
  return (
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
            onClick={() => getAuthorizationCode()}
            role="button"
            style={{
              textTransform: "none",
              borderRadius: "50px",
              width: "20rem",
            }}
          >
            <img
              width="20px"
              style={{
                marginBottom: "3px",
                marginRight: "5px",
              }}
              alt="Google sign-up"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png"
            />
            Sign Up with Google
          </Button>
        </div>
      </Grid>

      {socialSignUpModal()}
      {userAlreadyExists()}
    </Grid>
  );
}

export default GoogleSignUp;
