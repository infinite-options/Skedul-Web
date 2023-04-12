import React from "react";
import "../styles/login.css";
import { Box, TextField, Button, Grid } from "@mui/material";
import { useHistory } from "react-router-dom";
import { Typography } from "@mui/material";
import Google from "../images/Google1.svg";
import { GoogleLogin } from "react-google-login";
import axios from "axios";
import { useState, useContext } from "react";
import LoginContext from "../LoginContext";
import { Container, Row, Col } from "react-bootstrap";
import Apple from "../images/Apple.svg";
import Logo from "../images/Logo.svg";
import Login1 from "../images/Login1.svg";
import Login2 from "../images/Login2.svg";
import Login3 from "../images/Login3.svg";
import Login4 from "../images/Login4.svg";
import Login5 from "../images/Login5.svg";
import Login6 from "../images/Login6.svg";
import Login7 from "../images/Login7.svg";
import Login8 from "../images/Login8.svg";
import Login9 from "../images/Login9.svg";
import Login10 from "../images/Login10.svg";
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Navigation Bar component function */
export default function Login() {
    const loginContext = useContext(LoginContext);
    const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;
    console.log("in login page");
    const history = useHistory();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loggedIn, setLoggedIn] = useState();
    const [validation, setValidation] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [idToken, setIdToken] = useState("");
    const [socialId, setSocialId] = useState("");
    const [userID, setUserID] = useState("");
    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const responseGoogle = (response) => {
        console.log(response);
        if (response.profileObj) {
            let email = response.profileObj.email;
            let user_id = "";
            setSocialId(response.googleId);
            axios.get(BASE_URL + `UserToken/${email}`).then((response) => {
                console.log(
                    "in events",
                    response["data"]["user_unique_id"],
                    response["data"]["google_auth_token"]
                );
                console.log("in events", response);
                setAccessToken(response["data"]["google_auth_token"]);
                let url =
                    "https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=";
                loginContext.setLoginState({
                    ...loginContext.loginState,
                    loggedIn: true,
                    user: {
                        ...loginContext.loginState.user,
                        id: response["data"]["user_unique_id"],
                        email: response["data"]["user_email_id"],
                        user_access: response["data"]["google_auth_token"],
                    },
                });
                document.cookie =
                    "user_uid=" + response["data"]["user_unique_id"];
                document.cookie =
                    "user_email=" + response["data"]["user_email_id"];
                document.cookie =
                    "user_access=" + response["data"]["google_auth_token"];
                setUserID(response["data"]["user_unique_id"]);
                user_id = response["data"]["user_unique_id"];
                var old_at = response["data"]["google_auth_token"];
                console.log("in events", old_at);
                var refreshToken = response["data"]["google_refresh_token"];

                let checkExp_url = url + old_at;
                console.log("in events", checkExp_url);
                fetch(
                    `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${old_at}`,
                    {
                        method: "GET",
                    }
                )
                    .then((response) => {
                        console.log("in events", response);
                        if (response["status"] === 400) {
                            console.log("in events if");
                            let authorization_url =
                                "https://accounts.google.com/o/oauth2/token";

                            var details = {
                                refresh_token: refreshToken,
                                client_id: CLIENT_ID,
                                client_secret: CLIENT_SECRET,
                                grant_type: "refresh_token",
                            };

                            var formBody = [];
                            for (var property in details) {
                                var encodedKey = encodeURIComponent(property);
                                var encodedValue = encodeURIComponent(
                                    details[property]
                                );
                                formBody.push(encodedKey + "=" + encodedValue);
                            }
                            formBody = formBody.join("&");

                            fetch(authorization_url, {
                                method: "POST",
                                headers: {
                                    "Content-Type":
                                        "application/x-www-form-urlencoded;charset=UTF-8",
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
                                    let at = data["access_token"];
                                    var id_token = data["id_token"];
                                    setAccessToken(at);
                                    setIdToken(id_token);
                                    console.log("in events", at);
                                    let url =
                                        BASE_URL +
                                        `UpdateAccessToken/${user_id}`;
                                    axios
                                        .post(url, {
                                            google_auth_token: at,
                                        })
                                        .then((response) => { })
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
                            console.log(old_at);
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                    });
                console.log("in events", refreshToken, accessToken);
            });

            _socialLoginAttempt(email, accessToken, socialId, "GOOGLE");
        }
    };

    const _socialLoginAttempt = (email, at, socialId, platform) => {
        axios
            .get(BASE_URL + "UserSocialLogin/" + email)
            .then((res) => {
                console.log(res);
                if (res.data.result !== false) {
                    document.cookie = "user_uid=" + res.data.result[0];
                    document.cookie = "user_email=" + email;
                    document.cookie = "user_access=" + res.data.result[1];
                    setLoggedIn(true);
                    setAccessToken(res.data.result[1]);
                    console.log("Login socialloginattempt", at);
                    loginContext.setLoginState({
                        ...loginContext.loginState,
                        loggedIn: true,
                        user: {
                            ...loginContext.loginState.user,
                            id: res.data.result[0],
                            email: email.toString(),
                            user_access: res.data.result[1],
                        },
                    });
                    console.log("Login successful");
                    console.log(email, document.cookie);
                    history.push({
                        pathname: "/schedule",
                        state: {
                            email: email.toString(),
                            accessToken: res.data.result[1],
                        },
                    });
                    // Successful log in, Try to update tokens, then continue to next page based on role
                } else {
                    console.log("log in error");
                    history.push("/signup");
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
        console.log("event", event, email, password);
        axios
            .get(
                BASE_URL +
                "UserLogin/" +
                email.toString() +
                "," +
                password.toString()
            )
            .then((response) => {
                console.log(response.data)
                if (response.data.result !== false) {
                    document.cookie = "user_uid=" + response.data.result;
                    document.cookie = "user_email=" + email;
                    document.cookie = "user_access=" + accessToken.toString();
                    setLoggedIn(true);
                    loginContext.setLoginState({
                        ...loginContext.loginState,
                        loggedIn: true,
                        user: {
                            ...loginContext.loginState.user,
                            id: response.data.result.toString(),
                            email: email.toString(),
                            user_access: "",
                        },
                    });
                    history.push({
                        pathname: "/schedule",
                        state: {
                            email: email.toString(),
                            accessToken: "",
                        },
                    });
                } else {
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
            .split(";")
            .some((item) => item.trim().startsWith("user_uid="))
    ) {
        console.log("we are here");
        console.log(document.cookie);
        console.log(accessToken);

        history.push({
            pathname: "/schedule",
            state: {
                email: email.toString(),
                accessToken: accessToken.toString(),
            },
        });
    } else {
    }
    return (
        <div
            className="main"
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                width="100%"
                height="130px"
                backgroundColor="rgb(201, 201, 235)"
                padding="10px"
            >
                <Box
                    display="flex"
                    flexWrap="nowrap"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <TextField
                        variant="outlined"
                        label="Email"
                        size="small"
                        error={Boolean(validation)}
                        onChange={handleEmailChange}
                        sx={{ margin: "0 10px" }}
                    />
                    <TextField
                        variant="outlined"
                        label="Password"
                        size="small"
                        type="password"
                        error={Boolean(validation)}
                        onChange={handlePasswordChange}
                        sx={{ margin: "0 10px" }}
                    />
                    <Button
                        onClick={handleSubmit}
                        style={{
                            width: "75px",
                            height: "40px",
                            textAlign: "left",
                            font: "normal normal normal 18px/21px SF Pro Display",
                            letterSpacing: "0px",
                            color: "#F3F3F8",
                            textTransform: "none",
                            background: "#2C2C2E 0% 0% no-repeat padding-box",
                            borderRadius: "3px",
                            margin: "0 10px",
                        }}
                    >
                        Login
                    </Button>
                    <GoogleLogin
                        clientId={CLIENT_ID}
                        render={(renderProps) => (
                            <Button
                                style={{
                                    //borderRadius: '32px',
                                    backgroundImage: `url(${Google})`,
                                    backgroundSize: "contain",
                                    backgroundRepeat: "no-repeat",

                                    height: "52px",
                                    //background: `transparent url(${Google}) 0% 0% no-repeat padding-box`,
                                }}
                                onClick={renderProps.onClick}
                            // disabled={renderProps.disabled}
                            ></Button>
                        )}
                        buttonText="Log In"
                        onSuccess={responseGoogle}
                        onFailure={responseGoogle}
                        isSignedIn={false}
                        disable={false}
                        cookiePolicy={"single_host_origin"}
                    />
                    <Button
                        style={{
                            //borderRadius: '32px',
                            backgroundImage: `url(${Apple})`,
                            backgroundSize: "contain",
                            backgroundRepeat: "no-repeat",

                            height: "52px",
                            //background: `transparent url(${Google}) 0% 0% no-repeat padding-box`,
                        }}
                    ></Button>
                </Box>

                <Box
                    display="flex"
                    flexWrap="nowrap"
                    flexDirection="column"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    Don't have an account?
                    <Button
                        onClick={() => history.push("/signup")}
                        style={{
                            marginTop: "1rem",
                            width: "93px",
                            height: "40px",
                            textAlign: "left",
                            font: "normal normal normal 18px/21px SF Pro Display",
                            letterSpacing: "0px",
                            color: "#2C2C2E",
                            textTransform: "none",
                            border: " 2px solid #2C2C2E",
                            borderRadius: " 3px",
                        }}
                    >
                        Sign Up
                    </Button>
                </Box>
            </Box>
            <Box display="flex" flexDirection="row" alignSelf="center">
                <Typography
                    style={{
                        textAlign: "left",
                        font: "italic normal bold 32px/38px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                    }}
                >
                    Peer to peer&nbsp;
                </Typography>
                <img src={Logo} />
                <Typography
                    style={{
                        textAlign: "left",
                        font: "italic normal bold 32px/38px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                    }}
                >
                    ing made easy!
                </Typography>
            </Box>
            <Box display="flex" flexDirection="row" alignSelf="center">
                <Typography
                    style={{
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    Share available times with friends, colleagues and others
                </Typography>
            </Box>
            <Box display="flex" flexDirection="row" alignSelf="center">
                <Typography
                    style={{
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    People can easily schedule time on your calendar in the{" "}
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        View
                    </span>{" "}
                    you provide
                </Typography>
            </Box>
            <Box display="flex" flexDirection="row" alignSelf="center">
                <Typography
                    style={{
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    Keep track of your{" "}
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        SKEDUL
                    </span>
                </Typography>
            </Box>
            <br />
            <Box display="flex" flexDirection="row" alignSelf="center">
                <Typography
                    style={{
                        textAlign: "left",
                        font: "italic normal bold 32px/38px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                    }}
                >
                    How to use&nbsp;
                </Typography>
                <img src={Logo} />
            </Box>
            <Box margin="20px">
                <Box
                    position="absolute"
                    left="105px"
                    width="75vw"
                    height="50px"
                    backgroundColor="#f3a3bb"
                    zIndex="5"
                ></Box>
                <Typography
                    style={{
                        position: "relative",
                        zIndex: "10",
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    1. Create a{" "}
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        &nbsp;View&nbsp;
                    </span>
                    on your calendar
                </Typography>
                <img
                    src={Login2}
                    style={{ position: "relative", zIndex: "10" }}
                />
            </Box>
            <Box margin="20px">
                <Box
                    position="absolute"
                    left="105px"
                    width="75vw"
                    height="50px"
                    backgroundColor="#f4d484"
                    zIndex="5"
                ></Box>
                <Typography
                    style={{
                        position: "relative",
                        zIndex: "10",
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    2. Create{" "}
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        &nbsp;Event Types&nbsp;
                    </span>
                    for the view
                </Typography>
                <img
                    src={Login4}
                    style={{ position: "relative", zIndex: "10" }}
                />
            </Box>
            <Box margin="20px">
                <Box
                    position="absolute"
                    left="105px"
                    width="75vw"
                    height="50px"
                    backgroundColor="#e45c1c"
                    zIndex="5"
                ></Box>
                <Typography
                    style={{
                        position: "relative",
                        zIndex: "10",
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    3. Copy/ Paste{" "}
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        &nbsp;Event Type&nbsp;
                    </span>
                    links to share with friends, family and colleagues
                </Typography>
                <img
                    src={Login6}
                    style={{ position: "relative", zIndex: "10" }}
                />
            </Box>
            <Box margin="20px">
                <Box
                    position="absolute"
                    left="105px"
                    width="75vw"
                    height="50px"
                    backgroundColor="#74d3a3"
                    zIndex="5"
                ></Box>
                <Typography
                    style={{
                        position: "relative",
                        zIndex: "10",
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    4. Others can easily
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        &nbsp;View&nbsp;
                    </span>
                    your calendar and pick a date & time
                </Typography>
                <img
                    src={Login8}
                    style={{ position: "relative", zIndex: "10" }}
                />
            </Box>
            <Box margin="20px">
                <Box
                    position="absolute"
                    left="105px"
                    width="75vw"
                    height="50px"
                    backgroundColor="#f4e4cc"
                    zIndex="5"
                ></Box>
                <Typography
                    style={{
                        position: "relative",
                        zIndex: "10",
                        textAlign: "left",
                        font: "normal normal normal 24px/29px SF Pro Display",
                        letterSpacing: "0px",
                        color: "#2C2C2E",
                        marginTop: "1rem",
                    }}
                >
                    5. See the meetings on your
                    <span
                        style={{
                            font: "normal normal normal 24px/29px Prohibition",
                            textTransform: "uppercase",
                        }}
                    >
                        &nbsp;Skedul&nbsp;
                    </span>
                    and on your Google calendar
                </Typography>
                <img
                    src={Login10}
                    style={{ position: "relative", zIndex: "10" }}
                />{" "}
            </Box>
        </div>
    );
}
