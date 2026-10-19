import React, { useState } from "react";
import axios from "axios";
import { Button, Typography } from "@mui/material";
import "../styles/integration.css";
import googleLogo from "./Google/GoogleLogo.png";
import { GOOGLE_SCOPES } from "./Google/googleScopes";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.REACT_APP_GOOGLE_CLIENT_SECRET;

function getCookie(name) {
  const row = document.cookie
    .split("; ")
    .find((r) => r.startsWith(name + "="));
  return row ? decodeURIComponent(row.split("=")[1]) : "";
}

// Exchange an authorization code for access + refresh tokens
// (same flow as GoogleSignUp.jsx).
function exchangeCode(code) {
  const details = {
    code: code,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    redirect_uri: "postmessage",
    grant_type: "authorization_code",
  };
  const formBody = Object.keys(details)
    .map((k) => encodeURIComponent(k) + "=" + encodeURIComponent(details[k]))
    .join("&");
  return fetch("https://accounts.google.com/o/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: formBody,
  }).then((response) => response.json());
}

export default function Integration() {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [working, setWorking] = useState(false);

  const userID = getCookie("user_uid");
  const userEmail = getCookie("user_email");

  async function handleTokens(code) {
    const data = await exchangeCode(code);
    if (!data.access_token) {
      throw new Error(
        "Google did not return a token (" +
          (data.error_description || data.error || "unknown error") +
          ")."
      );
    }

    // Make sure the Google account matches the Skedul account, so we don't
    // store someone else's calendar tokens on this user.
    const info = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo?alt=json&access_token=" +
        data.access_token
    );
    const googleEmail = info.data.email;
    if (
      userEmail &&
      googleEmail &&
      googleEmail.toLowerCase() !== userEmail.toLowerCase()
    ) {
      throw new Error(
        `You picked ${googleEmail}, but you are signed in to Skedul as ${userEmail}. Please choose ${userEmail}.`
      );
    }

    const payload = {
      google_auth_token: data.access_token,
      access_expires_in: String(data.expires_in),
    };
    // Google only returns a refresh token when the user sees the full consent
    // screen; only send it when we actually got one.
    if (data.refresh_token) {
      payload.google_refresh_token = data.refresh_token;
    }
    await axios.post(BASE_URL + `UpdateAccessToken/${userID}`, payload);

    if (data.refresh_token) {
      setStatus({
        type: "success",
        message: "Google Calendar reconnected.",
      });
    } else {
      setStatus({
        type: "warning",
        message:
          "Connected, but Google did not issue a long-term token, so this will stop working in about an hour. " +
          "Remove Skedul's access at myaccount.google.com/permissions, then click Reconnect again.",
      });
    }
  }

  function reconnect() {
    /* global google */
    if (!window.google || !window.google.accounts) {
      setStatus({
        type: "error",
        message: "Google sign-in has not loaded yet. Refresh and try again.",
      });
      return;
    }
    setStatus({ type: "", message: "" });
    setWorking(true);

    const codeClient = google.accounts.oauth2.initCodeClient({
      client_id: CLIENT_ID,
      scope: GOOGLE_SCOPES,
      ux_mode: "popup",
      select_account: true,
      callback: (response) => {
        if (!response || !response.code) {
          setWorking(false);
          setStatus({
            type: "error",
            message:
              "Google did not grant access" +
              (response && response.error ? ` (${response.error})` : "") +
              ".",
          });
          return;
        }
        handleTokens(response.code)
          .catch((error) => {
            console.error("Reconnect Google Calendar failed", error);
            setStatus({
              type: "error",
              message: error.message || "Something went wrong. Try again.",
            });
          })
          .finally(() => setWorking(false));
      },
      error_callback: (error) => {
        // e.g. the user closed the popup
        setWorking(false);
        setStatus({
          type: "error",
          message: "Google sign-in was closed before finishing.",
        });
        console.log(error);
      },
    });
    codeClient.requestCode();
  }

  const statusColor = {
    success: "#2e7d32",
    warning: "#b26a00",
    error: "#c62828",
  }[status.type];

  return (
    <div className={"container"} style={{ padding: "2rem" }}>
      <Typography style={{ fontSize: "24px", fontWeight: "bold" }}>
        Google Calendar
      </Typography>
      <Typography style={{ margin: "0.5rem 0 1.5rem", color: "#636366" }}>
        Skedul uses your Google Calendar to hide times you are busy and to send
        meeting invites. If bookings stop showing your busy times or invites
        stop arriving, reconnect here.
      </Typography>

      {!userID ? (
        <Typography>Please log in first.</Typography>
      ) : (
        <Button
          class="btn btn-outline-dark"
          onClick={reconnect}
          disabled={working}
          style={{ textTransform: "none", borderRadius: "50px" }}
        >
          <img
            width="20px"
            style={{ marginBottom: "3px", marginRight: "5px" }}
            alt=""
            src={googleLogo}
          />
          {working ? "Connecting…" : "Reconnect Google Calendar"}
        </Button>
      )}

      {status.message ? (
        <Typography style={{ marginTop: "1rem", color: statusColor }}>
          {status.message}
        </Typography>
      ) : null}
    </div>
  );
}
