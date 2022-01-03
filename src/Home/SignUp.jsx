import React, { useState } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Box, TextField, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Ellipse from './LoginAssets/Ellipse.svg';
import LoginImage from './LoginAssets/Login.svg';
import { Col, Container, Form, Modal, Row } from 'react-bootstrap';
import axios from 'axios';
import SocialLogin from './SocialLogin';
const moment = require('moment-timezone');

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Custom Hook to make styles */
const useStyles = makeStyles({
  textFieldBackgorund: {
    backgroundColor: '#FFFFFF',
  },

  buttonImage: {
    backgroundImage: `url(${Ellipse})`,
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
      .post(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSignUp',
        {
          email_id: newEmail,
          password: newPassword,
          first_name: newFName,
          last_name: newLName,
          time_zone: moment.tz.guess(),
        }
      )
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
      .post(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp',
        {
          email_id: newEmail,
          first_name: newFName,
          last_name: newLName,
        }
      )
      .then((response) => {
        console.log(response.data);
        hideSignUp();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const socialSignUpModal = () => {
    return (
      <Modal show={socialSignUpModalShow} onHide={hideSignUp}>
        <Form as={Container}>
          <h3 className="bigfancytext formEltMargin">
            Sign Up with Social Media
          </h3>
          <Form.Group as={Row} className="formEltMargin">
            <Form.Label column sm="4">
              Email
            </Form.Label>
            <Col sm="8">
              <Form.Control plaintext readOnly value={newEmail} />
            </Col>
          </Form.Group>
          {/* <Form.Group as={Row} className="formEltMargin">
            <Form.Label column sm="4">
              Phone Number
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="tel"
                pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                placeholder="123-4567-8901"
                value={newPhoneNumber}
                onChange={handleNewPhoneNumberChange}
              />
            </Col>
          </Form.Group> */}
          <Form.Group as={Row} className="formEltMargin">
            <Form.Label column sm="2">
              First Name
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                placeholder="John"
                value={newFName}
                onChange={handleNewFNameChange}
              />
            </Col>
            <Form.Label column sm="2">
              Last Name
            </Form.Label>
            <Col sm="4">
              <Form.Control
                type="text"
                placeholder="Doe"
                value={newLName}
                onChange={handleNewLNameChange}
              />
            </Col>
          </Form.Group>
          {/* <Form.Group as={Row} className="formEltMargin">
            <Form.Label column sm="4">
              Employer
            </Form.Label>
            <Col sm="8">
              <Form.Control
                type="text"
                value={newEmployer}
                onChange={handleNewEmployerChange}
              />
            </Col>
          </Form.Group> */}
          <Form.Group as={Row} className="formEltMargin">
            <Col>
              <Button
                variant="primary"
                type="submit"
                onClick={handleSocialSignUpDone}
              >
                Sign Up
              </Button>
            </Col>
            <Col>
              <Button variant="primary" type="submit" onClick={hideSignUp}>
                Cancel
              </Button>
            </Col>
          </Form.Group>
        </Form>
      </Modal>
    );
  };


  return (
    <Box
      display="flex"
      style={{ width: '100%', height: '100%', backgroundColor: '#F2F7FC' }}
    >
      <Box style={{ position: 'fixed', top: '100px', left: '-100px' }}>
        <img src={Ellipse} alt="Ellipse" />
      </Box>
      <Box display="flex" marginTop="35%" marginLeft="30%">
        {/* <Button
          onClick={handleSignUp}
          style={{
            width: '7.5rem',
            height: '7.5rem',
            backgroundImage: `url(${SignUpImage})`,
          }}
        ></Button> */}
      </Box>

      <Box
        marginTop="70px"
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Form as={Container}>
          <h3
            className="bigfancytext formEltMargin"
            style={{
              textAlign: 'center',
              letterSpacing: '0.49px',
              color: '#000000',
              opacity: 1,
            }}
          >
            Sign Up
          </h3>
          <Form.Group className="formEltMargin">
            <Form.Group as={Row} className="formEltMargin">
              <Col>
                <Form.Control
                  type="text"
                  placeholder="First Name"
                  value={newFName}
                  onChange={handleNewFNameChange}
                  style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    borderRadius: '26px',
                    opacity: 1,
                    width: '230px',
                  }}
                />
              </Col>
              <Col>
                <Form.Control
                  type="text"
                  placeholder="Last Name"
                  value={newLName}
                  onChange={handleNewLNameChange}
                  style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    borderRadius: '26px',
                    opacity: 1,
                    width: '230px',
                  }}
                />
              </Col>
            </Form.Group>
            {/* <Col>
              <Form.Group as={Row} className="formEltMargin">
                <Form.Control
                  type="text"
                  placeholder="Employer"
                  value={newEmployer}
                  onChange={handleNewEmployerChange}
                  style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    borderRadius: '26px',
                    opacity: 1,
                    width: '500px',
                  }}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group as={Row} className="formEltMargin">
                <Form.Control
                  type="tel"
                  placeholder="Phone Number"
                  pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}"
                  value={newPhoneNumber}
                  onChange={handleNewPhoneNumberChange}
                  style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    borderRadius: '26px',
                    opacity: 1,
                    width: '500px',
                  }}
                />
              </Form.Group>
            </Col> */}
            <Col>
              <Form.Group as={Row} className="formEltMargin">
                <Form.Control
                  type="text"
                  placeholder="Email address"
                  value={newEmail}
                  onChange={handleNewEmailChange}
                  style={{
                    background: '#FFFFFF 0% 0% no-repeat padding-box',
                    borderRadius: '26px',
                    opacity: 1,
                    width: '500px',
                  }}
                />
              </Form.Group>
            </Col>
          </Form.Group>
          <Col>
            <Form.Group as={Row} className="formEltMargin">
              <Form.Control
                type="password"
                placeholder="Create Password"
                value={newPassword}
                onChange={handleNewPasswordChange}
                style={{
                  background: '#FFFFFF 0% 0% no-repeat padding-box',
                  borderRadius: '26px',
                  opacity: 1,
                  width: '500px',
                }}
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
                variant="primary"
                type="submit"
                onClick={handleSignUpDone}
                style={{
                  background: '#F8BE28 0% 0% no-repeat padding-box',
                  borderRadius: '20px',
                  opacity: 1,
                  width: '300px',
                }}
              >
                Sign Up
              </Button>

              <Button
                variant="primary"
                type="submit"
                onClick={hideSignUp}
                style={{
                  marginTop: '10px',
                  background: '#FF6B4A 0% 0% no-repeat padding-box',
                  borderRadius: '20px',
                  opacity: 1,
                  width: '300px',
                }}
              >
                Cancel
              </Button>
            </div>
          </Form.Group>
        </Form>

        <Box
          marginTop="1rem"
          display="flex"
          justifyContent="center"
          style={{ fontWeight: 'bold' }}
        >
          Or continue with
        </Box>

        <Box display="flex" justifyContent="center" marginTop="1rem">
          <SocialLogin />
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          marginTop="2rem"
          marginBottom="7.5rem"
          style={{ fontWeight: 'bold' }}
        >
          Already have an account?
        </Box>
      </Box>

      <Box marginTop="42%" marginLeft="-70px">
        <Button
          onClick={() => history.push('/')}
          style={{
            width: '7.5rem',
            height: '7.5rem',
            backgroundImage: `url(${LoginImage})`,
          }}
        ></Button>
      </Box>

      <Box style={{ position: 'fixed', right: '-100px', bottom: '-100px' }}>
        <img src={Ellipse} alt="Ellipse" />
      </Box>
      {/* {socialSignUpModal()} */}

      {/* <Box hidden={loggedIn === true}>
                  <Loading/>
            </Box> */}
    </Box>
  );
}
