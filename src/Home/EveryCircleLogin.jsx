import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Button, Typography } from "@mui/material";
import * as ReactBootStrap from "react-bootstrap";
import LoginContext from "../LoginContext";
const moment = require("moment-timezone");

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

/* Landing page for users coming from Every Circle: /everycircle?token=... */
export default function EveryCircleLogin() {
  const loginContext = useContext(LoginContext);
  const history = useHistory();
  const location = useLocation();
  const [error, setError] = useState("");
  const [needsSignUp, setNeedsSignUp] = useState(false);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (!token) {
      setError("Missing sign-in link. Please open Skedul from Every Circle again.");
      return;
    }

    axios
      .post(BASE_URL + "EveryCircleLogin", { token })
      .then((res) => {
        const user = res.data.result;
        if (!user) {
          setNeedsSignUp(true);
          setError(
            `No Skedul account exists for ${res.data.email || "this email"}. Please sign up first.`
          );
          return;
        }
        document.cookie = "user_uid=" + user.user_unique_id;
        document.cookie = "user_email=" + user.user_email_id;
        document.cookie = "user_access=" + (user.google_auth_token || "");
        loginContext.setLoginState({
          ...loginContext.loginState,
          loggedIn: true,
          user: {
            ...loginContext.loginState.user,
            id: user.user_unique_id,
            email: user.user_email_id,
            user_access: user.google_auth_token || "",
          },
        });
        loginContext.setIsAuth(true);

        const formData = new FormData();
        formData.append("user_unique_id", user.user_unique_id);
        formData.append("time_zone", moment.tz.guess());
        axios.put(BASE_URL + "UserDetails", formData).catch(() => {
          console.log("Error updating timezones");
        });

        history.replace({
          pathname: "/event",
          state: {
            email: user.user_email_id,
            accessToken: user.google_auth_token || "",
          },
        });
      })
      .catch((err) => {
        setError(
          err.response?.data?.message ||
            "Could not sign you in. Please open Skedul from Every Circle again."
        );
      });
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      marginTop="4rem"
    >
      {error ? (
        <>
          <Typography style={{ color: "#2C2C2E", marginBottom: "1rem" }}>
            {error}
          </Typography>
          <Button
            onClick={() => history.push(needsSignUp ? "/signup" : "/")}
            style={{
              color: "#F3F3F8",
              textTransform: "none",
              background: "#2C2C2E",
              borderRadius: "3px",
            }}
          >
            {needsSignUp ? "Sign Up" : "Go to Login"}
          </Button>
        </>
      ) : (
        <>
          <ReactBootStrap.Spinner animation="border" role="status" />
          <Typography style={{ marginTop: "1rem" }}>
            Signing you in from Every Circle...
          </Typography>
        </>
      )}
    </Box>
  );
}
