import { useState, useContext, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  DialogContentText,
} from '@material-ui/core';
import { ClickAwayListener } from '@mui/material';
import { PageContext } from './Views';
import { userID, addView } from './endpoints';
import TimeLine from './TimeLine';

// REQUEST API:
// addView(setAllViews, {view})
// updateView(setAllViews, {newView}, oldViewID)
// deleteView(setAllViews, viewID)
// getAllViews(setAllViews, userID);

const Calendar = (props) => {
  const { direction = 'vertical' } = props;
  //dont forget to set default props for calendar view/s as an array, enable/disable fields, setStart&endtime, enable/disable Drag
  //timeline component props = name, start&endtime,numOfLines, direction, color, setStart&endtime
  //timefield component props = setStart&endtime, setNumOfLines

  // set start&endtime to view.schedule.parsejson
  // then edit the schedule
  // then on update, stringify it, replace the previous schedule, and send the view to updateView

  const { allViews } = useContext(PageContext);
  console.log(allViews);

  const dividers = [];
  for (let i = 0; i < 24; i++) {
    dividers.push(
      <div
        key={i}
        style={{
          position: 'relative',
          borderLeft: direction === 'horizontal' ? '0.5px solid #bbb' : '',
          borderTop: direction === 'vertical' ? '0.5px solid #bbb' : '',
          width: direction === 'vertical' ? '100%' : 'calc(100% / 24)',
          height: direction === 'vertical' ? 'calc(100% / 24)' : '100%',
          WebkitUserSelect: 'none',
          KhtmlUserSelect: 'none',
          MozUserSelect: 'none',
          MsUserSelect: 'none',
          userSelect: 'none',
        }}
      >
        <h6 style={{ padding: '5px', fontSize: '0.5em', color: '#bbb' }}>
          {i === 0 ? '12' : i > 12 ? `${i - 12}` : `${i}`}
          <br />
          {i === 0 ? 'AM' : i > 12 ? `PM` : `AM`}
        </h6>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: direction === 'horizontal' ? '750px' : '100%',
        height: direction === 'vertical' ? '750px' : '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          flexWrap: 'nowrap',
          width: '100%',
          height: '100%',
        }}
      >
        {dividers}
      </div>

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'row' : 'column',
          flexWrap: 'nowrap',
          bottom: '0px',
          right: '0px',
          width: direction === 'vertical' ? '87.5%' : '100%',
          height: direction === 'horizontal' ? '85%' : '100%',
        }}
      >
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
        <TimeLine direction={direction} />
      </div>
    </div>
  );
};

export default Calendar;
