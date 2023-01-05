import { useEffect, useState, createContext } from 'react';
import { Box } from '@material-ui/core';
import { userID, getAllViews } from './endpoints';
import useStyles from 'styles/ViewsStyles';
import SelectView from './SelectView';
import AddView from './AddView';
import CreateViewDialog from './CreateViewDialog';
import Calendar from './Calendar';
import UpdateView from './UpdateView';

export const PageContext = createContext();

function Viewss() {
  const classes = useStyles();
  const [allViews, setAllViews] = useState([]);
  const [pageStatus, setPageStatus] = useState(); // Create, Update, Loading, Null
  const [showCreateViewDialog, setShowCreateViewDialog] = useState(false);

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
          <Box display="flex" flexWrap="wrap">
            <SelectView />
            <AddView setShowCreateViewDialog={setShowCreateViewDialog} />
            <CreateViewDialog
              showCreateViewDialog={showCreateViewDialog}
              setShowCreateViewDialog={setShowCreateViewDialog}
            />
          </Box>
          <p className={classes.subTitle}>Time zone:</p>
          <p className={classes.subTitle}>Pacific Time - US Canada</p>
        </Box>

        {/* SET VIEW */}
        <Box height="300px">
          <Calendar type="selected" />
          <Calendar type="all" />
          <UpdateView />
        </Box>

        {/* ALL VIEWS */}
        <Box></Box>
      </Box>
    </PageContext.Provider>
  );
}
export default Viewss;
