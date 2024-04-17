import React, { useState, useContext, useEffect, useRef, useCallback } from "react";
import {
    Box,
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
import TimeLine from "./TimeLine";
import Cookies from "js-cookie";

// const Child = (props) => {
//     return <h3> {props.data} </h3>;
// };
 
// let conditionMet = false;

const GlobalContext = React.createContext();

// REQUEST API:
// addView(setAllViews, {view})
// updateView(setAllViews, {newView}, oldViewID)
// deleteView(setAllViews, viewID)
// getAllViews(setAllViews, userID);

const Calendar = (props) => {
    // console.log("inside calendar,,,.....")
    const userID = document.cookie
        .split(";")
        .some((item) => item.trim().startsWith("user_uid="))
        ? document.cookie
              .split("; ")
              .find((row) => row.startsWith("user_uid="))
              .split("=")[1]
        : "";
    const {
        direction = "horizontal",
        type = "all",
        pixelSize = 750,
        setSlotsData,
        // conditionMet = false,
    } = props;
    const someString = "Testing";
    const [globalValue, setGlobalValue] = useState(type === "selected");
    // console.log("Calender typeof globalValue>>",typeof(globalValue));
    // console.log("Calender globalValue>>",globalValue);
    const [data, setData] = useState();
    useEffect(() => {
        // console.log("inside use effffffffffect")
        if (type === "selected") {
            // console.log("Calendar Cookies 1>>",Cookies.get("clicked"));
            // Cookies.set("clicked",false);
            // console.log("Calendar Cookies 2>>",Cookies.get("clicked"));
            // setGlobalValue(type === "selected");
            // setGlobalValue(true);
            // console.log("Calender useEffect globalValue>>",globalValue);
            // console.log("calender type>>",type);
            // console.log("calender slots data", data)
            setSlotsData(data);
    //         conditionMet = true;
    // } else {
    //     setGlobalValue(false);
        }


    }, [data]);
    // }, [type]);
    // }, []);
    // if (type === "selected") {
    //     console.log("Calender globalValue>>",globalValue);
    //     setGlobalValue(true);
    //     console.log("Calender typeof globalValue>>",typeof(globalValue));
    //     // console.log("Calender globalValue>>",globalValue);
    // } else {
    //     setGlobalValue(false);
    //     }


    const dividers = [];
    for (let i = 0; i < 24; i++) {
        dividers.push(
            <div
                key={i}
                style={{
                    position: "relative",
                    borderLeft:
                        direction === "horizontal" ? "0.5px solid #bbb" : "",
                    borderTop:
                        direction === "vertical" ? "0.5px solid #bbb" : "",
                    width:
                        direction === "vertical" ? "100%" : "calc(100% / 24)",
                    height:
                        direction === "vertical" ? "calc(100% / 24)" : "100%",
                    WebkitUserSelect: "none",
                    KhtmlUserSelect: "none",
                    MozUserSelect: "none",
                    MsUserSelect: "none",
                    userSelect: "none",
                }}
            >
                <h6
                    style={{ padding: "5px", fontSize: "0.5em", color: "#bbb" }}
                >
                    {i === 0 ? "12" : i > 12 ? `${i - 12}` : `${i}`}
                    <br />
                    {i === 0 ? "AM" : i >= 12 ? `PM` : `AM`}
                </h6>
            </div>
        );
    }

    return (
        <GlobalContext.Provider value={globalValue}>

        <div
            style={{
                // backgroundColor:"red",
                position: "relative",
                width:
                    direction === "horizontal"
                        ? parseInt(pixelSize) + 100 + "px"
                        : "100%",
                height:
                    direction === "vertical"
                        ? parseInt(pixelSize) + 100 + "px"
                        : "100%",
                pointerEvent: "none",
            }}
        >
            <div
                style={{
                    // backgroundColor:"blue",
                    position: "absolute",
                    bottom: direction === "vertical" ? "40px" : "0",
                    right: direction === "horizontal" ? "40px" : "0",
                    display: "flex",
                    flexDirection: direction === "vertical" ? "column" : "row",
                    flexWrap: "nowrap",
                    width:
                        direction === "horizontal" ? pixelSize + "px" : "100%",
                    height:
                        direction === "vertical" ? pixelSize + "px" : "100%",
                }}
            >
                {dividers}

            </div>

            <div
                style={{
                    // backgroundColor:"green",
                    position: "absolute",
                    display: "flex",
                    flexDirection: direction === "vertical" ? "row" : "column",
                    flexWrap: "nowrap",
                    bottom: "0px",
                    right: "0px",
                    width: direction === "vertical" ? "87.5%" : "100%",
                    height: direction === "horizontal" ? "85%" : "100%",
                }}
            >
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Sunday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Monday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Tuesday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Wednesday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Thursday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Friday"
                    setSlotsData={setData}
                />
                <TimeLine
                    direction={direction}
                    type={type}
                    pixelSize={pixelSize + "px"}
                    label="Saturday"
                    setSlotsData={setData}
                />
            </div>
        </div>
        </GlobalContext.Provider>
    );
};

export default Calendar;

export { GlobalContext };