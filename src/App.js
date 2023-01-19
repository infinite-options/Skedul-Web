import React, { useState, useEffect } from "react";
import "./App.css";

import Cookies from "universal-cookie";
import LoginContext, { LoginInitState } from "./LoginContext";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

/* Importing the custom pages as each components */
import { Navigation } from "./Home/navigation";
import Nav from "../src/Nav";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import CreateMeet from "./Home/CreateMeet";

/* Main function for all the pages and elements */

export default function App() {
    const cookies = new Cookies();
    const [loginState, setLoginState] = useState(LoginInitState);
    console.log("login State");
    console.log(loginState);
    let uid = cookies.get("user_uid") == null ? "" : cookies.get("user_uid");
    let guesProfile =
        localStorage.getItem("guestProfile") == null
            ? ""
            : localStorage.getItem("guestProfile");
    const [isGuest, setIsGuest] = useState(guesProfile === "" ? false : true); // checks if user is logged in
    const [isAuth, setIsAuth] = useState(uid === "" ? false : true); // checks if user is logged in
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const login = () => {
        setIsLoggedIn(true);
    };

    const logout = () => {
        setIsLoggedIn(false);
    };
    return (
        <div class="hero-container">
            <Router>
                <Switch>
                    <LoginContext.Provider
                        value={{
                            loginState: loginState,
                            setLoginState: setLoginState,
                            isLoggedIn: isLoggedIn,
                            login: login,
                            logout: logout,
                            isGuest,
                            setIsGuest,
                            isAuth,
                            setIsAuth,
                        }}
                    >
                        <div>
                            <Navigation />
                            <Nav />
                        </div>
                    </LoginContext.Provider>
                </Switch>
            </Router>

            <Router>
                <Switch>
                    <Route exact path="/event/:eventID">
                        <CreateMeet />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}
