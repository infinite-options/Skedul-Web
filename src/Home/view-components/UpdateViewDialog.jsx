import { useState, useContext, useEffect, useRef } from "react";
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
} from "@mui/material";
import { ClickAwayListener } from "@mui/material";
import { PageContext } from "./Views";
import { updateView } from "./endpoints";
import ColorPicker from "./ColorPicker";

// REQUEST API:
// addView(setAllViews, {view})
// updateView(setAllViews, {newView}, oldViewID)
// deleteView(setAllViews, viewID)
// getAllViews(setAllViews, userID);

const UpdateViewDialog = (props) => {
    const colorMap = {
        "#F5B51D": 0,
        "#F1E3C8": 1,
        "#DCEDC8": 2,
        "#F3A3BB": 3,
        "#FF867C": 4,
    };
    const userID = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("user_uid="))
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("user_uid="))
            .split("=")[1]
        : "";
    const { allViews, setAllViews } = useContext(PageContext);
    const [selectedColor, setSelectedColor] = useState({ idx: -1, hex: "" });
    const [viewName, setViewName] = useState("");
    const touchedInputs = useRef({});
    const view_unique_id = useRef("");
    const [errors, setErrors] = useState({});
    const view = {
        user_id: `${userID}`,
        view_name: `${viewName}`,
        color: `${selectedColor.hex}`,
        schedule: JSON.stringify({
            Sunday: [{ start_time: "", end_time: "" }],
            Monday: [{ start_time: "", end_time: "" }],
            Tuesday: [{ start_time: "", end_time: "" }],
            Wednesday: [{ start_time: "", end_time: "" }],
            Thursday: [{ start_time: "", end_time: "" }],
            Friday: [{ start_time: "", end_time: "" }],
            Saturday: [{ start_time: "", end_time: "" }],
        }),
    };

    const closeDialog = (bool) => {
        if (bool) {
            props.setshowUpdateViewDialog(!bool);
        }
    };

    const validateData = ({
        name = viewName,
        color = selectedColor.hex,
    } = {}) => {
        let errors = {};

        let clickedUpdate = touchedInputs.current.update;
        let touchedViewNameField = touchedInputs.current.name;
        let choseColor = touchedInputs.current.color;
        let emptyViewNameField = !Boolean(name);
        let colorNotSelected = !Boolean(color);

        if ((clickedUpdate || touchedViewNameField) && emptyViewNameField) {
            errors.viewName = "Enter a View Name!";
        }

        if ((clickedUpdate || choseColor) && colorNotSelected) {
            errors.color = "Pick a Color!";
        }

        setErrors(errors);
        return errors;
    };

    const handleViewNameChange = (value = "") => {
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

    const handleUpdate = () => {
        touchedInputs.current = { ...touchedInputs.current, update: true };
        if (Object.keys(validateData()).length) {
            return false;
        }
        console.log(view.schedule)
        updateView(setAllViews, userID, view, view_unique_id.current, "view", props.setshowLoadingImg);
        return true;
    };
    useEffect(() => {
        if (props.showUpdateViewDialog) {
            allViews.forEach((viewElement) => {
                if (viewElement.view_unique_id.includes("Selected")) {
                    view_unique_id.current = viewElement.view_unique_id
                    setViewName(viewElement.view_name);
                    setSelectedColor({ idx: colorMap[viewElement.color], hex: viewElement.color });
                }
            });
            touchedInputs.current = { name: true, color: true };
            setErrors({});
        }
    }, [props.showUpdateViewDialog]);

    return (
        <Dialog
            open={props.showUpdateViewDialog}
            onClose={() => {
                closeDialog(true);
            }}
        >
            <DialogTitle id="responsive-dialog-title">
                {"Update View"}
            </DialogTitle>

            {/* CONTENT */}
            <DialogContent style={{
                paddingTop: "6px"
            }}>
                <ClickAwayListener
                    onClickAway={() => {
                        if (touchedInputs.current.name)
                            handleViewNameChange(viewName);
                    }}
                >
                    <TextField
                        error={Boolean(errors.viewName)}
                        helperText={Boolean(errors.viewName) && errors.viewName}
                        id="outlined-basic"
                        label="View Name"
                        value={viewName}
                        variant="outlined"
                        onClick={() => {
                            touchedInputs.current = {
                                ...touchedInputs.current,
                                name: true,
                            };
                        }}
                        onChange={(e) => {
                            handleViewNameChange(e.target.value);
                        }}
                    />
                </ClickAwayListener>
                <DialogContentText style={{ margin: "20px 0" }}>
                    Pick A Color
                </DialogContentText>
                <ColorPicker
                    errorcolor={errors.color}
                    selectedColor={selectedColor}
                    setSelectedColor={setSelectedColor}
                    handleColorPickerChange={handleColorPickerChange}
                />
            </DialogContent>

            {/* ACTIONS */}
            <DialogActions>
                <Button
                    variant="outlined"
                    style={{
                        padding: "10px 30px 8px 30px",
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
                        padding: "10px 30px 8px 30px",
                    }}
                    onClick={() => {
                        closeDialog(handleUpdate());
                    }}
                >
                    Update
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdateViewDialog;
