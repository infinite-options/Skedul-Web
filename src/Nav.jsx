import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import Login from "./Home/Login";
import SignUp from "../src/Home/SignUp";
import Event from "../src/Home/Event";
import Integration from "../src/Home/Integration";
import Help from "../src/Home/Help";
import Account from "./Home/Account";
import Views from "./Home/view-components/Views";
import EveryCircleLogin from "./Home/EveryCircleLogin";

// Nav here will take all the adress from children page to this and give
// it to the switch route

function Nav(authLevel, isAuth) {
    return (
        <Switch>
            <Route exact path="/" component={Login} />
            {/* Calendar tab was removed; its calendar now lives on Event Types */}
            <Redirect exact from="/schedule" to="/event" />
            <Route exact path="/event" component={Event} />
            <Route exact path="/views" component={Views} />
            <Route exact path="/integration" component={Integration} />
            <Route exact path="/help" component={Help} />
            <Route exact path="/account" component={Account} />
            <Route exact path="/signup" component={SignUp} />
            <Route exact path="/everycircle" component={EveryCircleLogin} />
        </Switch>
    );
}

export default Nav;
