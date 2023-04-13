import React, { useContext, useState } from "react";
import "../styles/socialLogin.css";
import axios from "axios";
import { Grid, Button } from "@mui/material";
import { useHistory } from "react-router-dom";
import { Col, Container, Form, Modal, Row } from "react-bootstrap";
import { withRouter } from "react-router";
import LoginContext from "../LoginContext";
import GoogleSignUp from "./Google/GoogleSignUp";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

function SocialLogin(props) {
  // const Auth = useContext(AuthContext);
  const loginContext = useContext(LoginContext);
  const history = useHistory();
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
  return (
    <Grid
      container
      spacing={3}
      display="flex"
      flexDirection="row"
      justifyContent="center"
    >
      <Grid item xs={4}>
        <GoogleSignUp
          first_name={props.firstName}
          last_name={props.lastName}
          phone_number={props.phoneNumber}
          role={props.role}
          onConfirm={props.onConfirm}
          socialSignUpModalShow={socialSignUpModalShow}
          setSocialSignUpModalShow={setSocialSignUpModalShow}
        />
      </Grid>

      {socialSignUpModal()}
    </Grid>
  );
}

export default withRouter(SocialLogin);
