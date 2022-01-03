import React, { useContext, useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import Typography from '@material-ui/core/Typography';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css';
import LoginContext from '../LoginContext';

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

const headingFont = createMuiTheme({
  typography: {
    fontFamily: ['Prohibition', 'sans-serif'].join(','),
  },
});

const buttonFont = createMuiTheme({
  typography: {
    fontFamily: ['Helvetica Neue', 'sans-serif'].join(','),
  },
});

/* Custom Hook to make styles */
const useStyles = makeStyles({
  /* navigationContainer */
  navigationBar: {
    background: '#f3f3f8',
    width: '100%',
    borderBottom: '2px solid #636366',
    boxShadow: 'none',
  },

  /* displaying the navigationBar as flex Containers */
  displayNav: {
    display: 'flex',
    flex: 1,
    justifyContent: 'space-between',
  },

  /* Title of the Navigation Bar */
  titleElement: {
    flex: 1.5,
    fontSize: '32px',
    color: '#2C2C2E',
    letterSpacing: '0px',
  },

  /* Button  container for the navigation Bar */
  buttonContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
  },

  /*Logout Button*/
  myButton: {
    color: '#636366',
    '&:hover, &:focus': {
      color: '#2C2C2E',
    },
    height: '40px',
    textTransform: 'initial',
  },
  /* Navigation Buttons */
  buttonSelection: {
    color: '#636366',
    '&:hover, &:focus': {
      color: '#2C2C2E',
    },
    textTransform: 'initial',
    font: 'normal normal normal 18px/21px SF Pro Display',
  },
  activeButtonSelection: {
    color: '#2C2C2E',
    '&:hover, &:focus': {
      color: '#2C2C2E',
    },
    fontWeight: 'bold',
    textTransform: 'initial',
    font: 'normal normal bold 18px/23px Helvetica Neue',
  },
});

/* Navigation Bar component function */
export function Navigation() {
  console.log('CLIENT ID', typeof CLIENT_ID, CLIENT_ID);
  console.log('CLIENT_SECRET', typeof CLIENT_SECRET, CLIENT_SECRET);
  console.log('BASE_URL', typeof BASE_URL, BASE_URL);
  const history = useHistory();
  const classes = useStyles();
  const [isActive, setActive] = useState('schedule');
  const loginContext = useContext(LoginContext);
  console.log(loginContext.loginState.user.user_access);
  var selectedUser = loginContext.loginState.user.user_uid;
  var accessT = loginContext.loginState.user.user_access;
  

  return (
    <>
      <AppBar className={classes.navigationBar} style={{ position: 'static' }}>
        <Toolbar>
          <div className={classes.displayNav}>
            <div style={{ width: '20%', textAlign: 'left' }}>
              <Box
                className={classes.titleElement}
                style={{ textAlign: 'left' }}
              >
                <ThemeProvider theme={headingFont}>
                  <Typography
                    style={{
                      fontSize: '32px',
                      font: 'normal normal normal 32px/39px Prohibition',
                    }}
                    onClick={() => {
                      history.push('/schedule');
                    }}
                  >
                    SCHEDULER
                  </Typography>
                </ThemeProvider>
              </Box>
            </div>
          </div>

          {document.cookie
            .split(';')
            .some((item) => item.trim().startsWith('user_uid=')) ? (
            <div style={{ width: '100%', textAlign: 'right' }}>
              <ThemeProvider theme={buttonFont}>
                <Button
                  className={
                    isActive === 'views'
                      ? `${classes.activeButtonSelection}`
                      : `${classes.buttonSelection}`
                  }
                  onClick={() => {
                    history.push('/views');
                    setActive('views');
                  }}
                >
                  Views
                </Button>
                <Button
                  className={
                    isActive === 'event'
                      ? `${classes.activeButtonSelection}`
                      : `${classes.buttonSelection}`
                  }
                  onClick={() => {
                    history.push('/event');
                    setActive('event');
                  }}
                >
                  Event Types
                </Button>
                <Button
                  className={
                    isActive === 'schedule'
                      ? `${classes.activeButtonSelection}`
                      : `${classes.buttonSelection}`
                  }
                  onClick={() => {
                    history.push('/schedule');
                    setActive('schedule');
                  }}
                >
                  Schedule
                </Button>
                <Button
                  className={
                    isActive === 'integration'
                      ? `${classes.activeButtonSelection}`
                      : `${classes.buttonSelection}`
                  }
                  onClick={() => {
                    history.push('/integration');
                    setActive('integration');
                  }}
                >
                  Integration
                </Button>
                <Button
                  className={
                    isActive === 'help'
                      ? `${classes.activeButtonSelection}`
                      : `${classes.buttonSelection}`
                  }
                  onClick={() => {
                    history.push('/help');
                    setActive('help');
                  }}
                >
                  Help
                </Button>
                <Button
                  className={classes.myButton}
                  onClick={(e) => {
                    document.cookie = 'user_uid=1;max-age=0';
                    document.cookie = 'user_email=1;max-age=0';
                    document.cookie = 'user_access=1;max-age=0' ;
                    loginContext.setLoginState({
                      ...loginContext.loginState,
                      loggedIn: false,
                      user: {
                        ...loginContext.loginState.ta,
                        id: '',
                        email: '',
                        user_access:''
                      },
                    });
                    history.push('/');
                  }}
                >
                  Logout
                </Button>
              </ThemeProvider>
            </div>
          ) : null}
        </Toolbar>
      </AppBar>
    </>
  );
}
