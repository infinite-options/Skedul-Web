import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./Home/Login";
import Schedule from "../src/Home/Schedule";
import SignUp from "../src/Home/SignUp";
import Event from "../src/Home/Event";
import Integration from "../src/Home/Integration";
import Help from "../src/Home/Help";
import Account from "./Home/Account";
import Views from "./Home/view-components/Views";

// Nav here will take all the adress from children page to this and give
// it to the switch route

function Nav(authLevel, isAuth) {
  return (
    <Routes>
      <Route exact path="/" component={Login} />
      <Route exact path="/schedule" component={Schedule} />
      <Route exact path="/event" component={Event} />
      <Route exact path="/views" component={Views} />
      <Route exact path="/integration" component={Integration} />
      <Route exact path="/help" component={Help} />
      <Route exact path="/account" component={Account} />
      <Route exact path="/signup" component={SignUp} />
    </Routes>
  );
}

export default Nav;
