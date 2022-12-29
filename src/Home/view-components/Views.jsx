import { useEffect, useState, createContext } from 'react';
import { Box } from '@material-ui/core';
import { userID, getAllViews } from './endpoints';
import useStyles from 'styles/ViewsStyles';
import SelectView from './SelectView';
import NewView from './NewView';

export const PageContext = createContext();

function Viewss() {
  const classes = useStyles();
  const [allViews, setAllViews] = useState([]);
  const [pageStatus, setPageStatus] = useState(); // Create, Update, Loading, Null

  useEffect(() => {
    getAllViews(setAllViews, userID);
  }, []);

  return (
    <PageContext.Provider
      value={{
        allViews,
        setAllViews,
        pageStatus,
        setPageStatus,
      }}
    >
      <Box p="20px">
        {/* SELECT VIEW */}
        <Box>
          <p className={classes.subTitle}>SELECT A VIEW</p>
          <p className={classes.title}>VIEWS</p>
          <Box>
            <SelectView />
            <NewView />
          </Box>
          <p className={classes.subTitle}>Time zone:</p>
          <p className={classes.subTitle}>Pacific Time - US Canada</p>
        </Box>

        {/* SET VIEW */}
        <Box></Box>

        {/* ALL VIEWS */}
        <Box></Box>
      </Box>
    </PageContext.Provider>
  );
}
export default Viewss;
