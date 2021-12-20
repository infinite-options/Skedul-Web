import React from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import Login from './Home/Login';
import Schedule from '../src/Home/Schedule';
import Views from '../src/Home/Views';
import SignUp from '../src/Home/SignUp';
import Event from '../src/Home/Event';
import Integration from '../src/Home/Integration';
import Help from '../src/Home/Help';
// Nav here will take all the adress from children page to this and give
// it to the switch route

function Nav(authLevel, isAuth) {
  return (
    <Switch>
      <Route exact path="/" component={Login} />
      <Route exact path="/schedule" component={Schedule} />
      <Route exact path="/event" component={Event} />
      <Route exact path="/views" component={Views} />
      <Route exact path="/integration" component={Integration} />
      <Route exact path="/help" component={Help} />
      <Route exact path="/signup" component={SignUp} />
    </Switch>
  );
}

export default Nav;
