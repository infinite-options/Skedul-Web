import { useEffect, useState, createContext } from "react";
import { Box } from "@mui/material";
import { getAllViews, updateView } from "./endpoints";
import SelectView from "./SelectView";
import AddView from "./AddView";
import CreateViewDialog from "./CreateViewDialog";
import Calendar from "./Calendar";
import UpdateView from "./UpdateView";
import UpdateViewDialog from "./UpdateViewDialog";
import LoadingView from "./LoadingDialog"
import { Button } from "@mui/material";
import "../../styles/views.css";
import Cookies from "js-cookie";
import Legend from "./Legend";


export const PageContext = createContext();

// Both calendars (selected + combined) use this size so they match exactly
const CALENDAR_SIZE = 750;

function Views() {
    const userID = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("user_uid="))
        ? document.cookie
            .split("; ")
            .find((row) => row.startsWith("user_uid="))
            .split("=")[1]
        : "";
    const [allViews, setAllViews] = useState([]);
    const [pageStatus, setPageStatus] = useState(); // Create, Update, Loading, Null
    const [showCreateViewDialog, setShowCreateViewDialog] = useState(false);
    const [showUpdateViewDialog, setshowUpdateViewDialog] = useState(false);
    const [showLoadingImg, setshowLoadingImg] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [updateClicked, setUpdateClicked] = useState(false);

    // Cookies.set("clicked", true); 
    console.log("Views Initial Cookies>>",Cookies.get("clicked"));

    const handleClick = () => {
        // console.log("inside handle click for Update");
        setUpdateClicked(true);
        // console.log("Views Cookies>>>", Cookies);
        // console.log("Views clicked>>>", Cookies.get("clicked"));
        Cookies.set("clicked", false); 
        // console.log("Views cookies>>>", Cookies);
        // console.log("Views clicked>>>", Cookies.get("clicked"));
        setTimeout(() => {
            setUpdateClicked(false);
        }, 1000);
      }

    const [data, setData] = useState();
    console.log(userID);

    useEffect(() => {
        getAllViews(setAllViews, userID, setshowLoadingImg);
        const handleBeforeUnload = (event) => {
            event.preventDefault();
            event.returnValue = '';
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    },[]);
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
                    <p className={"subTitle"}>SELECT A VIEW</p>
                    <p className={"title"}>VIEWS</p>
                    <Box display="flex" flexWrap="wrap">
                        <SelectView />
                        <AddView
                            setShowCreateViewDialog={setShowCreateViewDialog}
                            setshowUpdateViewDialog={setshowUpdateViewDialog}
                            userID={userID}
                            setshowLoadingImg={setshowLoadingImg}
                        />
                        <CreateViewDialog
                            showCreateViewDialog={showCreateViewDialog}
                            setShowCreateViewDialog={setShowCreateViewDialog}
                            setshowLoadingImg={setshowLoadingImg}
                        />
                        <UpdateViewDialog
                            showUpdateViewDialog={showUpdateViewDialog}
                            setshowUpdateViewDialog={setshowUpdateViewDialog}
                            setshowLoadingImg={setshowLoadingImg}
                        />
                        <LoadingView
                            showLoadingImg={showLoadingImg}
                        ></LoadingView>
                    </Box>
                    <p className={"subTitle"}>Time zone:</p>
                    <p className={"subTitle"}>Pacific Time - US Canada</p>
                </Box>
                <hr />
                {/* Selected view (editable) on the left, combined views on the right.
                    Each takes half the width and shrinks with the window (no side scroll). */}
                <Box
                    display="flex"
                    flexWrap="nowrap"
                    alignItems="flex-start"
                    gap={{ xs: "12px", md: "40px" }}
                    sx={{ "& > *": { flex: "1 1 0", minWidth: 0 } }}
                >
                <Box>
                <p class="title" style={{ textAlign: "center" }}>SELECTED VIEW</p>
                <Box>
                    <Calendar
                        direction="vertical"
                        type="selected"
                        pixelSize={CALENDAR_SIZE}
                        setSlotsData={setData}
                    />
                </Box>
                <Box m="20px 10px">

                    <Button
                        variant={updateClicked ? "contained" : "outlined"}
                        
                        onClick={() => {
                            setAllViews(data);
                            data.forEach((view) => {
                                handleClick();
                                updateView(
                                    setAllViews,
                                    userID,
                                    view,
                                    view.view_unique_id,
                                    "schedule",
                                    setshowLoadingImg
                                );
                            });

                        }}
                    >
                        {updateClicked ? "Saved" : "Save"}

                    </Button>
                </Box>
                </Box>
                <Box>
                <p class="title" style={{ textAlign: "center" }}>COMBINED VIEWS</p>
                <div id="combined">
                    <Box>
                        <Calendar
                            direction="vertical"
                            type="all"
                            pixelSize={CALENDAR_SIZE}
                        />
                    </Box>{" "}
                    <Legend />
                </div>
                </Box>
                </Box>
            </Box>
        </PageContext.Provider>
    );
}
export default Views;