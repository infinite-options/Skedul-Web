import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Typography, Button } from '@material-ui/core';
import { Container, Row, Col, Modal } from 'react-bootstrap';
import DropDown from '../images/dropDown.svg';
import Trash from '../images/Trash.svg';
const BASE_URL = process.env.REACT_APP_SERVER_BASE_URI;

const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
    padding: '0px 20px',
  },
  openmodal: {
    backgroundColor: '#F3F3F8',
    padding: '0px 20px',
    filter: 'blur(11px)',
  },
  subTitle: {
    fontSize: '18px',
    color: '#636366',
    padding: '20px 0px',
    font: 'normal normal normal 18px/21px SF Pro Display',
  },
  title: {
    color: '#2C2C2E',
    fontSize: '18px',
    fontWeight: 'bold',
    padding: '10px 0px',
    font: 'normal normal normal 18px/21px SF Pro Display',
  },
  button: {
    border: '2px solid #2C2C2E',
    borderRadius: '3px',
    textTransform: 'none',
    color: ' #2C2C2E',
    fontSize: '18px',
    padding: '2px',
    font: 'normal normal normal 18px/21px SF Pro Display;',
  },
  colHeader: {
    fontSize: '14px',
    color: '#2C2C2E',
    padding: '10px 0px',
    font: 'normal normal normal 14px/16px SF Pro Display',
  },
  colData: {
    fontSize: '12px',
    color: '#636366',
    padding: '10px 0px',
  },
  weekDiv: {
    margin: '20px 10px',
    padding: '10px 5px',
    borderTop: '1px solid #AFAFB3',
    borderBottom: '1px solid #AFAFB3',
  },
  colDataTime: {
    border: '1px solid #2C2C2E',
    borderRadius: '2px',
  },
  colDataUnavail: {
    fontSize: '12px',
    color: '#636366',
    padding: '14px 0px',
  },
  inactiveBtn: {
    color: 'lightgray',
  },
  activeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    border: '1px solid black',
  },
  colorButton: {
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    border: 'none',
  },
});

