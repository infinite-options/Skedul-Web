import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Box, TextField, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Ellipse from './LoginAssets/Ellipse.svg';
import LoginImage from './LoginAssets/Login.svg';
import Google from './LoginAssets/Google.svg';
import SignUpImage from './LoginAssets/SignUp.svg';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import { useState, useContext } from 'react';
import LoginContext from 'LoginContext';

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
  const loginContext = useContext(LoginContext);
  const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  console.log('in login page');
  const classes = useStyles();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState();
  const [validation, setValidation] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [idToken, setIdToken] = useState('');
  const [socialId, setSocialId] = useState('');
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const responseGoogle = (response) => {
    console.log(response);
    if (response.profileObj) {
      // console.log('Google login successful');
      let email = response.profileObj.email;
      let user_id = '';
      // let accessToken = response.accessToken;
      setSocialId(response.googleId);
      axios
        .get(
          `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserToken/${email}`
        )
        .then((response) => {
          console.log('in events', response);
          let url =
            'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';
          loginContext.setLoginState({
            ...loginContext.loginState,
            user: {
              id: response['data']['user_unique_id'],
              email: response['data']['user_email_id'],
            },
          });
          user_id = response['data']['user_unique_id'];
          var old_at = response['data']['user_google_auth_token'];
          console.log('in events', old_at);
          var refreshToken = response['data']['user_google_refresh_token'];

          let checkExp_url = url + old_at;
          console.log('in events', checkExp_url);
          fetch(
            `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`,
            {
              method: 'GET',
            }
          )
            .then((response) => {
              console.log('in events', response);
              if (response['status'] === 400) {
                console.log('in events if');
                let authorization_url =
                  'https://accounts.google.com/o/oauth2/token';

                var details = {
                  refresh_token: refreshToken,
                  client_id: CLIENT_ID,
                  client_secret: CLIENT_SECRET,
                  grant_type: 'refresh_token',
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
                    'Content-Type':
                      'application/x-www-form-urlencoded;charset=UTF-8',
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
                    var id_token = data['id_token'];
                    setAccessToken(at);
                    setIdToken(id_token);
                    console.log('in events', at);
                    let url =
                      'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateAccessToken/';
                    axios
                      .post(url + user_id, {
                        user_google_auth_token: at,
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
          console.log('in events', refreshToken);
        });
      _socialLoginAttempt(email, accessToken, socialId, 'GOOGLE');
    }
  };

  const _socialLoginAttempt = (email, accessToken, socialId, platform) => {
    axios
      .get(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserSocialLogin/' +
          email
      )
      .then((res) => {
        console.log(res);
        if (res.data.result !== false) {
          document.cookie = 'user_uid=' + res.data.result;
          document.cookie = 'user_email=' + email;
          setLoggedIn(true);
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            user: {
              ...loginContext.loginState.user,
              id: res.data.result,
              email: email.toString(),
            },
          });
          console.log('Login successful');
          console.log(email);
          history.push({
            pathname: '/schedule',
            state: email.toString(),
          });
          // Successful log in, Try to update tokens, then continue to next page based on role
        } else {
          console.log('log in error');
          history.push('/signup');
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
    console.log('event', event, email, password);
    axios
      .get(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UserLogin/' +
          email.toString() +
          ',' +
          password.toString()
      )
      .then((response) => {
        if (response.data.result !== false) {
          console.log('respnse true', response.data.result);
          console.log('response', response.data);
          document.cookie = 'user_uid=' + response.data.result;
          document.cookie = 'user_email=' + email;
          setLoggedIn(true);
          console.log('response id', response.data.result, loggedIn);
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            user: {
              ...loginContext.loginState.user,
              id: response.data.result,
              email: email.toString(),
            },
          });
          history.push({
            pathname: '/schedule',
            state: email.toString(),
          });
        } else {
          console.log('respnse true', response.data.result);
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
      .split(';')
      .some((item) => item.trim().startsWith('user_uid='))
  ) {
    console.log('we are here');
    console.log(document.cookie);
    //console.log(user_uid);
    history.push('/schedule');
  } else {
  }

  return (
    <Box
      display="flex"
      style={{ width: '100%', height: '100%', backgroundColor: '#F2F7FC' }}
    >
      <Box style={{ position: 'fixed', top: '100px', left: '-100px' }}>
        <img src={Ellipse} alt="Ellipse" />
      </Box>
      <Box display="flex" marginTop="35%" marginLeft="30%">
        <Button
          onClick={() => history.push('/signup')}
          style={{
            width: '7.5rem',
            height: '7.5rem',
            backgroundImage: `url(${SignUpImage})`,
          }}
        ></Button>
      </Box>
      <Box></Box>

      <Box
        marginTop="15%"
        display="flex"
        flexDirection="column"
        style={{ width: '15rem' }}
      >
        <Box marginBottom="1rem" width="100%">
          <TextField
            className={classes.textFieldBackgorund}
            variant="outlined"
            label="Email"
            size="small"
            error={validation}
            fullWidth={true}
            onChange={handleEmailChange}
          />
        </Box>

        <Box>
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

        <Box color="red" style={{ textTransform: 'lowercase' }}>
          <Typography>{validation}</Typography>
        </Box>
        <Box justifyContent="flex-start">
          <Button style={{ textTransform: 'lowercase', fontWeight: 'bold' }}>
            Forgot Password?
          </Button>
        </Box>

        <Box
          marginTop="1rem"
          display="flex"
          justifyContent="center"
          style={{ fontWeight: 'bold' }}
        >
          Or Login With
        </Box>

        <Box display="flex" justifyContent="center" marginTop="1rem">
          <Box>
            <GoogleLogin
              clientId="1009120542229-9nq0m80rcnldegcpi716140tcrfl0vbt.apps.googleusercontent.com"
              render={(renderProps) => (
                <Button
                  style={{
                    borderRadius: '32px',
                    height: '3rem',
                    backgroundImage: `url(${Google})`,
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
              cookiePolicy={'single_host_origin'}
            />
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="center"
          marginTop="5rem"
          marginBottom="7.5rem"
          style={{ fontWeight: 'bold' }}
        >
          Don't have an account?
        </Box>
      </Box>

      <Box marginTop="14%" marginLeft="2rem">
        <Button
          onClick={handleSubmit}
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

      {/* <Box hidden={loggedIn === true}>
                  <Loading/>
            </Box> */}
    </Box>
  );
}
