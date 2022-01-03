import React, { useState, useEffect } from 'react';
import './App.css';

import LoginContext, { LoginInitState } from 'LoginContext';

import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

/* Importing the custom pages as each components */
import { Navigation } from './Home/navigation';
import Nav from '../src/Nav';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

/* Main function for all the pages and elements */

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
