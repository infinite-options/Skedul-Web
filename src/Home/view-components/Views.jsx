import ResizeObserver, { useResizeDetector } from 'react-resize-detector';
import { useEffect, useState, createContext } from 'react';
import { Box } from '@material-ui/core';
import { userID, getAllViews, updateView } from './endpoints';
import useStyles from 'styles/ViewsStyles';
import SelectView from './SelectView';
import AddView from './AddView';
import CreateViewDialog from './CreateViewDialog';
import Calendar from './Calendar';
import UpdateView from './UpdateView';
import { Button } from '@mui/material';

export const PageContext = createContext();

function Views() {
  const classes = useStyles();
  const [allViews, setAllViews] = useState([]);
  const [pageStatus, setPageStatus] = useState(); // Create, Update, Loading, Null
  const [showCreateViewDialog, setShowCreateViewDialog] = useState(false);
  const [data, setData] = useState();
  const { width, height, ref } = useResizeDetector();

  useEffect(() => {
    getAllViews(setAllViews, userID);
  }, []);
  console.log(data);

  return (
    <PageContext.Provider
      value={{
        allViews,
        setAllViews,
        pageStatus,
        setPageStatus,
      }}
    >
      <Box minHeight="fit-content" minWidth="fit-content" p="20px">
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
        <hr />
        <Box ref={ref} height="300px">
          <Calendar type="selected" setSlotsData={setData} />
        </Box>
        <Box m="20px 10px">
          <Button
            variant="contained"
            onClick={() => {
              setAllViews(data);
              data.forEach((view) => {
                updateView(setAllViews, userID, view, view.view_unique_id);
              });
            }}
          >
            Update
          </Button>
        </Box>
        <hr />
        <Box height="300px">
          <Calendar type="all" />
        </Box>{' '}
      </Box>
    </PageContext.Provider>
  );
}
export default Views;
