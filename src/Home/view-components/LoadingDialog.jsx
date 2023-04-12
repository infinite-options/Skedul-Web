import Spinner from 'react-bootstrap/Spinner';
import {
    TextField,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
} from "@mui/material";
const LoadingView = (props) => {
    return (
        <Dialog
            open={props.showLoadingImg}
            PaperProps={{
                style: {
                    backgroundColor: "transparent",
                    boxShadow: "none",
                    overflow: "hidden"
                }
            }}

        >

            {/* CONTENT */}
            <DialogContent>
                <Spinner animation="border" role="status" >
                    <span className="visually-hidden">Loading...</span>
                </Spinner >
            </DialogContent>

            {/* ACTIONS */}
            <DialogActions>

            </DialogActions>
        </Dialog>


    );
};

export default LoadingView

