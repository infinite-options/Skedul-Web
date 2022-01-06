import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Row, Col, Modal } from 'react-bootstrap';
import { Typography } from '@material-ui/core';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Bookmark from '../images/bookmark.svg';
import Edit from '../images/edit.svg';
import Copy from '../images/copy.svg';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
    padding: '20px',
  },
  title: {
    color: '#2C2C2E',
    fontSize: '18px',
    fontWeight: 'bold',
    font: 'normal normal bold 18px/21px SF Pro Display',
  },

  colHeader: {
    fontSize: '14px',
    color: '#2C2C2E',
    padding: '10px 0px',
    font: 'normal normal bold 14px/16px SF Pro Display',
  },
});

export default function Event() {
  const classes = useStyles();
  const history = useHistory();

  const [allViews, setAllViews] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState([]);
  const [selectedEventBuffer, setSelectedEventBuffer] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [viewID, setViewID] = useState('');
  const [eventID, setEventID] = useState('');
  const [viewName, setViewName] = useState('');
  const [viewColor, setViewColor] = useState('');

  const [showCreateNewEventModal, setShowCreateNewEventModal] = useState(false);
  const [showUpdateEventModal, setShowUpdateEventModal] = useState(false);
  const [eventName, setEventName] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDuration, setEventDuration] = useState('');
  const [beforeBuffer, setBeforeBuffer] = useState(false);
  const [afterBuffer, setAfterBuffer] = useState(false);
  const [beforeBufferTime, setBeforeBufferTime] = useState('');
  const [afterBufferTime, setAfterBufferTime] = useState('');

  const [showShareModal, setShowShareModal] = useState(false);
  const [shareEmail, setShareEmail] = useState('');

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
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllViews/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setAllViews(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url = `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllEventsUser/${selectedUser}`;
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        console.log(json.result.result[0]);
        setSelectedEvent(json.result.result[0]);
        setSelectedEventBuffer(JSON.parse(json.result.result[0].buffer_time));
        setAllEvents(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    if (allEvents.length !== 0 || allViews.length !== 0) {
      setIsLoading(false);
    }
    console.log(allViews, selectedEvent, selectedEventBuffer);
  }, [allViews, allEvents, selectedEvent, selectedEventBuffer, refreshKey]);

  function getView(viewID) {
    axios
      .get(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetView/${viewID}`
      )
      .then((response) => {
        setViewName(response.data.result.result[0].view_name);
        setViewID(response.data.result.result[0].view_unique_id);
        setViewColor(response.data.result.result[0].color);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  function getEvent(eventID) {
    axios
      .get(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetEvent/${eventID}`
      )
      .then((response) => {
        setSelectedEvent(response.data.result.result[0]);
        setSelectedEventBuffer(
          JSON.parse(response.data.result.result[0].buffer_time)
        );
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const openShareModal = () => {
    setShowShareModal((prevState) => {
      return { showShareModal: !prevState.showShareModal };
    });
  };

  const closeShareModal = () => {
    setShowShareModal(false);
  };

  function shareEvent() {
    const canonical = document.querySelector('link[rel=canonical]');
    var event = {
      url: canonical ? canonical.href : document.location.href + '/' + eventID,
    };

    axios
      .post(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/sendEmail/${shareEmail}`,
        event
      )
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
        setShareEmail('');
      })
      .catch((error) => {
        console.log('error', error);
      });
    setShowShareModal(false);
  }

  const shareModal = () => {
    const modalStyle = {
      position: 'absolute',
      top: '30%',
      left: '30%',
      width: '400px',
    };
    const headerStyle = {
      border: 'none',
      //textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      textTransform: 'uppercase',
      backgroundColor: `${viewColor}`,
    };
    const footerStyle = {
      border: 'none',
      backgroundColor: `${viewColor}`,
    };
    const bodyStyle = {
      backgroundColor: `${viewColor}`,
    };

    return (
      <Modal show={showShareModal} onHide={closeShareModal}>
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>
            <Typography
              style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                font: 'normal normal normal 30px/37px Prohibition',
              }}
            >
              Share
            </Typography>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={shareEmail}
            //value={eventName}
            onChange={(e) => {
              setShareEmail(e.target.value);
            }}
          />
        </Modal.Body>
        <Modal.Footer style={footerStyle}>
          <Row>
            <Col xs={4}>
              <button
                style={{
                  backgroundColor: `${viewColor}`,
                  border: '2px solid #2C2C2E',
                  borderRadius: '3px',
                  color: '#2C2C2E',
                }}
                onClick={() => closeShareModal()}
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
                  color: `${viewColor}`,
                }}
                onClick={(e) => {
                  shareEvent();
                }}
              >
                Share Link
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  };
  const openUpdateEventModal = () => {
    setShowUpdateEventModal((prevState) => {
      return { showUpdateEventModal: !prevState.showUpdateEventModal };
    });
  };

  const closeUpdateEventModal = () => {
    setShowUpdateEventModal(false);
  };
  function updateEvent(event_id) {
    var event = {
      event_name: selectedEvent.event_name,
      duration: selectedEvent.duration,
      location: selectedEvent.location,
      buffer_time: {
        before: {
          is_enabled: selectedEventBuffer.before.is_enabled,
          time: selectedEventBuffer.before.time,
        },
        after: {
          is_enabled: selectedEventBuffer.after.is_enabled,
          time: selectedEventBuffer.after.time,
        },
      },
    };

    axios
      .post(
        `https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/UpdateEvent/${event_id}`,
        event
      )
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
      })
      .catch((error) => {
        console.log('error', error);
      });
    setShowUpdateEventModal(false);
  }

  const updateEventModal = () => {
    const modalStyle = {
      position: 'absolute',
      top: '30%',
      left: '30%',
      width: '400px',
    };
    const headerStyle = {
      border: 'none',
      //textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      textTransform: 'uppercase',
      backgroundColor: `${viewColor}`,
    };
    const footerStyle = {
      border: 'none',
      backgroundColor: `${viewColor}`,
    };
    const bodyStyle = {
      backgroundColor: `${viewColor}`,
    };
    const colHeader = {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      font: 'normal normal bold 20px/24px SF Pro Display',
    };

    const handleChangeBeforeUpdate = (chkValue) => {
      setSelectedEventBuffer({
        ...selectedEventBuffer,
        before: {
          ...selectedEventBuffer.before,
          is_enabled: chkValue.target.checked,
        },
      });
    };

    const handleChangeAfterUpdate = (chkValue) => {
      setSelectedEventBuffer({
        ...selectedEventBuffer,
        after: {
          ...selectedEventBuffer.after,
          is_enabled: chkValue.target.checked,
        },
      });
    };

    return (
      <Modal
        show={showUpdateEventModal}
        onHide={closeUpdateEventModal}
        //style={modalStyle}
      >
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>
            <Typography
              style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                font: 'normal normal normal 30px/37px Prohibition',
              }}
            >
              {viewName}
            </Typography>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <Typography style={colHeader}> Update Event Type </Typography>
          <Typography className={classes.colHeader}> Event Name </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={selectedEvent.event_name}
            //value={eventName}
            onChange={(e) => {
              setSelectedEvent({
                ...selectedEvent,
                event_name: e.target.value,
              });
            }}
          />
          <Typography className={classes.colHeader}> Location </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={selectedEvent.location}
            //value={eventLocation}
            onChange={(e) => {
              setSelectedEvent({
                ...selectedEvent,
                location: e.target.value,
              });
            }}
          />
          <Typography className={classes.colHeader}> Duration </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={selectedEvent.duration}
            //value={eventDuration}
            onChange={(e) => {
              setSelectedEvent({
                ...selectedEvent,
                duration: e.target.value,
              });
            }}
          />
          <Typography className={classes.colHeader}>
            {' '}
            Buffer time before or after events{' '}
          </Typography>
          <div>
            <input
              type="checkbox"
              id="before"
              checked={
                selectedEventBuffer.before.is_enabled !== 'False' &&
                selectedEventBuffer.before.is_enabled !== false
              }
              onChange={(event) => {
                handleChangeBeforeUpdate(event);
              }}
              style={{ border: '1px solid #000000', borderRadius: '5px' }}
            />
            &nbsp;&nbsp;
            <label htmlFor="before">Before</label>
          </div>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={selectedEventBuffer.before.time}
            onChange={(e) => {
              if (e.target.value < 0) return;
              setSelectedEventBuffer({
                ...selectedEventBuffer,
                before: {
                  ...selectedEventBuffer.before,
                  time: e.target.value,
                },
              });
            }}
          />
          <div>
            {console.log(
              selectedEventBuffer.before.time,
              selectedEventBuffer.after.time
            )}
            <input
              type="checkbox"
              checked={
                selectedEventBuffer.after.is_enabled !== 'False' &&
                selectedEventBuffer.after.is_enabled !== false
              }
              onChange={(event) => {
                handleChangeAfterUpdate(event);
              }}
              style={{ border: '1px solid #000000', borderRadius: '5px' }}
            />
            &nbsp;&nbsp;
            <label htmlFor="after">After</label>
          </div>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={selectedEventBuffer.after.time}
            onChange={(e) => {
              if (e.target.value < 0) return;
              setSelectedEventBuffer({
                ...selectedEventBuffer,
                after: {
                  ...selectedEventBuffer.after,
                  time: e.target.value,
                },
              });
            }}
          />
        </Modal.Body>
        <Modal.Footer style={footerStyle}>
          <Row>
            <Col xs={4}>
              <button
                style={{
                  backgroundColor: `${viewColor}`,
                  border: '2px solid #2C2C2E',
                  borderRadius: '3px',
                  color: '#2C2C2E',
                }}
                onClick={() => closeUpdateEventModal()}
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
                  color: `${viewColor}`,
                }}
                onClick={(e) => updateEvent(eventID)}
              >
                Update Event Type
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  };

  const openCreateNewEventModal = () => {
    setShowCreateNewEventModal((prevState) => {
      return { showCreateNewEventModal: !prevState.showCreateNewEventModal };
    });
  };

  const closeCreateNewEventModal = () => {
    setShowCreateNewEventModal(false);
  };

  function createNewEvent(viewID) {
    let bt = '';
    let at = '';
    let d = '';
    const numHoursBT =
      beforeBufferTime >= 60 ? Math.floor(beforeBufferTime / 60) : '00';
    let numMinsBT = beforeBufferTime % 60;
    if (numMinsBT < 10) numMinsBT = '0' + numMinsBT;
    bt = `${numHoursBT}:${numMinsBT}:00`;

    const numHoursAT =
      afterBufferTime >= 60 ? Math.floor(afterBufferTime / 60) : '00';
    let numMinsAT = afterBufferTime % 60;
    if (numMinsAT < 10) numMinsAT = '0' + numMinsAT;
    at = `${numHoursAT}:${numMinsAT}:00`;

    const numHoursD =
      eventDuration >= 60 ? Math.floor(eventDuration / 60) : '00';
    let numMinsD = eventDuration % 60;
    if (numMinsD < 10) numMinsD = '0' + numMinsD;
    d = `${numHoursD}:${numMinsD}:00`;

    var event = {
      user_id: `${selectedUser}`,
      view_id: viewID,
      event_name: eventName,
      duration: d,
      location: eventLocation,
      buffer_time: {
        before: {
          is_enabled: beforeBuffer,
          time: bt,
        },
        after: {
          is_enabled: afterBuffer,
          time: at,
        },
      },
    };

    axios
      .post(
        'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/AddEvent',
        event
      )
      .then((response) => {
        setRefreshKey((oldKey) => oldKey + 1);
        setEventName('');
        setEventDuration('');
        setEventLocation('');
        setAfterBuffer('');
        setAfterBufferTime('');
        setBeforeBuffer('');
        setBeforeBufferTime('');
      })
      .catch((error) => {
        console.log('error', error);
      });
    setShowCreateNewEventModal(false);
  }
  const createNewEventModal = () => {
    const modalStyle = {
      position: 'absolute',
      top: '30%',
      left: '30%',
      width: '400px',
      height: '100%',
    };
    const headerStyle = {
      border: 'none',
      //textAlign: 'center',
      display: 'flex',
      alignItems: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      textTransform: 'uppercase',
      backgroundColor: `${viewColor}`,
    };
    const footerStyle = {
      border: 'none',
      backgroundColor: `${viewColor}`,
    };
    const bodyStyle = {
      backgroundColor: `${viewColor}`,
    };
    const colHeader = {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#2C2C2E',
      font: 'normal normal bold 20px/24px SF Pro Display',
    };

    const handleChangeBeforeCreate = (chkValue) => {
      setBeforeBuffer(chkValue.target.checked);
    };

    const handleChangeAfterCreate = (chkValue) => {
      setAfterBuffer(chkValue.target.checked);
    };

    return (
      <Modal
        show={showCreateNewEventModal}
        onHide={closeCreateNewEventModal}
        style={modalStyle}
        backdropClassName="modal-backdrop foo-modal-backdrop in"
      >
        <Modal.Header style={headerStyle} closeButton>
          <Modal.Title>
            <Typography
              style={{
                display: 'flex',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold',
                textAlign: 'center',
                font: 'normal normal normal 30px/37px Prohibition',
              }}
            >
              {viewName}
            </Typography>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body style={bodyStyle}>
          <Typography style={colHeader}> Create New Event Type </Typography>
          <Typography className={classes.colHeader}> Event Name </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
          />
          <Typography className={classes.colHeader}> Location </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
          />
          <Typography className={classes.colHeader}> Duration </Typography>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={eventDuration}
            onChange={(e) => setEventDuration(e.target.value)}
          />
          <Typography className={classes.colHeader}>
            {' '}
            Buffer time before or after events{' '}
          </Typography>
          <div>
            <input
              type="checkbox"
              id="before"
              checked={beforeBuffer}
              onChange={(event) => {
                handleChangeBeforeCreate(event);
              }}
              style={{ border: '1px solid #000000', borderRadius: '5px' }}
            />
            &nbsp;&nbsp;
            <label htmlFor="before">Before</label>
          </div>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={beforeBufferTime}
            onChange={(e) => setBeforeBufferTime(e.target.value)}
          />
          <div>
            <input
              type="checkbox"
              id="after"
              checked={afterBuffer}
              onChange={(event) => {
                handleChangeAfterCreate(event);
              }}
              style={{ border: '1px solid #000000', borderRadius: '5px' }}
            />
            &nbsp;&nbsp;
            <label htmlFor="after">After</label>
          </div>
          <input
            style={{
              width: '345px',
              backgroundColor: `${viewColor}`,
              border: '2px solid #636366',
              borderRadius: '3px',
            }}
            value={afterBufferTime}
            onChange={(e) => setAfterBufferTime(e.target.value)}
          />
        </Modal.Body>
        <Modal.Footer style={footerStyle}>
          <Row>
            <Col xs={4}>
              <button
                style={{
                  backgroundColor: `${viewColor}`,
                  border: '2px solid #2C2C2E',
                  borderRadius: '3px',
                  color: '#2C2C2E',
                }}
                onClick={() => closeCreateNewEventModal()}
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
                  color: `${viewColor}`,
                }}
                onClick={(e) => createNewEvent(viewID)}
              >
                Create Event Type
              </button>
            </Col>
          </Row>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div className={classes.container}>
      <Row className={classes.title}>
        <Col xs={2}>ALL VIEWS</Col>
        <Col>ALL EVENT TYPES</Col>
      </Row>

      {allViews.map((view) => {
        return (
          <Row>
            <Col xs={2}>
              <div>
                <div
                  style={{
                    marginTop: '20px',
                    width: '213px',
                    height: '82px',
                    textTransform: 'uppercase',
                    backgroundColor: `${view.color}`,
                    textAlign: 'center',
                    fontSize: '20px',
                    font: 'normal normal normal 20px/25px Prohibition',
                    padding: '10px',
                  }}
                >
                  {view.view_name}
                </div>
                {/* <div>{Object.values(view.schedule)}</div> */}
                <button
                  style={{
                    marginTop: '5px',
                    width: '213px',
                    height: '50px',
                    textTransform: 'uppercase',
                    backgroundColor: `${view.color}`,
                    textAlign: 'center',
                    border: 'none',
                    font: 'normal normal normal 24px/30px Prohibition',
                  }}
                  onClick={(e) => {
                    getView(view.view_unique_id);
                    openCreateNewEventModal();
                  }}
                >
                  + NEW EVENT TYPE
                </button>
              </div>
            </Col>
            <div>{showCreateNewEventModal && createNewEventModal()}</div>
            <div>{showUpdateEventModal && updateEventModal()}</div>
            <div>{showShareModal && shareModal()}</div>
            <Col
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'flex-start',
              }}
            >
              {allEvents.map((event) => {
                return (
                  <div>
                    {event.view_id === view.view_unique_id ? (
                      <div>
                        <div
                          style={{
                            marginTop: '20px',
                            marginLeft: '10px',
                            width: '213px',
                            //height: '148px',
                            backgroundColor: `${view.color}`,
                            padding: '0px 10px',
                          }}
                        >
                          <Row>
                            <Col style={{ paddingLeft: '7px' }}>
                              <Typography
                                style={{
                                  textTransform: 'uppercase',
                                  fontSize: '24px',
                                  color: '#2C2C2E',
                                  padding: '0',
                                  font: 'normal normal normal 24px/30px Prohibition',
                                }}
                              >
                                {event.event_name}
                              </Typography>
                            </Col>
                            <Col xs={2}>
                              <img src={Bookmark} alt="bookmark" />
                            </Col>
                          </Row>
                          <div
                            style={{
                              fontSize: '14px',
                              fontWeight: 'normal',
                              font: 'normal normal normal 14px/16px SF Pro Display',
                            }}
                          >
                            <div>
                              {Number(event.duration.substring(0, 1)) > 1
                                ? event.duration.substring(2, 4) !== '59'
                                  ? Number(event.duration.substring(0, 1)) +
                                    ' hrs ' +
                                    Number(event.duration.substring(2, 4)) +
                                    ' min'
                                  : Number(event.duration.substring(0, 1)) +
                                    1 +
                                    ' hrs'
                                : Number(event.duration.substring(0, 1)) == 1
                                ? '60 min'
                                : event.duration.substring(2, 4) + ' min'}
                            </div>
                            <div>
                              Location:{' '}
                              {event.location === ''
                                ? 'None Specified'
                                : event.location}
                            </div>
                            <div>
                              -
                              {JSON.parse(
                                event.buffer_time
                              ).before.time.substring(3, 5)}{' '}
                              / +
                              {JSON.parse(
                                event.buffer_time
                              ).after.time.substring(3, 5)}
                            </div>
                          </div>
                          <Row
                            style={{
                              fontSize: '12px',
                              fontWeight: 'normal',
                              paddingTop: '20px',
                              paddingBottom: '10px',
                              font: 'normal normal bold 12px/14px SF Pro Display',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            }}
                          >
                            <Col
                              onClick={() => {
                                history.push('/schedule');
                              }}
                            >
                              View booking page
                            </Col>
                            <Col xs={2}>
                              <img
                                src={Edit}
                                onClick={() => {
                                  openUpdateEventModal();
                                  setEventID(event.event_unique_id);
                                  getEvent(event.event_unique_id);
                                  setViewColor(view.color);
                                  setViewName(view.view_name);
                                }}
                                alt="edit event"
                              />
                            </Col>
                          </Row>
                        </div>
                        <Row
                          style={{
                            marginLeft: '10px',
                            padding: '10px 0px',
                            width: '213px',
                            height: '48px',
                            fontSize: '12px',
                            fontWeight: 'normal',
                            background: '#E5E5EB',
                            border: '1px solid #2C2C2E',
                            font: 'normal normal normal 14px/16px Helvetica Neue',
                          }}
                        >
                          <Col>
                            <img src={Copy} alt="copy event" /> Copy Link
                          </Col>
                          <Col
                            xs={4}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              openShareModal();
                              setViewColor(view.color);
                              setEventID(event.event_unique_id);
                            }}
                          >
                            Share
                          </Col>
                        </Row>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                );
              })}
            </Col>
          </Row>
        );
      })}
    </div>
  );
}
