import { Box, Button } from '@mui/material';
import { useContext } from "react";
import Edit from "../../images/edit.svg";
import Trash from "../../images/Trash.svg";
import { PageContext } from "./Views";
import { deleteView } from "./endpoints";

const AddView = (props) => {
  const { allViews, setAllViews } = useContext(PageContext);

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
      <Button
        variant="outlined"
        style={{
          padding: '10px 30px 8px 30px',
          marginLeft: '10px'
        }}
        onClick={() => {
          props.setshowUpdateViewDialog(true);
        }}
      >
        Edit View
        {/* <img
          src={Edit}
          style={{
            width: "13px",
            height: "13px",
            cursor: "pointer",
            marginRight:
              "5px",
          }}
          alt="edit event"
        /> */}

      </Button>

      <Button
        variant="outlined"
        style={{
          padding: '10px 30px 8px 30px',
          marginLeft: '10px'
        }}
        onClick={() => {
          let view_unique_id = "";
          let view_name = "";
          props.setshowLoadingImg(true)
          allViews.forEach((viewElement) => {
            if (viewElement.view_unique_id.includes("Selected")) {
              view_unique_id = viewElement.view_unique_id.replace("Selected", "");
              view_name = viewElement.view_name;
            }
          });
          props.setshowLoadingImg(false)
          if (window.confirm("Are you sure You want to delete " + view_name + " View")) {
            if (view_unique_id != "")
              deleteView(setAllViews, props.userID, view_unique_id, props.setshowLoadingImg)
          }
        }}
      >
        Delete View
        {/* <img
        src={Trash}
        style={{
          width: "13px",
          height: "13px",
          cursor: "pointer",
        }}
        onClick={() => {
          props.setShowCreateViewDialog(true);
        }}
        alt="delete event"
      /> */}

      </Button>

    </Box >

  );
};

export default AddView;
