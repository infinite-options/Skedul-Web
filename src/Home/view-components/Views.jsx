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
    const [clicked, setClicked] = useState(false);

    const handleClick = () => {
        setClicked(true);
        Cookies.set("clicked", true); 
        setTimeout(() => {
          setClicked(false);
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
                <Box height="300px">
                    <Calendar type="selected" setSlotsData={setData} />
                </Box>
                <Box m="20px 10px">
                    
                    <Button
                        variant={clicked ? "contained" : "outlined"}
                        
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
                        {clicked ? "Updated" : "Update"}
                        
                    </Button>
                </Box>
                <hr />
                <p class="title">COMBINED VIEWS</p>
                <div id="combined">
                    <Box height="300px">
                        <Calendar type="all" />
                    </Box>{" "}
                    <Legend />
                </div>
            </Box>
        </PageContext.Provider>
    );
}
export default Views;