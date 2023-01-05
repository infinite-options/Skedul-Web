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
  const { allViews, setAllViews } = useContext(PageContext);
  const {
    direction = 'horizontal',
    type = 'selected',
    pixelSize = 750,
  } = props;
  const [value, setValue] = useState();

  // set start&endtime to view.schedule.parsejson
  // then edit the schedule
  // then on update, stringify it, replace the previous schedule, and send the view to updateView

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
        width:
          direction === 'horizontal'
            ? parseInt(pixelSize) + 100 + 'px'
            : '100%',
        height:
          direction === 'vertical' ? parseInt(pixelSize) + 100 + 'px' : '100%',
        pointerEvent: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: direction === 'vertical' ? '40px' : '0',
          right: direction === 'horizontal' ? '40px' : '0',
          display: 'flex',
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          flexWrap: 'nowrap',
          width: direction === 'horizontal' ? pixelSize + 'px' : '100%',
          height: direction === 'vertical' ? pixelSize + 'px' : '100%',
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
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Sunday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Monday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Tuesday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Wednesday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Thursday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Friday"
        />
        <TimeLine
          direction={direction}
          type={type}
          pixelSize={pixelSize + 'px'}
          label="Saturday"
        />
      </div>
    </div>
  );
};

export default Calendar;
