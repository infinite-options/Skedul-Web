import React from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Box, TextField, Button } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import Ellipse from '../manifest/LoginAssets/Ellipse.svg';
import LoginImage from '../manifest/LoginAssets/Login.svg';
import Facebook from '../manifest/LoginAssets/Facebook.svg';
import Google from '../manifest/LoginAssets/Google.svg';
import Apple from '../manifest/LoginAssets/Apple.svg';
import SignUpImage from '../manifest/LoginAssets/SignUp.svg';
import Cookies from 'js-cookie';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import { GoogleLogin } from 'react-google-login';
import axios from 'axios';
import { useState, useContext } from 'react';
import LoginContext from 'LoginContext';
import { AlternateEmail } from '@material-ui/icons';

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
  console.log('in login page');
  const classes = useStyles();
  const history = useHistory();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState();
  const [validation, setValidation] = useState('');
  const [socialSignUpModalShow, setSocialSignUpModalShow] = useState(false);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const responseGoogle = (response) => {
     // console.log(response);
    if (response.profileObj) {
      // console.log('Google login successful');
      let email = response.profileObj.email;
      let accessToken = response.accessToken;
      let socialId = response.googleId;
      _socialLoginAttempt(email, accessToken, socialId, 'GOOGLE');
    }
  };

  const responseFacebook = (response) => {
    // console.log(response);
    if (response.email) {
      // console.log('Facebook login successful');
      let email = response.email;
      let accessToken = response.accessToken;
      let socialId = response.id;
      _socialLoginAttempt(email, accessToken, socialId, 'FACEBOOK');
    }
  };

  const _socialLoginAttempt = (email, accessToken, socialId, platform) => {
    axios
      .get(BASE_URL + 'loginSocialTA/' + email)
      .then((res) => {
        console.log(res);
        if (res.data.result !== false) {
          document.cookie = 'ta_uid=' + res.data.result;
          document.cookie = 'ta_email=' + email;
          document.cookie = 'patient_name=Loading';
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            ta: {
              ...loginContext.loginState.ta,
              id: res.data.result,
              email: email.toString(),
            },
            usersOfTA: [],
            curUser: '',
            curUserTimeZone: '',
            curUserEmail:'',
          });
          console.log('Login successful');
          console.log(email);
          history.push({
            pathname: '/schedule',
            state: email,
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
      .get(BASE_URL + 'loginTA/' + email.toString() + '/' + password.toString())
      .then((response) => {
        
        if (response.data.result !== false) {
          console.log('respnse true', response.data.result)
          console.log('response', response.data);
          document.cookie = 'ta_uid=' + response.data.result;
          document.cookie = 'ta_email=' + email;
          document.cookie = 'patient_name=Loading';
          setLoggedIn(true);
          console.log('response id', response.data.result, loggedIn);
          loginContext.setLoginState({
            ...loginContext.loginState,
            loggedIn: true,
            ta: {
              ...loginContext.loginState.ta,
              id: response.data.result,
              email: email.toString(),
            },
            usersOfTA: [],
            curUser: '',
            curUserTimeZone: '',
            curUserEmail: '',
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

/*   const responseGoogle = (response) => {
    console.log('response', response);
    if (response.profileObj !== null || response.profileObj !== undefined) {
      let e = response.profileObj.email;
      let at = response.accessToken;
      let rt = response.googleId;
      let first_name = response.profileObj.givenName;
      let last_name = response.profileObj.familyName;
      console.log(e, at, rt, first_name, last_name);
      axios
        .get(BASE_URL + 'loginSocialTA/' + e)
        .then((response) => {
          console.log('social login');
          console.log(response.data.result);
          if (response.data !== false) {
            document.cookie = 'ta_uid=' + response.data.result;
            document.cookie = 'ta_email=' + e;
            document.cookie = 'patient_name=Loading';
            loginContext.setLoginState({
              ...loginContext.loginState,
              loggedIn: true,
              ta: {
                ...loginContext.loginState.ta,
                id: response.data.result,
                email: email.toString(),
              },
              usersOfTA: [],
              curUser: '',
              curUserTimeZone: '',
            });
            console.log('Login successful');
            console.log(e);
            history.push({
              pathname: '/schedule',
              state: e,
            });
          } else {
            console.log('social sign up with', e);
            this.setState({
              socialSignUpModalShow: true,
              newEmail: e,
            });
            history.push({
              pathname: '/signup',
              state: '',
            });
            console.log('social sign up modal displayed');
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    }
  }; */

  if (
    document.cookie.split(';').some((item) => item.trim().startsWith('ta_uid='))
  ) {
    console.log('we are here');
    console.log(document.cookie);
    //console.log(ta_uid);
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
            <Button
              disableRipple={true}
              disableFocusRipple={true}
              disableTouchRipple={true}
              disableElevation={true}
              style={{
                borderRadius: '32px',
                height: '3rem',
                backgroundImage: `url(${Facebook})`,
              }}
            ></Button>
          </Box>
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
          <Box>
            <Button
              disableRipple={true}
              disableFocusRipple={true}
              disableTouchRipple={true}
              disableElevation={true}
              style={{
                borderRadius: '32px',
                height: '3rem',
                backgroundImage: `url(${Apple})`,
              }}
            ></Button>
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
