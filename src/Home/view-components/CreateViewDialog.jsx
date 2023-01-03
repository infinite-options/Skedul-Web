import { useState, useContext, useEffect, useRef } from 'react';
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

// REQUEST API:
// addView(setAllViews, {view})
// updateView(setAllViews, {newView}, oldViewID)
// deleteView(setAllViews, viewID)
// getAllViews(setAllViews, userID);

const ColorPickerBtn = (props) => {
  const hexToRgb = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  return (
    <Box
      width="44px"
      height="44px"
      display="inline-flex"
      justifyContent="center"
      flexDirection="row"
      alignItems="center"
      m="0 10px 10px 0"
    >
      <Button
        variant="contained"
        disabled={props.selectedColor.idx === props.colorIdx}
        style={{
          minWidth: 0,
          padding: '20px 20px 20px 20px',
          border: `${props.error && '1px solid red'}`,
          backgroundColor: `rgba(${hexToRgb(props.hex).r}, ${
            hexToRgb(props.hex).g
          }, ${hexToRgb(props.hex).b}, ${
            props.selectedColor.idx === props.colorIdx ? 1 : 0.5
          })`,
          opacity: `${props.selectedColor.idx === props.colorIdx ? 1 : 0.5}`,
        }}
        onClick={() => {
          props.handleColorPickerChange(props.hex);
          props.setSelectedColor({ idx: props.colorIdx, hex: props.hex });
        }}
      ></Button>
    </Box>
  );
};

const CreateViewDialog = (props) => {
  const { allViews, setAllViews } = useContext(PageContext);
  const [selectedColor, setSelectedColor] = useState({ idx: -1, hex: '' });
  const [viewName, setViewName] = useState('');
  const touchedInputs = useRef({});
  const [errors, setErrors] = useState({});
  const view = {
    user_id: `${userID}`,
    view_name: `${viewName}`,
    color: `${selectedColor.hex}`,
    schedule: {
      Sunday: [{ start_time: '', end_time: '' }],
      Monday: [{ start_time: '', end_time: '' }],
      Tuesday: [{ start_time: '', end_time: '' }],
      Wednesday: [{ start_time: '', end_time: '' }],
      Thursday: [{ start_time: '', end_time: '' }],
      Friday: [{ start_time: '', end_time: '' }],
      Saturday: [{ start_time: '', end_time: '' }],
    },
  };

  const closeDialog = (bool) => {
    if (bool) {
      props.setShowCreateViewDialog(!bool);
    }
  };

  const validateData = ({
    name = viewName,
    color = selectedColor.hex,
  } = {}) => {
    let errors = {};

    let clickedCreate = touchedInputs.current.create;
    let touchedViewNameField = touchedInputs.current.name;
    let choseColor = touchedInputs.current.color;
    let emptyViewNameField = !Boolean(name);
    let colorNotSelected = !Boolean(color);

    if ((clickedCreate || touchedViewNameField) && emptyViewNameField) {
      errors.viewName = 'Enter a View Name!';
    }

    if ((clickedCreate || choseColor) && colorNotSelected) {
      errors.color = 'Pick a Color!';
    }

    setErrors(errors);
    return errors;
  };

  const handleViewNameChange = (value = '') => {
    touchedInputs.current = { ...touchedInputs.current, name: true };
    setViewName(() => {
      validateData({ name: value });
      return value;
    });
  };

  const handleColorPickerChange = (color) => {
    touchedInputs.current = { ...touchedInputs.current, color: true };
    validateData({ color: color });
  };

  const handleCreate = () => {
    touchedInputs.current = { ...touchedInputs.current, create: true };
    if (Object.keys(validateData()).length) {
      return false;
    }

    addView(setAllViews, userID, view);
    return true;
  };

  const ColorPicker = () => {
    return (
      <Box>
        <ColorPickerBtn
          error={Boolean(errors.color)}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleColorPickerChange={handleColorPickerChange}
          colorIdx={0}
          hex={'#F5B51D'}
        />
        <ColorPickerBtn
          error={Boolean(errors.color)}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleColorPickerChange={handleColorPickerChange}
          colorIdx={1}
          hex={'#F1E3C8'}
        />
        <ColorPickerBtn
          error={Boolean(errors.color)}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleColorPickerChange={handleColorPickerChange}
          colorIdx={2}
          hex={'#DCEDC8'}
        />
        <ColorPickerBtn
          error={Boolean(errors.color)}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleColorPickerChange={handleColorPickerChange}
          colorIdx={3}
          hex={'#F3A3BB'}
        />
        <ColorPickerBtn
          error={Boolean(errors.color)}
          selectedColor={selectedColor}
          setSelectedColor={setSelectedColor}
          handleColorPickerChange={handleColorPickerChange}
          colorIdx={4}
          hex={'#FF867C'}
        />
      </Box>
    );
  };

  useEffect(() => {
    if (props.showCreateViewDialog) {
      setSelectedColor({ idx: -1, hex: '' });
      setViewName('');
      touchedInputs.current = {};
      setErrors({});
    }
  }, [props.showCreateViewDialog]);

  return (
    <Dialog
      open={props.showCreateViewDialog}
      onClose={() => {
        closeDialog(true);
      }}
    >
      <DialogTitle id="responsive-dialog-title">{'Create View'}</DialogTitle>

      {/* CONTENT */}
      <DialogContent>
        <ClickAwayListener
          onClickAway={() => {
            if (touchedInputs.current.name) handleViewNameChange(viewName);
          }}
        >
          <TextField
            error={Boolean(errors.viewName)}
            helperText={Boolean(errors.viewName) && errors.viewName}
            id="outlined-basic"
            label="View Name"
            variant="outlined"
            onClick={() => {
              touchedInputs.current = { ...touchedInputs.current, name: true };
            }}
            onChange={(e) => {
              handleViewNameChange(e.target.value);
            }}
          />
        </ClickAwayListener>
        <DialogContentText style={{ margin: '20px 0' }}>
          Pick A Color
        </DialogContentText>
        <ColorPicker />
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions>
        <Button
          variant="outlined"
          style={{
            padding: '10px 30px 8px 30px',
          }}
          onClick={() => {
            closeDialog(true);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          style={{
            padding: '10px 30px 8px 30px',
          }}
          onClick={() => {
            closeDialog(handleCreate());
          }}
        >
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateViewDialog;
