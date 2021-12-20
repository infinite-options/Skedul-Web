import React, { memo } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
  },
});
export default function Integration() {
  const classes = useStyles();
  return <div className={classes.container}>Integration</div>;
}
