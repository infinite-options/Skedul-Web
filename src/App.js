import React, { useState, useEffect } from 'react';
import './App.css';

import LoginContext, { LoginInitState } from 'LoginContext';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

/* Importing the custom pages as each components */
import { Navigation } from './Home/navigation';
import Nav from '../src/Nav';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

/* Main function for all the pages and elements */
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
function getFaviconEl() {
  return document.getElementById('favicon');
}
export default function App() {
  const [loginState, setLoginState] = useState(LoginInitState);
  console.log('login State');
  console.log(loginState);
  useEffect(
    () => console.log('curUser = ', loginState.curUser),
    [loginState.curUser]
  );
  useEffect(
    () => console.log('curUserTimeZone = ', loginState.curUserTimeZone),
    [loginState.curUserTimeZone]
  );
  useEffect(
    () => console.log('curUserEmail = ', loginState.curUserEmail),
    [loginState.curUserEmail]
  );
  console.log('base_url', BASE_URL);
  useEffect(() => {
    const favicon = getFaviconEl();
    console.log('base_url', favicon.href);
    if (BASE_URL.substring(8, 18) == '3s3sftsr90') {
      console.log('base_url', BASE_URL.substring(8, 18));
      favicon.href = 'favicon.ico';
      console.log('base_url', favicon.href);
    } else {
      console.log('base_url', BASE_URL.substring(8, 18));
      favicon.href = 'favicon-life.ico';
      console.log('base_url', favicon.href);
    }
  }, []);

  return (
    <div class="hero-container">
      <Router>
        <LoginContext.Provider
          value={{
            loginState: loginState,
            setLoginState: setLoginState,
          }}
        >
          <div>
            <Navigation />
            <Nav />
          </div>
        </LoginContext.Provider>
      </Router>
    </div>
  );
}
