import { useState, useContext, useEffect, useRef } from "react";
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

const ColorPickerBtn = (props) => {
    const hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16),
            }
            : null;
    };

    return (
        <Box
            width="44px"
            height="44px"
            display="inline-flex"
            justifyContent="center"
            flexDirection="row"
            alignItems="center"
            m="0 10px 10px 0"
        >
            <Button
                variant="contained"
                disabled={props.selectedColor.idx === props.colorIdx}
                style={{
                    minWidth: 0,
                    padding: "20px 20px 20px 20px",
                    border: `${props.error && "1px solid red"}`,
                    backgroundColor: `rgba(${hexToRgb(props.hex).r}, ${hexToRgb(props.hex).g
                        }, ${hexToRgb(props.hex).b}, ${props.selectedColor.idx === props.colorIdx ? 1 : 0.5
                        })`,
                    opacity: `${props.selectedColor.idx === props.colorIdx ? 1 : 0.5
                        }`,
                }}
                onClick={() => {
                    props.handleColorPickerChange(props.hex);
                    props.setSelectedColor({
                        idx: props.colorIdx,
                        hex: props.hex,
                    });
                }}
            ></Button>
        </Box>
    );
};

const ColorPicker = (props) => {
    return (
        <Box>
            <ColorPickerBtn
                error={Boolean(props.errorcolor)}
                selectedColor={props.selectedColor}
                setSelectedColor={props.setSelectedColor}
                handleColorPickerChange={props.handleColorPickerChange}
                colorIdx={0}
                hex={"#F5B51D"}
            />
            <ColorPickerBtn
                error={Boolean(props.errorcolor)}
                selectedColor={props.selectedColor}
                setSelectedColor={props.setSelectedColor}
                handleColorPickerChange={props.handleColorPickerChange}
                colorIdx={1}
                hex={"#F1E3C8"}
            />
            <ColorPickerBtn
                error={Boolean(props.errorcolor)}
                selectedColor={props.selectedColor}
                setSelectedColor={props.setSelectedColor}
                handleColorPickerChange={props.handleColorPickerChange}
                colorIdx={2}
                hex={"#DCEDC8"}
            />
            <ColorPickerBtn
                error={Boolean(props.errorcolor)}
                selectedColor={props.selectedColor}
                setSelectedColor={props.setSelectedColor}
                handleColorPickerChange={props.handleColorPickerChange}
                colorIdx={3}
                hex={"#F3A3BB"}
            />
            <ColorPickerBtn
                error={Boolean(props.errorcolor)}
                selectedColor={props.selectedColor}
                setSelectedColor={props.setSelectedColor}
                handleColorPickerChange={props.handleColorPickerChange}
                colorIdx={4}
                hex={"#FF867C"}
            />
        </Box>
    );
};

export default ColorPicker;
