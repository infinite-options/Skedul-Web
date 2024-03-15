import "../../styles/views.css";
import CreateLegend from "./CreateLegend";
import { useState, useEffect } from 'react';

const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

const Legend = (props) => {
    const [views, setViews] = useState([]);
    props.setUpdateClicked(false);
    var selectedUser = "";
    if (
        document.cookie
            .split(";")
            .some((item) => item.trim().startsWith("user_uid="))
    ) {
        selectedUser = document.cookie
            .split("; ")
            .find((row) => row.startsWith("user_uid="))
            .split("=")[1];
    }
    
    const url = BASE_URL + `GetAllViews/${selectedUser}`;
    useEffect(() => {
    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            setViews(json.result.result);
            console.log(views[0].color);
        })
        .catch((error) => console.log(error));
    },[props.updateClicked]);

    return (
        <div id="legend">
            {views.map((view) => {
                return <CreateLegend color={view.color} text={view.view_name} />
            })}
        </div>
    )
}
 
export default Legend;