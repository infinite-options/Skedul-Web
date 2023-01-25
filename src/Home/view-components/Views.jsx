import { useEffect, useState, createContext } from "react";
import { Box } from "@mui/material";
import { getAllViews, updateView } from "./endpoints";
import SelectView from "./SelectView";
import AddView from "./AddView";
import CreateViewDialog from "./CreateViewDialog";
import Calendar from "./Calendar";
import UpdateView from "./UpdateView";
import { Button } from "@mui/material";
import "../../styles/views.css";

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
    const [data, setData] = useState();
    console.log(userID);

    useEffect(() => {
        getAllViews(setAllViews, userID);
    }, []);
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
                        />
                        <CreateViewDialog
                            showCreateViewDialog={showCreateViewDialog}
                            setShowCreateViewDialog={setShowCreateViewDialog}
                        />
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
                        variant="contained"
                        onClick={() => {
                            setAllViews(data);
                            data.forEach((view) => {
                                updateView(
                                    setAllViews,
                                    userID,
                                    view,
                                    view.view_unique_id
                                );
                            });
                        }}
                    >
                        Update
                    </Button>
                </Box>
                <hr />
                <Box height="300px">
                    <Calendar type="all" />
                </Box>{" "}
            </Box>
        </PageContext.Provider>
    );
}
export default Views;
