import {Box} from "@mui/material";
import "../../styles/views.css";


const CreateLegend = (props) => {

    return (
        <div className="key">
            <Box className="color"
                width="44px"
                height="44px"
                style={{
                    backgroundColor: `${props.color}`
                }}
            >
            </Box>
            <p className="viewName">{props.text}</p>
        </div>
    )
}
 
export default CreateLegend;