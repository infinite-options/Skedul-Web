import React, { memo } from "react";
import { makeStyles } from "@mui/styles";

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

const useStyles = makeStyles({
  container: {
    backgroundColor: "#F3F3F8",
  },
});
export default function Integration() {
  const classes = useStyles();
  return <div className={classes.container}>Integration</div>;
}
