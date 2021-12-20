import React, { memo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
  },
});
export default function Schedule() {
  const classes = useStyles();
  return <div className={classes.container}>Schedule</div>;
}