function Views() {
  const classes = useStyles();
  const [showCreateNewViewModal, setShowCreateNewViewModal] = useState(false);
  const [allViews, setAllViews] = useState([]);
  const [allSchedule, setAllSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updated, setUpdated] = useState(false);
  const [selectedView, setSelectedView] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [viewName, setViewName] = useState('');
  const [viewColor, setViewColor] = useState('');
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [showUpdateButton, setShowUpdateButton] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [sundayFields, setSundayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [mondayFields, setMondayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [tuesdayFields, setTuesdayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [wednesdayFields, setWednesdayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [thursdayFields, setThursdayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [fridayFields, setFridayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [saturdayFields, setSaturdayFields] = useState([
    { start_time: '', end_time: '' },
  ]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [border, setBorder] = useState(false);
  var selectedUser = '';
  if (
    document.cookie
      .split(';')
      .some((item) => item.trim().startsWith('user_uid='))
  ) {
    selectedUser = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_uid='))
      .split('=')[1];
  }
  console.log('selecteduser', selectedUser);

  useEffect(() => {
    const url = BASE_URL + `GetAllViews/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setSelectedView(json.result.result[0]);
        setSelectedSchedule(JSON.parse(json.result.result[0].schedule));

        setAllViews(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url = BASE_URL + `GetSchedule/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        //console.log(json.result);
        setAllSchedule(json.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    if (allSchedule != undefined) {
      if (
        allSchedule.length !== 0 &&
        allViews.length !== 0 &&
        Object.values(selectedSchedule) !== null
      ) {
        setIsLoading(false);
      }
    }
    console.log(allViews, allSchedule, selectedView, selectedSchedule);
  }, [allViews, allSchedule, selectedView, selectedSchedule, refreshKey]);

  function getView(viewID) {
    axios
      .get(BASE_URL + `GetView/${viewID}`)
      .then((response) => {
        let schedule = JSON.parse(response.data.result.result[0].schedule);
        setSelectedView(response.data.result.result[0]);
        setSelectedSchedule(schedule);
        setUpdated(false);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function deleteView(viewID) {
    var deleteV = {
      view_id: viewID,
    };
    axios
      .post(BASE_URL + 'DeleteView', deleteV)
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const timeDisplay = () => {
    //this essentially creates the time row
    let arr = [];

    for (let i = 0; i < 24; ++i) {
      arr.push(
        i === 0
          ? '12AM'
          : i === 12
          ? i + 'PM'
          : i > 11
          ? i - 12 + 'PM'
          : i + 'AM'
      );
    }
    return (
      <div>
        <table>
          <thead>
            <tr>
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    font: 'normal normal normal 12px/14px SF Pro Display',
                  }}
                >
                  {item}
                </td>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderLeft: '1px solid #636366' }}>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {' '}
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    borderLeft: '1px solid #636366',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Sunday)
                    ),
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Monday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Tuesday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Wednesday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Thursday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Friday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
            <tr
              style={{
                borderLeft: '1px solid #636366',
                height: '2.9rem',
                marginTop: '5px',
              }}
            >
              {arr.map((item) => (
                <td
                  style={{
                    padding: '5px',
                    width: '5rem',
                    backgroundColor: getBackgroundColor(
                      item,
                      Object.values(selectedSchedule.Saturday)
                    ),
                    borderLeft: '1px solid #636366',
                  }}
                ></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const timeDisplayAll = () => {
    //this essentially creates the time row
    let arr = [];

    for (let i = 0; i < 24; ++i) {
      arr.push(
        i === 0
          ? '12AM'
          : i === 12
          ? i + 'PM'
          : i > 11
          ? i - 12 + 'PM'
          : i + 'AM'
      );
    }

    return (
      <table>
        <thead>
          <tr>
            {arr.map((item) => (
              <td style={{ padding: '5px', width: '5rem' }}>{item}</td>
            ))}
          </tr>
        </thead>
        <tbody style={{ borderLeft: '1px solid #636366' }}></tbody>
      </table>
    );
  };

  const convertTime12to24 = (time12h) => {
    let time = time12h.slice(0, -2);
    let modifier = time12h.slice(-2);

    if (time === '12') {
      time = '00';
    }

    if (modifier === 'PM') {
      time = parseInt(time, 10) + 12;
    }

    return `${time}:00`;
  };

  function range(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  }

  function getBackgroundColor(i, day) {
    let color;
    let result = [];
    //console.log(day);
    day.map((item) => {
      item.start_time.slice(0, -3) === '' || item.end_time.slice(0, -3) === ''
        ? (color = '')
        : Number(item.start_time.slice(0, -3)) <=
            Number(convertTime12to24(i).slice(0, -3)) &&
          Number(convertTime12to24(i).slice(0, -3)) <=
            Number(item.end_time.slice(0, -3))
        ? //(color = `${selectedView.color}`),
          (result = range(
            Number(item.start_time.slice(0, -3)),
            Number(item.end_time.slice(0, -3))
          ))
        : (color = '');
    });
    //console.log(result);
    for (var j = 0; j < result.length; j++)
      if (result[j] === Number(convertTime12to24(i).slice(0, -3)))
        color = `${selectedView.color}`;
    return color;
  }

  //popover open and close
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  const openCreateNewViewModal = () => {
    setShowCreateNewViewModal((prevState) => {
      return { showCreateNewViewModal: !prevState.showCreateNewViewModal };
    });
  };

  const closeCreateNewViewModal = () => {
    setShowCreateNewViewModal(false);
    setShowUpdateButton(true);
  };

  const saveViewOptions = () => {
    setShowCreateNewViewModal(false);
    setShowTimeInput(true);
    setShowUpdateButton(false);
  };

  function handleSunday(i, event) {
    const fields = [...sundayFields];
    //console.log(i);
    fields[i][event.target.name] = event.target.value;
    setSundayFields(fields);
  }
  function handleSundayUpdate(i, event) {
    const fields = [...selectedSchedule.Sunday];
    //console.log(i);
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Sunday: fields,
    });
  }

  function handleSundayAdd() {
    const fields = [...sundayFields];
    //console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    //console.log(fields);
    setSundayFields(fields);
  }

  function handleSundayRemove(i) {
    const fields = [...sundayFields];
    //console.log(fields);
    fields.splice(i, 1);
    //console.log(fields);
    setSundayFields(fields);
  }
  function handleSundayAddUpdate() {
    const fields = [...selectedSchedule.Sunday];
    //console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    //console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Sunday: fields,
    });
  }

  function handleSundayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Sunday];
    //console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Sunday: fields,
    });
  }

  function handleMonday(i, event) {
    const fields = [...mondayFields];
    fields[i][event.target.name] = event.target.value;
    setMondayFields(fields);
  }
  function handleMondayUpdate(i, event) {
    const fields = [...selectedSchedule.Monday];
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Monday: fields,
    });
  }

  function handleMondayAdd() {
    const fields = [...mondayFields];
    fields.push({ start_time: '', end_time: '' });
    setMondayFields(fields);
  }

  function handleMondayRemove(i) {
    const fields = [...mondayFields];
    fields.splice(i, 1);
    setMondayFields(fields);
  }

  function handleMondayAddUpdate() {
    const fields = [...selectedSchedule.Monday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Monday: fields,
    });
  }

  function handleMondayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Monday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Monday: fields,
    });
  }

  function handleTuesday(i, event) {
    const fields = [...tuesdayFields];
    fields[i][event.target.name] = event.target.value;
    setTuesdayFields(fields);
  }
  function handleTuesdayUpdate(i, event) {
    const fields = [...selectedSchedule.Tuesday];
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Tuesday: fields,
    });
  }

  function handleTuesdayAdd() {
    const fields = [...tuesdayFields];
    fields.push({ start_time: '', end_time: '' });
    setTuesdayFields(fields);
  }

  function handleTuesdayRemove(i) {
    const fields = [...tuesdayFields];
    fields.splice(i, 1);
    setTuesdayFields(fields);
  }

  function handleTuesdayAddUpdate() {
    const fields = [...selectedSchedule.Tuesday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Tuesday: fields,
    });
  }

  function handleTuesdayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Tuesday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Tuesday: fields,
    });
  }

  function handleWednesday(i, event) {
    const fields = [...wednesdayFields];
    fields[i][event.target.name] = event.target.value;
    setWednesdayFields(fields);
  }
  function handleWednesdayUpdate(i, event) {
    const fields = [...selectedSchedule.Wednesday];
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Wednesday: fields,
    });
  }

  function handleWednesdayAdd() {
    const fields = [...wednesdayFields];
    fields.push({ start_time: '', end_time: '' });
    setWednesdayFields(fields);
  }

  function handleWednesdayRemove(i) {
    const fields = [...wednesdayFields];
    fields.splice(i, 1);
    setWednesdayFields(fields);
  }

  function handleWednesdayAddUpdate() {
    const fields = [...selectedSchedule.Wednesday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Wednesday: fields,
    });
  }

  function handleWednesdayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Wednesday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Wednesday: fields,
    });
  }

  function handleThursday(i, event) {
    const fields = [...thursdayFields];
    fields[i][event.target.name] = event.target.value;
    setThursdayFields(fields);
  }
  function handleThursdayUpdate(i, event) {
    const fields = [...selectedSchedule.Thursday];
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Thursday: fields,
    });
  }

  function handleThursdayAdd() {
    const fields = [...thursdayFields];
    fields.push({ start_time: '', end_time: '' });
    setThursdayFields(fields);
  }

  function handleThursdayRemove(i) {
    const fields = [...thursdayFields];
    fields.splice(i, 1);
    setThursdayFields(fields);
  }

  function handleThursdayAddUpdate() {
    const fields = [...selectedSchedule.Thursday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Thursday: fields,
    });
  }

  function handleThursdayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Thursday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Thursday: fields,
    });
  }

  function handleFriday(i, event) {
    const fields = [...fridayFields];
    fields[i][event.target.name] = event.target.value;
    setFridayFields(fields);
  }
  function handleFridayUpdate(i, event) {
    const fields = [...selectedSchedule.Friday];
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Friday: fields,
    });
  }

  function handleFridayAdd() {
    const fields = [...fridayFields];
    fields.push({ start_time: '', end_time: '' });
    setFridayFields(fields);
  }
  function handleFridayRemove(i) {
    const fields = [...fridayFields];
    fields.splice(i, 1);
    setFridayFields(fields);
  }
  function handleFridayAddUpdate() {
    const fields = [...selectedSchedule.Friday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Friday: fields,
    });
  }

  function handleFridayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Friday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Friday: fields,
    });
  }
  function handleSaturday(i, event) {
    const fields = [...saturdayFields];
    fields[i][event.target.name] = event.target.value;
    setSaturdayFields(fields);
  }
  function handleSaturdayUpdate(i, event) {
    const fields = [...selectedSchedule.Saturday];
    console.log(fields);
    fields[i][event.target.name] = event.target.value;
    setSelectedSchedule({
      ...selectedSchedule,
      Saturday: fields,
    });
  }
  function handleSaturdayAdd() {
    const fields = [...fridayFields];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSaturdayFields(fields);
  }
  function handleSaturdayRemove(i) {
    const fields = [...saturdayFields];
    console.log(fields);
    fields.splice(i, 1);
    console.log(fields);
    setSaturdayFields(fields);
  }

  function handleSaturdayAddUpdate() {
    const fields = [...selectedSchedule.Saturday];
    console.log(fields);
    fields.push({ start_time: '', end_time: '' });
    console.log(fields);
    setSelectedSchedule({
      ...selectedSchedule,
      Saturday: fields,
    });
  }

  function handleSaturdayRemoveUpdate(i) {
    const fields = [...selectedSchedule.Saturday];
    console.log(fields);
    console.log(fields);
    fields.splice(i, 1);
    setSelectedSchedule({
      ...selectedSchedule,
      Saturday: fields,
    });
  }

  function createNewView() {
    var event = {
      user_id: `${selectedUser}`,
      view_name: viewName,
      color: viewColor,
      schedule: {
        Sunday: sundayFields,
        Monday: mondayFields,
        Tuesday: tuesdayFields,
        Wednesday: wednesdayFields,
        Thursday: thursdayFields,
        Friday: fridayFields,
        Saturday: saturdayFields,
      },
    };

    axios
      .post(BASE_URL + 'AddView', event)
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
        setViewName('');
        setViewColor('');
        setShowUpdateButton(true);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }

  function updateView(view) {
    var event = {
      schedule: {
        Sunday: selectedSchedule.Sunday,
        Monday: selectedSchedule.Monday,
        Tuesday: selectedSchedule.Tuesday,
        Wednesday: selectedSchedule.Wednesday,
        Thursday: selectedSchedule.Thursday,
        Friday: selectedSchedule.Friday,
        Saturday: selectedSchedule.Saturday,
      },
    };

    axios
      .post(BASE_URL + `UpdateView/${view.view_unique_id}`, event)
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.log('error', error);
      });
  }

  const createNewViewModal = () => {
    const modalStyle = {
      position: 'absolute',
      top: '30%',
    };
    const headerStyle = {
      border: 'none',
      textAlign: 'center',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2C2C2E',
    };
    const footerStyle = {
      border: 'none',
    };

    return (
      <Modal
        show={showCreateNewViewModal}
        onHide={closeCreateNewViewModal}
        style={modalStyle}
      >
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>
            <Typography
              style={{
                display: 'flex',
                justifyContent: 'center',
                font: 'normal normal bold 18px/21px SF Pro Display',
                textAlign: 'center',
              }}
            >
              New View
            </Typography>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Typography
            style={{
              font: 'normal normal bold 14px/16px SF Pro Display',
              color: '#2C2C2E',
            }}
          >
            {' '}
            View Name{' '}
          </Typography>
          <input
            style={{
              background: '#F3F3F8 0% 0% no-repeat padding-box',
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
          />
          <Typography
            style={{
              font: 'normal normal bold 14px/16px SF Pro Display',
              color: '#2C2C2E',
              paddingTop: '20px',
            }}
          >
            {' '}
            Pick a color for the view{' '}
          </Typography>
          <Row>
            <Col>
              <button
                className={border === false ? '' : classes.activeButton}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '3px',

                  background: '#F5B51D 0% 0% no-repeat padding-box',
                }}
                onClick={() => {
                  setViewColor('#F5B51D');
                  setBorder(!border);
                }}
              ></button>
            </Col>
            <Col>
              <button
                className={border === false ? '' : classes.activeButton}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '3px',
                  font: 'normal normal normal 18px/21px SF Pro Display',
                  background: '#F1E3C8 0% 0% no-repeat padding-box',
                }}
                onClick={() => {
                  setViewColor('#F1E3C8');
                  setBorder(!border);
                }}
              ></button>
            </Col>
            <Col>
              <button
                className={border === false ? '' : classes.activeButton}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '3px',
                  font: 'normal normal normal 18px/21px SF Pro Display',
                  background: '#DCEDC8 0% 0% no-repeat padding-box',
                }}
                onClick={() => {
                  setViewColor('#DCEDC8');
                  setBorder(!border);
                }}
              ></button>
            </Col>
            <Col>
              <button
                className={border === false ? '' : classes.activeButton}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '3px',

                  background: '#F3A3BB 0% 0% no-repeat padding-box',
                }}
                onClick={() => {
                  setViewColor('#F3A3BB');
                  setBorder(!border);
                }}
              ></button>
            </Col>
            <Col>
              <button
                className={border === false ? '' : classes.activeButton}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '3px',

                  background: '#FF867C 0% 0% no-repeat padding-box',
                }}
                onClick={() => {
                  setViewColor('#FF867C');
                  setBorder(!border);
                }}
              ></button>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer style={footerStyle}>
          <Container>
            <Row>
              <Col>
                <button
                  style={{
                    background: '#F3F3F8 0% 0% no-repeat padding-box',
                    marginLeft: '100px',
                    border: '2px solid #2C2C2E',
                    borderRadius: '3px',
                    color: '#2C2C2E',
                  }}
                  onClick={() => closeCreateNewViewModal()}
                >
                  Cancel
                </button>
              </Col>
              <Col>
                <button
                  style={{
                    background: '#2C2C2E 0% 0% no-repeat padding-box',
                    border: '2px solid #2C2C2E',
                    borderRadius: '3px',
                    color: '#F3F3F8',
                  }}
                  onClick={(e) => saveViewOptions()}
                >
                  Create
                </button>
              </Col>
            </Row>
          </Container>
        </Modal.Footer>
      </Modal>
    );
  };

  const viewlist = () => {
    return (
      <div>
        {allViews.map((view) => {
          return (
            <div
              style={{
                cursor: 'pointer',
                backgroundColor: `${view.color}`,
                color: '#2C2C2E',
                fontSize: '16px',
                padding: '5px',
                font: 'normal normal bold 20px/24px SF Pro Display',
              }}
              onClick={() => {
                getView(view.view_unique_id);
                handleClose();
              }}
            >
              {view.view_name}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={classes.container} id="views">
      <div className={classes.subTitle}>
        <Typography>
          Set different views for your calendar for different teams and groups
        </Typography>
      </div>
      <div className={classes.title}>VIEWS</div>
      <div>
        {allViews.length === 0 ? (
          <div>
            <Button
              className={classes.button}
              onClick={(e) => {
                openCreateNewViewModal();
              }}
            >
              + New View
            </Button>
          </div>
        ) : (
          <div>
            <Row>
              <Col xs={2}>
                <div
                  style={{
                    backgroundColor: `${selectedView.color}`,
                    color: '#2C2C2E',
                    fontSize: '16px',
                    padding: '5px',
                    height: '40px',
                    display: 'flex',
                    flexDirection: 'row',
                    cursor: 'pointer',
                    paddingTop: '10px',
                    font: 'normal normal bold 20px/24px SF Pro Display',
                  }}
                  onClick={(e) => {
                    handleClick(e);
                  }}
                >
                  <Col>{selectedView.view_name}</Col>
                  <Col xs={2}>
                    <IconButton
                      aria-describedby={id}
                      variant="contained"
                      color="primary"
                      style={{
                        padding: '0',
                      }}
                    >
                      <img src={DropDown} alt="user pic" />
                    </IconButton>
                  </Col>
                </div>
              </Col>

              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorReference="anchorPosition"
                anchorPosition={{ top: 285, left: 100 }}
                anchorOrigin={{
                  vertical: 'center',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'center',
                }}
                style={{
                  backgroundClip: 'context-box',
                  borderRadius: '20px',
                }}
              >
                {viewlist()}
              </Popover>
              <Col>
                <Button
                  className={classes.button}
                  onClick={(e) => {
                    openCreateNewViewModal();
                    setShowUpdateButton(false);
                  }}
                >
                  + New View
                </Button>
              </Col>
            </Row>
          </div>
        )}
      </div>

      <div>{showCreateNewViewModal && createNewViewModal()}</div>
      <Row className={classes.colHeader}>
        <Col>Time Zone</Col>
      </Row>
      <Row className={classes.colData}>
        <Col>Pacific Time - US & Canada</Col>
      </Row>
      {allViews.length === 0 && showTimeInput === false ? (
        <div className={classes.weekDiv}>
          <Row className={classes.colHeader}>
            <Col>
              <Row>
                <Col>Days of the Week</Col>
                <Col>Hours of the day</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="sunday"
                      //value="sunday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="sunday">Sunday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="monday"
                      //value="monday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="monday">Monday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="tuesday"
                      //value="tuesday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="tuesday">Tuesday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="wednesday"
                      //value="wednesday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="wednesday">Wednesday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="thursday"
                      //value="thursday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="thursday">Thursday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="friday"
                      //value="friday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="friday">Friday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
              <Row>
                <Col>
                  <div className={classes.colData}>
                    <input
                      type="checkbox"
                      id="saturday"
                      //value="saturday"
                      disabled
                    />
                    &nbsp;&nbsp;
                    <label htmlFor="saturday">Saturday</label>
                  </div>
                </Col>
                <Col className={classes.colData}>Unavailable</Col>
              </Row>
            </Col>
            {isLoading ? (
              <Col
                xs={7}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  //alignItems: 'flex-start',
                  overflow: 'scroll',
                }}
              >
                <h1>No Views</h1>
              </Col>
            ) : (
              <Col
                xs={8}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  //alignItems: 'flex-start',
                  overflow: 'scroll',
                }}
              >
                {timeDisplay()}
              </Col>
            )}
          </Row>
        </div>
      ) : (
        <div className={classes.weekDiv}>
          <Row className={classes.colHeader}>
            <Col>
              <Row>
                <Col>Days of the Week</Col>
                <Col> Hours of the day</Col>
              </Row>
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="sunday"
                        checked={
                          Object.values(selectedSchedule.Sunday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="sunday">Sunday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Sunday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleSundayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="sunday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleSundayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="sunday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleSundayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleSundayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="sunday">Sunday</label>
                    </div>
                  </Col>
                  <Col>
                    {sundayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(sundayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleSundayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="sunday"
                            name="start_time"
                            onChange={(e) => handleSunday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="sunday"
                            name="end_time"
                            onChange={(e) => handleSunday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleSundayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="monday"
                        checked={
                          Object.values(selectedSchedule.Monday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="monday">Monday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Monday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleMondayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="monday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleMondayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="monday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleMondayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleMondayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="monday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="monday">Monday</label>
                    </div>
                  </Col>
                  <Col>
                    {mondayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(mondayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleMondayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="monday"
                            name="start_time"
                            onChange={(e) => handleMonday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="monday"
                            name="end_time"
                            onChange={(e) => handleMonday(idx, e)}
                          />
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleMondayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="tuesday"
                        checked={
                          Object.values(selectedSchedule.Tuesday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="tuesday">Tuesday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Tuesday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleTuesdayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="tuesday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleTuesdayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="tuesday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleTuesdayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleTuesdayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="tuesday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="tuesday">Tuesday</label>
                    </div>
                  </Col>
                  <Col>
                    {tuesdayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(tuesdayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleTuesdayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="tuesday"
                            name="start_time"
                            onChange={(e) => handleTuesday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="tuesday"
                            name="end_time"
                            onChange={(e) => handleTuesday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleTuesdayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="wednesday"
                        checked={
                          Object.values(selectedSchedule.Wednesday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="wednesday">Wednesday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Wednesday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleWednesdayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="wednesday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleWednesdayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="wednesday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleWednesdayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleWednesdayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="wednesday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="wednesday">Wednesday</label>
                    </div>
                  </Col>
                  <Col>
                    {wednesdayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(wednesdayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleWednesdayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="wednesday"
                            name="start_time"
                            onChange={(e) => handleWednesday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="wednesday"
                            name="end_time"
                            onChange={(e) => handleWednesday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleWednesdayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="thursday"
                        checked={
                          Object.values(selectedSchedule.Thursday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="thursday">Thursday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Thursday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleThursdayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="thursday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleThursdayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="thursday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleThursdayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleThursdayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="thursday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="thursday">Thursday</label>
                    </div>
                  </Col>
                  <Col>
                    {thursdayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(thursdayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleThursdayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="thursday"
                            name="start_time"
                            onChange={(e) => handleThursday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="thursday"
                            name="end_time"
                            onChange={(e) => handleThursday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleThursdayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="friday"
                        checked={
                          Object.values(selectedSchedule.Friday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="friday">Friday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Friday).map(
                      (field, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleFridayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="friday"
                              name="start_time"
                              value={field.start_time}
                              onChange={(e) => handleFridayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="friday"
                              name="end_time"
                              value={field.end_time}
                              onChange={(e) => handleFridayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleFridayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="friday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="friday">Friday</label>
                    </div>
                  </Col>
                  <Col>
                    {fridayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(fridayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleFridayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="friday"
                            name="start_time"
                            onChange={(e) => handleFriday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="friday"
                            name="end_time"
                            onChange={(e) => handleFriday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleFridayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
              {showUpdateButton === true ? (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input
                        type="checkbox"
                        id="saturday"
                        checked={
                          Object.values(selectedSchedule.Saturday)[0]
                            .start_time === ''
                            ? ''
                            : 'checked'
                        }
                      />
                      &nbsp;&nbsp;
                      <label htmlFor="saturday">Saturday</label>
                    </div>
                  </Col>
                  <Col>
                    {Object.values(selectedSchedule.Saturday).map(
                      (saturday, idx) => {
                        return (
                          <div className={classes.colData}>
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleSaturdayRemoveUpdate(idx)}
                            >
                              -
                            </button>{' '}
                            &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="saturday"
                              name="start_time"
                              value={saturday.start_time || ''}
                              onChange={(e) => handleSaturdayUpdate(idx, e)}
                            />
                            &nbsp; - &nbsp;
                            <input
                              className={classes.colDataTime}
                              type="time"
                              id="saturday"
                              name="end_time"
                              value={saturday.end_time || ''}
                              onChange={(e) => handleSaturdayUpdate(idx, e)}
                            />{' '}
                            &nbsp;
                            <button
                              style={{
                                padding: '0px',
                                margin: '0px',
                                width: '20px',
                                height: '25px',
                                border: '1px solid #2C2C2E',
                                borderRadius: ' 2px',
                                backgroundColor: '#F3F3F8',
                              }}
                              onClick={() => handleSaturdayAddUpdate()}
                            >
                              +
                            </button>
                          </div>
                        );
                      }
                    )}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              ) : (
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="saturday" checked={''} />
                      &nbsp;&nbsp;
                      <label htmlFor="saturday">Saturday</label>
                    </div>
                  </Col>
                  <Col>
                    {saturdayFields.map((field, idx) => {
                      return (
                        <div className={classes.colData}>
                          {console.log(saturdayFields)}
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleSaturdayRemove(idx)}
                          >
                            -
                          </button>{' '}
                          &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="saturday"
                            name="start_time"
                            onChange={(e) => handleSaturday(idx, e)}
                          />
                          &nbsp; - &nbsp;
                          <input
                            className={classes.colDataTime}
                            type="time"
                            id="saturday"
                            name="end_time"
                            onChange={(e) => handleSaturday(idx, e)}
                          />{' '}
                          &nbsp;
                          <button
                            style={{
                              padding: '0px',
                              margin: '0px',
                              width: '20px',
                              height: '25px',
                              border: '1px solid #2C2C2E',
                              borderRadius: ' 2px',
                              backgroundColor: '#F3F3F8',
                            }}
                            onClick={() => handleSaturdayAdd()}
                          >
                            +
                          </button>
                        </div>
                      );
                    })}
                  </Col>
                  {/* <Col></Col> */}
                </Row>
              )}
            </Col>
            {isLoading ? (
              <Col
                xs={7}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  //alignItems: 'flex-start',
                  overflow: 'scroll',
                }}
              >
                <h1>No Views</h1>
              </Col>
            ) : (
              <Col
                xs={7}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  //alignItems: 'flex-start',
                  overflow: 'scroll',
                }}
              >
                {showUpdateButton === true ? timeDisplay() : <div></div>}
              </Col>
            )}
          </Row>
          {showUpdateButton === true ? (
            <Row>
              <Button
                className={
                  updated === false ? classes.button : classes.inactiveBtn
                }
                onClick={() => {
                  updateView(selectedView);
                  setUpdated(true);
                }}
              >
                Update View
              </Button>
            </Row>
          ) : (
            <Row>
              <Button
                className={classes.button}
                onClick={() => {
                  createNewView();
                }}
              >
                Create View
              </Button>
            </Row>
          )}
        </div>
      )}

      <div className={classes.title}>ALL VIEWS</div>
      {allViews.length === 0 ? (
        <div className={classes.subTitle}>No Views added</div>
      ) : (
        <div>
          <Row>
            {allViews.map((view) => {
              return (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: '0px 20px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'flex-start',
                      color: '2C2C2E',
                      fontWeight: 'bold',
                      border: 'none',
                      padding: '5px',
                      background: `${view.color} 0% 0% no-repeat padding-box`,
                      font: 'normal normal bold 20px/24px SF Pro Display',
                    }}
                  >
                    {view.view_name}&nbsp;&nbsp;
                    <div
                      style={{
                        width: '13px',
                        height: '13px',
                        padding: '5px',
                        margin: '5px 0',
                        backgroundImage: `url(${Trash})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        cursor: 'pointer',
                      }}
                      onClick={() => deleteView(view.view_unique_id)}
                    ></div>
                  </div>
                </div>
              );
            })}
          </Row>
          <div className={classes.weekDiv}>
            <Row className={classes.colHeader}>
              <Col>
                <Row>
                  <Col>Days of the Week</Col>
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="sunday" value="sunday" />
                      &nbsp;&nbsp;
                      <label htmlFor="sunday">Sunday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="monday" value="monday" />
                      &nbsp;&nbsp;
                      <label htmlFor="monday">Monday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    {' '}
                    <div className={classes.colData}>
                      <input type="checkbox" id="tuesday" value="tuesday" />
                      &nbsp;&nbsp;
                      <label htmlFor="tuesday">Tuesday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="wednesday" value="wednesday" />
                      &nbsp;&nbsp;
                      <label htmlFor="wednesday">Wednesday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="thursday" value="thursday" />
                      &nbsp;&nbsp;
                      <label htmlFor="thursday">Thursday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="friday" value="friday" />
                      &nbsp;&nbsp;
                      <label htmlFor="friday">Friday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
                <Row>
                  <Col>
                    <div className={classes.colData}>
                      <input type="checkbox" id="saturday" value="saturday" />
                      &nbsp;&nbsp;
                      <label htmlFor="saturday">Saturday</label>
                    </div>
                  </Col>
                  {/* <Col xs={10}></Col> */}
                </Row>
              </Col>
              <Col
                xs={10}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  //alignItems: 'flex-start',
                  overflow: 'scroll',
                }}
              >
                {timeDisplayAll()}
              </Col>
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}
export default Views;
