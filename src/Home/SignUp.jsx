import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Box, Button } from '@material-ui/core';

import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom';
import { Col, Container, Form, Modal, Row } from 'react-bootstrap';
import axios from 'axios';
import SocialLogin from './SocialLogin';
const moment = require('moment-timezone');

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Custom Hook to make styles */
const useStyles = makeStyles({
  textFieldBackgorund: {
    backgroundColor: '#F3F3F8',
    border: '2px solid #636366',
    borderRadius: '3px',
  },
});

/* Navigation Bar component function */
export default function Login() {
  const classes = useStyles();
  const history = useHistory();

  console.log('In Sign Up page');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFName, setNewFName] = useState('');
  const [newLName, setNewLName] = useState('');

  const hideSignUp = () => {
    //setSignUpModalShow(false);
    setSocialSignUpModalShow(false);
    history.push('/');
    setEmail('');
    setPassword('');
    setNewFName('');
    setNewLName('');
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
      .post(BASE_URL + 'UserSignUp', {
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
        console.log('its in landing page');
        console.log(error);
      });
  };
  const handleSocialSignUpDone = () => {
    axios
      .post(BASE_URL + 'UserSocialSignUp', {
        email_id: newEmail,
        first_name: newFName,
        last_name: newLName,
      })
      .then((response) => {
        console.log(response.data);
        hideSignUp();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <Container
      style={{
        background: '#F3F3F8 0% 0% no-repeat padding-box',

        minWidth: '100%',
      }}
    >
      <Row>
        <Col>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#F3F3F8',
            }}
          >
            <Box
              marginTop="10%"
              display="flex"
              flexDirection="column"
              display="flex"
              flexDirection="column"
              alignItems="center"
              style={{ width: '25rem' }}
            >
              <Typography>SIGN UP</Typography>
              <Box display="flex" justifyContent="center" marginTop="1rem">
                <SocialLogin />
              </Box>
              <Box
                marginTop="1rem"
                marginBottom="1rem"
                display="flex"
                justifyContent="center"
                style={{ fontWeight: 'bold' }}
              >
                Or continue with Email
              </Box>
              <Form as={Container}>
                <Form.Group className="formEltMargin">
                  <Form.Group as={Row} className="formEltMargin">
                    <Col>
                      <Form.Control
                        className={classes.textFieldBackgorund}
                        type="text"
                        placeholder="First Name"
                        value={newFName}
                        onChange={handleNewFNameChange}
                      />
                    </Col>
                    <Col>
                      <Form.Control
                        className={classes.textFieldBackgorund}
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
                        className={classes.textFieldBackgorund}
                        type="text"
                        placeholder="Email address"
                        value={newEmail}
                        onChange={handleNewEmailChange}
                      />
                    </Form.Group>
                  </Col>
                </Form.Group>
                <Col>
                  <Form.Group as={Row} className="formEltMargin">
                    <Form.Control
                      className={classes.textFieldBackgorund}
                      type="password"
                      placeholder="Create Password"
                      value={newPassword}
                      onChange={handleNewPasswordChange}
                    />
                  </Form.Group>
                </Col>

                <Form.Group className="formEltMargin">
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Button
                      onClick={handleSignUpDone}
                      style={{
                        marginTop: '1rem',
                        width: '93px',
                        height: '40px',
                        textAlign: 'left',
                        font: 'normal normal normal 18px/21px SF Pro Display',
                        letterSpacing: '0px',
                        color: '#2C2C2E',
                        textTransform: 'none',
                        border: ' 2px solid #2C2C2E',
                        borderRadius: ' 3px',
                      }}
                    >
                      Sign Up
                    </Button>

                    <Button
                      onClick={hideSignUp}
                      style={{
                        marginTop: '1rem',
                        width: '93px',
                        height: '40px',
                        textAlign: 'left',
                        font: 'normal normal normal 18px/21px SF Pro Display',
                        letterSpacing: '0px',
                        color: '#F3F3F8',
                        textTransform: 'none',
                        background: '#2C2C2E 0% 0% no-repeat padding-box',
                        borderRadius: '3px',
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </Box>
          </Box>
        </Col>
        <Col
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'left',
            position: 'relative',
            top: '100%',
            marginTop: '10%',
          }}
        >
          <Typography
            style={{
              textAlign: 'left',
              font: 'italic normal bold 30px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
            }}
          >
            You are steps away from controlling your calendar!
          </Typography>
          <Typography
            style={{
              textAlign: 'left',
              font: 'normal normal normal 24px/29px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
              marginTop: '1rem',
              paddingLeft: '10px',
            }}
          >
            1. Create a{' '}
            <span
              style={{
                font: 'normal normal normal 24px/29px Prohibition',
                textTransform: 'uppercase',
                color: '#F5B51D',
              }}
            >
              &nbsp;View&nbsp;
            </span>{' '}
            on your calendar
          </Typography>
          <Typography
            style={{
              textAlign: 'left',
              font: 'normal normal normal 24px/29px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
              marginTop: '1rem',
              paddingLeft: '10px',
            }}
          >
            2. Create{' '}
            <span
              style={{
                font: 'normal normal normal 24px/29px Prohibition',
                textTransform: 'uppercase',
                color: '#F1E3C8',
              }}
            >
              &nbsp;EVENT types&nbsp;
            </span>{' '}
            for the view
          </Typography>
          <Typography
            style={{
              textAlign: 'left',
              font: 'normal normal normal 24px/29px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
              marginTop: '1rem',
              paddingLeft: '10px',
            }}
          >
            3. Copy / Paste
            <span
              style={{
                font: 'normal normal normal 24px/29px Prohibition',
                textTransform: 'uppercase',
                color: '#F3A3BB',
              }}
            >
              &nbsp;EVENT type&nbsp;
            </span>
            links to share with friends, family and colleagues
          </Typography>
          <Typography
            style={{
              textAlign: 'left',
              font: 'normal normal normal 24px/29px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
              marginTop: '1rem',
              paddingLeft: '10px',
            }}
          >
            4. Others can easily
            <span
              style={{
                font: 'normal normal normal 24px/29px Prohibition',
                textTransform: 'uppercase',
                color: '#E45B1B',
              }}
            >
              &nbsp;VIEW&nbsp;
            </span>{' '}
            your calendar and pick a date & time
          </Typography>
          <Typography
            style={{
              textAlign: 'left',
              font: 'normal normal normal 24px/29px SF Pro Display',
              letterSpacing: '0px',
              color: '#2C2C2E',
              marginTop: '1rem',
              paddingLeft: '10px',
            }}
          >
            5. See the meetings on your
            <span
              style={{
                font: 'normal normal normal 24px/29px Prohibition',
                textTransform: 'uppercase',
                color: '#72D0A0',
              }}
            >
              &nbsp;SKEDUL&nbsp;
            </span>{' '}
            and on your google calendar
          </Typography>
        </Col>
      </Row>
    </Container>
  );
}
