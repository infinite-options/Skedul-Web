import { useState, useContext, useEffect, useRef } from "react";
import {
    // Box,
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
import { addView } from "./endpoints";
import ColorPicker from "./ColorPicker";

// REQUEST API:
// addView(setAllViews, {view})
// updateView(setAllViews, {newView}, oldViewID)
// deleteView(setAllViews, viewID)
// getAllViews(setAllViews, userID);

const CreateViewDialog = (props) => {
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
    const [errors, setErrors] = useState({});
    const view = {
        user_id: `${userID}`,
        view_name: `${viewName}`,
        color: `${selectedColor.hex}`,
        schedule: {
            Sunday: [{ start_time: "", end_time: "" }],
            Monday: [{ start_time: "", end_time: "" }],
            Tuesday: [{ start_time: "", end_time: "" }],
            Wednesday: [{ start_time: "", end_time: "" }],
            Thursday: [{ start_time: "", end_time: "" }],
            Friday: [{ start_time: "", end_time: "" }],
            Saturday: [{ start_time: "", end_time: "" }],
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
            errors.viewName = "Enter a View Name!";
        }

        if ((clickedCreate || choseColor) && colorNotSelected) {
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

    const handleCreate = () => {
        touchedInputs.current = { ...touchedInputs.current, create: true };
        if (Object.keys(validateData()).length) {
            return false;
        }
        props.setshowLoadingImg(true)
        addView(setAllViews, userID, view, props.setshowLoadingImg);
        return true;
    };
    useEffect(() => {
        if (props.showCreateViewDialog) {
            setSelectedColor({ idx: -1, hex: "" });
            setViewName("");
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
            <DialogTitle id="responsive-dialog-title">
                {"Create View"}
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
