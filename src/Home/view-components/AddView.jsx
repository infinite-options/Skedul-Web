import { Box, Button } from '@mui/material';

const AddView = (props) => {
  return (
    <Box m="0 0 20px 10px">
      <Button
        variant="outlined"
        style={{
          padding: '10px 30px 8px 30px',
        }}
        onClick={() => {
          props.setShowCreateViewDialog(true);
        }}
      >
        + Add View
      </Button>
    </Box>
  );
};

export default AddView;
