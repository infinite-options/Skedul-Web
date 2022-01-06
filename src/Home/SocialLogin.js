import React, { useContext, useState } from 'react';
import GoogleLogin from 'react-google-login';
import axios from 'axios';
import { Grid, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import { Col, Container, Form, Modal, Row } from 'react-bootstrap';
//import { AuthContext } from '../auth/AuthContext';
import { withRouter } from 'react-router';
import Google from './LoginAssets/Google.svg';
import LoginContext from 'LoginContext';

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
function SocialLogin(props) {
  // const Auth = useContext(AuthContext);
  const loginContext = useContext(LoginContext);
  const history = useHistory();
  const [loggedIn, setLoggedIn] = useState(false);
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFName, setNewFName] = useState('');
  const [newLName, setNewLName] = useState('');
  const [socialId, setSocialId] = useState('');
  const [refreshToken, setrefreshToken] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [accessExpiresIn, setaccessExpiresIn] = useState('');
  const client_id = CLIENT_ID;
  const client_secret = CLIENT_SECRET;
  console.log(client_id);
  const redirect_uris = [
    'https://www.skedul',
    'https://www.skedul/schedule',
    'https://www.skedul/',
    'https://skedul',
    'http://localhost:3000',
    'http://localhost',
  ];
  const responseGoogle = (response) => {
    console.log('response', response);

    let auth_code = response.code;
    let authorization_url = 'https://accounts.google.com/o/oauth2/token';

    console.log('auth_code', auth_code);
    var details = {
      code: auth_code,
      client_id: client_id,
      client_secret: client_secret,
      //redirect_uri: 'https://manifestmy.space',
      redirect_uri: 'http://localhost:3000',
      grant_type: 'authorization_code',
    };

    var formBody = [];
    for (var property in details) {
      var encodedKey = encodeURIComponent(property);
      var encodedValue = encodeURIComponent(details[property]);
      formBody.push(encodedKey + '=' + encodedValue);
    }
    formBody = formBody.join('&');

    fetch(authorization_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
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
        let at = data['access_token'];
        let rt = data['refresh_token'];
        let ax = data['expires_in'].toString();
        setAccessToken(at);
        setrefreshToken(rt);
        setaccessExpiresIn(ax);
        console.log('res', at, rt);

        axios
          .get(
            'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=' +
              at
          )
          .then((response) => {
            console.log(response.data);

            let data = response.data;
            //setUserInfo(data);
            let e = data['email'];
            let fn = data['given_name'];
            let ln = data['family_name'];
            let si = data['id'];

            setNewEmail(e);
            setNewFName(fn);
            setNewLName(ln);
            setSocialId(si);
            axios
              .get(
                'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetEmailId/' +
                  e
              )
              .then((response) => {
                console.log(response.data);
                if (response.data.message === 'User EmailID doesnt exist') {
                  setSocialSignUpModalShow(!socialSignUpModalShow);
                } else {
                  console.log('ACCESS', accessToken);
                  document.cookie = 'user_uid=' + response.data.result;
                  document.cookie = 'user_email=' + e;
                  document.cookie = 'user_access=' + accessToken.toString();
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
                    pathname: '/schedule',
                    state: {
                      email: e.toString(),
                      accessToken: accessToken.toString(),
                    },
                  });
                }
              });
          })
          .catch((error) => {
            console.log('its in landing page');
            console.log(error);
          });

        // setSocialSignUpModalShow(!socialSignUpModalShow);

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
  };
  console.log(newEmail);

  const _socialLoginAttempt = (email, accessToken, socialId) => {
    axios
      .get(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/' +
          email
      )
      .then((res) => {
        console.log(res);
        if (res.data.result !== false) {
          document.cookie = 'user_uid=' + res.data.result[0];
          document.cookie = 'user_email=' + email;
          document.cookie = 'user_access=' + res.data.result[1];
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
          console.log('Login successful');
          console.log(email);
          history.push({
            pathname: '/schedule',
            state: {
              email: email.toString(),
              accessToken: res.data.result[1],
            },
          });
          // Successful log in, Try to update tokens, then continue to next page based on role
        } else {
          console.log('log in error');
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
    history.push('/');
    setNewFName('');
    setNewLName('');
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
      .post(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialSignUp',
        {
          email_id: newEmail,
          first_name: newFName,
          last_name: newLName,
          time_zone: '',
          google_auth_token: accessToken,
          google_refresh_token: refreshToken,
          social_id: socialId,
          access_expires_in: accessExpiresIn,
        }
      )
      .then((response) => {
        console.log(response);
        hideSignUp();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const socialSignUpModal = () => {
    return (
      <Modal
        show={socialSignUpModalShow}
        onHide={hideSignUp}
        style={{ marginTop: '70px' }}
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
            Sign Up with Social Media
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
            </Col> */}
            {/* <Col>
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
                  plaintext
                  readOnly
                  value={newEmail}
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
                onClick={handleSocialSignUpDone}
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
        <Button style={{}}>
          <GoogleLogin
            //clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            clientId={client_id}
            accessType="offline"
            prompt="consent"
            responseType="code"
            buttonText="Log In"
            //redirectUri="https://manifestmy.space"
            ux_mode="redirect"
            redirectUri="http://localhost:3000"
            scope="https://www.googleapis.com/auth/calendar"
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            isSignedIn={false}
            disable={true}
            cookiePolicy={'single_host_origin'}
            render={(renderProps) => (
              <img
                src={Google}
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                alt={''}
              ></img>
            )}
          />
        </Button>
      </Grid>

      {socialSignUpModal()}
    </Grid>
  );
}

export default withRouter(SocialLogin);
