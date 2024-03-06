import React, { useContext, useState, useEffect} from "react";
import { Toolbar, Button, AppBar, Box } from "@mui/material";
import "../styles/navigation.css";
import { ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material";
import { useHistory } from "react-router-dom";
import "../../node_modules/bootstrap/dist/css/bootstrap.min.css";
import Logo from "../images/Logo.svg";
import LoginContext from "../LoginContext";
import Cookies from "js-cookie";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

const headingFont = createTheme({
    typography: {
        fontFamily: ["Prohibition", "sans-serif"].join(","),
    },
});

const buttonFont = createTheme({
    typography: {
        fontFamily: ["Helvetica Neue", "sans-serif"].join(","),
    },
});

/* Navigation Bar component function */
export function Navigation() {
    console.log("CLIENT ID", typeof CLIENT_ID, CLIENT_ID);
    console.log("CLIENT_SECRET", typeof CLIENT_SECRET, CLIENT_SECRET);
    console.log("BASE_URL", typeof BASE_URL, BASE_URL);
    const history = useHistory();
    const [isActive, setActive] = useState("schedule");
    const loginContext = useContext(LoginContext);
    console.log(loginContext.loginState.user.user_access);
    var selectedUser = loginContext.loginState.user.user_uid;
    var accessT = loginContext.loginState.user.user_access;
    const handleViewsClick = (e) => {
        const clicked = Boolean(Cookies.get("clicked")); 
        
        if (isActive === "views" && !clicked) {
            const confirmed = window.confirm(
              "Not all changes have been saved. Do you want to proceed without saving your changes?"
            );
            if (!confirmed) {
                e.preventDefault();
                return; 
            }
        }
        Cookies.set("clicked", false, { expires: 5 / (24 * 60 * 60) })
        history.push("/views");
    };
      

    return (
        <>
            <AppBar
                className={"navigationBar"}
                style={{ backgroundColor: "white", position: "static" }}
            >
                <Toolbar>
                    <div className={"displayNav"}>
                        <div style={{ width: "20%", textAlign: "left" }}>
                            <Box
                                className={"titleElement"}
                                style={{ textAlign: "left" }}
                            >
                                <img
                                    src={Logo}
                                    alt="logo"
                                    onClick={() => {
                                        history.push("/schedule");
                                    }}
                                />
                            </Box>
                        </div>
                    </div>

                    {document.cookie
                        .split(";")
                        .some((item) => item.trim().startsWith("user_uid=")) ? (
                        <div style={{ width: "100%", textAlign: "right" }}>
                            <ThemeProvider theme={buttonFont}>
                                <Button
                                    className={
                                        isActive === "views"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                        
                                        history.push("/views");
                                        setActive("views");
                                    }}
                                >
                                    Views
                                </Button>
                                <Button
                                    className={
                                        isActive === "event"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                        handleViewsClick();
                                        history.push("/event")
                                        setActive("event");
                                      
                                    }}
                                >
                                    Event Types
                                </Button>
                                <Button
                                    className={
                                        isActive === "schedule"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                        handleViewsClick();
                                        history.push("/schedule");
                                        setActive("schedule");
                                    }}
                                >
                                    Calendar
                                </Button>
                                <Button
                                    className={
                                        isActive === "integration"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                        handleViewsClick();
                                        history.push("/integration");
                                        setActive("integration");
                                    }}
                                >
                                    Integration
                                </Button>
                                <Button
                                    className={
                                        isActive === "help"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                
                                        handleViewsClick();
                                        history.push("/help");
                                        setActive("help");
                                    }}
                                >
                                    Help
                                </Button>
                                <Button
                                    className={
                                        isActive === "account"
                                            ? `${"activeButtonSelection"}`
                                            : `${"buttonSelection"}`
                                    }
                                    onClick={() => {
                                        handleViewsClick();
                                        history.push("/account");
                                        setActive("account");
                                    }}
                                >
                                    Account
                                </Button>
                                <Button
                                    className={"myButton"}
                                    onClick={(e) => {
                                        handleViewsClick();
                                        history.push("/")
                                        document.cookie =
                                            "user_uid=1;max-age=0";
                                        document.cookie =
                                            "user_email=1;max-age=0";
                                        document.cookie =
                                            "user_access=1;max-age=0";
                                        loginContext.setLoginState({
                                            ...loginContext.loginState,
                                            loggedIn: false,
                                            user: {
                                                ...loginContext.loginState.ta,
                                                id: "",
                                                email: "",
                                                user_access: "",
                                            },
                                        });
                                      
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