import { useState, useContext, useEffect } from 'react';
import { Box, Popover, Button } from '@material-ui/core';
import { v4 } from 'uuid';
import { PageContext } from './Views';
import {
  userID,
  addView,
  updateView,
  deleteView,
  getAllViews,
} from './endpoints';
import useStyles from 'styles/ViewsStyles';

// REQUEST API:
// addView({view})
// updateView({newView}, oldViewID)
// deleteView(viewID)
// getAllViews(setAllViews, userID);

const SelectView = () => {
  const { allViews, setAllViews } = useContext(PageContext);
  const [anchorEl, setAnchorEl] = useState(null);

  // POPOVER OPEN/CLOSE HANDLERS
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  // POPOVER LIST + SET SELECTED FUNCTION
  const viewList = () => {
    return (
      <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
        {allViews.map((view) => {
          if (!view.view_unique_id.includes('Selected')) {
            return (
              <li>
                <Button
                  onClick={(e) => {
                    setSelected(view.view_unique_id);
                    handleClose();
                  }}
                  style={{
                    cursor: 'pointer',
                    padding: '10px 30px',
                    width: '100%',
                    borderRadius: '0',
                    backgroundColor: view.color,
                  }}
                >
                  {view.view_name}
                </Button>
              </li>
            );
          }
        })}
      </ul>
    );
  };
  const setSelected = (newViewID) => {
    setAllViews((allViews) => {
      // UNSELECT CURRENRT VIEW BY SLICEING SELECTED FROM VIEWID
      allViews.forEach((view) => {
        if (view.view_unique_id.includes('Selected')) {
          view.view_unique_id = view.view_unique_id.slice(0, -8);
        }
      });
      // SELECT NEW VIEW BY CONCATONATING SELECTED TO VIEWID
      allViews.forEach((view) => {
        if (view.view_unique_id === newViewID) {
          view.view_unique_id = view.view_unique_id.concat('Selected');
        }
      });
      return allViews;
    });
  };

  console.log(allViews);

  return (
    <Box m="20px 0">
      {allViews.length > 0 && (
        <Button
          variant="contained"
          onClick={(e) => {
            handleClick(e);
          }}
          style={{
            backgroundColor: allViews.find((view) =>
              view.view_unique_id.includes('Selected')
            ).color,
            padding: '10px 30px 8px 30px',
          }}
        >
          {
            allViews.find((view) => view.view_unique_id.includes('Selected'))
              .view_name
          }
        </Button>
      )}
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => {
          handleClose();
        }}
        PaperProps={{
          style: {
            marginTop: '10px',
          },
        }}
      >
        {viewList()}
      </Popover>
    </Box>
  );
};

export default SelectView;
