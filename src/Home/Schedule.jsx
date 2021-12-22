import React, { useState, useEffect } from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import axios from 'axios';
import { Container, Row, Col } from 'react-bootstrap';
import { Typography, Button } from '@material-ui/core';
import Bookmark from '../images/bookmark.svg';
import moment from 'moment';
const useStyles = makeStyles({
  container: {
    backgroundColor: '#F3F3F8',
    padding: '20px',
  },
});
export default function Schedule() {
  const classes = useStyles();
  const [allViews, setAllViews] = useState([]);
  const [allSchedule, setAllSchedule] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const url =
      'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllViews/100-000102';
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setAllViews(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url =
      'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetAllEventsUser/100-000102';
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setAllEvents(json.result.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    const url =
      'https://pi4chbdo50.execute-api.us-west-1.amazonaws.com/dev/api/v2/GetSchedule/100-000102';
    fetch(url)
      .then((response) => response.json())
      .then((json) => {
        setAllSchedule(json.result);
      })
      .catch((error) => console.log(error));
  }, [refreshKey]);

  useEffect(() => {
    if (
      allEvents.length !== 0 ||
      allSchedule.length !== 0 ||
      allViews.length !== 0
    ) {
      setIsLoading(false);
    }
    //console.log(allViews);
  }, [allViews, allEvents, allSchedule, refreshKey]);

  const weekdaysAndDateDisplay = () => {
    let arr = [];
    let today = new Date();
    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    for (let i = 0; i < 12; i++) {
      arr.push(
        <Col
          key={'day' + i}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <Col
            style={{
              font: 'normal normal bold 16px SF Pro Display',
              textAlign: 'center',
              padding: '20px 0px',
            }}
          >
            <div
              style={{
                color: '#2C2C2E',
              }}
            >
              {startDate.format('dddd')}
            </div>
            <br />
            <div style={{ color: '#636366' }}>{startDate.format('D')}</div>
          </Col>
        </Col>
      );
      startDate.add(1, 'day');
    }
    return arr;
  };

  const timeDisplay = () => {
    //this essentially creates the time row
    let arr = [];
    for (let i = 0; i < 24; ++i) {
      // if (i < 12) {
      arr.push(
        <Row key={'weekEvent' + i}>
          <Col
            style={{
              textAlign: 'left',
              height: '55px',
              font: 'normal normal normal 12px/14px SF Pro Display',
              //borderBottom: '1px solid #AFAFB3',
            }}
          >
            {i == 0
              ? '12AM'
              : i == 12
              ? i + 'PM'
              : i > 11
              ? i - 12 + 'PM'
              : i + 'AM'}
          </Col>
        </Row>
      );
    }
    // console.log('12 @', arr.valueOf());
    return arr;
  };

  const sortSchedule = () => {
    var arr = Object.values(allSchedule);

    //var arr = allViews.map((view) => JSON.parse(view.schedule));

    var dic = {};
    let today = new Date();
    //console.log(arr);
    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    let startDay = startDate.format('dddd');
    let endDate = dateNew.add(11, 'days');
    let endDay = endDate.format('dddd');
    //console.log(Object.values(arr));
    for (let i = 0; i < arr.length; i++) {
      //console.log(arr[i], arr.length);
      let day = arr[i];
      //console.log(day);
      for (let j = 0; j < day.length; j++) {
        //console.log(day[j]);
        let tempStart = day[j].schedule.start_time;
        let tempEnd = day[j].schedule.end_time;
        //console.log(day[j], day.length);
        let key = i + '_' + tempStart.substring(0, 2);
        //console.log(key);
        if (dic[key] == null) {
          dic[key] = [];
        }
        dic[key].push(day[j]);
        //console.log('dict', dic);
      }
    }
    // console.log('dict', dic);
    return dic;
  };

  function leftFillNum(num, targetLength) {
    return num.toString().padStart(targetLength, 0);
  }
  function hex2dec(hex) {
    return hex
      .replace('#', '')
      .match(/.{2}/g)
      .map((n) => parseInt(n, 16));
  }

  function rgb2hex(r, g, b) {
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    r = Math.min(r, 255);
    g = Math.min(g, 255);
    b = Math.min(b, 255);
    return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
  }

  function rgb2cmyk(r, g, b) {
    let c = 1 - r / 255;
    let m = 1 - g / 255;
    let y = 1 - b / 255;
    let k = Math.min(c, m, y);
    c = (c - k) / (1 - k);
    m = (m - k) / (1 - k);
    y = (y - k) / (1 - k);
    return [c, m, y, k];
  }

  function cmyk2rgb(c, m, y, k) {
    let r = c * (1 - k) + k;
    let g = m * (1 - k) + k;
    let b = y * (1 - k) + k;
    r = (1 - r) * 255 + 0.5;
    g = (1 - g) * 255 + 0.5;
    b = (1 - b) * 255 + 0.5;
    return [r, g, b];
  }

  function mix_cmyks(...cmyks) {
    let c =
      cmyks.map((cmyk) => cmyk[0]).reduce((a, b) => a + b, 0) / cmyks.length;
    let m =
      cmyks.map((cmyk) => cmyk[1]).reduce((a, b) => a + b, 0) / cmyks.length;
    let y =
      cmyks.map((cmyk) => cmyk[2]).reduce((a, b) => a + b, 0) / cmyks.length;
    let k =
      cmyks.map((cmyk) => cmyk[3]).reduce((a, b) => a + b, 0) / cmyks.length;
    return [c, m, y, k];
  }
  function mix_hexes(...hexes) {
    let rgbs = hexes.map((hex) => hex2dec(hex));
    let cmyks = rgbs.map((rgb) => rgb2cmyk(...rgb));
    let mixture_cmyk = mix_cmyks(...cmyks);
    let mixture_rgb = cmyk2rgb(...mixture_cmyk);
    let mixture_hex = rgb2hex(...mixture_rgb);
    console.log(mixture_hex);
    return mixture_hex;
  }
  const getScheduleItemFromDic = (day, hour, dic) => {
    let today = new Date();
    //console.log(arr);
    let dateNew = moment(today);
    let startDate = dateNew.startOf('week');
    let startDay = startDate.format('dddd');
    let endDate = dateNew.add(11, 'days');
    let endDay = endDate.format('dddd');

    var res = [];
    var tempStart = null;
    var tempEnd = null;
    var arr = dic[day + '_' + hour];
    //console.log('startObject = ', arr);

    var sameTimeEventCount = 0;
    var addmarginLeft = 0;
    let itemWidth = 80;
    var fontSize = 10;
    if (arr == null) {
      //console.log('in if null', arr);
      return;
    }
    for (let i = 0; i < arr.length; i++) {
      tempStart = arr[i].schedule.start_time;
      tempEnd = arr[i].schedule.end_time;
      //console.log(tempStart.substring(3, 5), tempEnd);
      let minsToMarginTop = (tempStart.substring(3, 5) / 60) * 55;
      //console.log(minsToMarginTop);
      let hourDiff = tempEnd.substring(0, 2) - tempStart.substring(0, 2);
      //console.log(hourDiff);
      let minDiff =
        tempEnd.substring(3, 5) / 60 - tempStart.substring(3, 5) / 60;
      //console.log(minDiff);
      let height = (hourDiff + minDiff) * 55;
      //console.log(height);
      sameTimeEventCount++;
      //console.log(sameTimeEventCount);
      let color = 'lightslategray';
      //check if there is already an event there overlapping from another hour
      for (let i = 0; i < arr.length; i++) {
        //console.log('in for');
        tempStart = arr[i].schedule.start_time;
        tempEnd = arr[i].schedule.end_time;

        if (
          tempStart.substring(0, 2) < hour &&
          tempEnd.substring(0, 2) > hour
        ) {
          //console.log('in if > hour');
          addmarginLeft += 20;
          itemWidth = itemWidth - 20;
          //console.log('in if hour', addmarginLeft, itemWidth);
        }
      }

      if (sameTimeEventCount > 1) {
        //console.log('in if sameTimeEventCount>1');
        addmarginLeft += 20;
        itemWidth = itemWidth - 20;
      }
      //chnage font size if not enough space
      if (tempEnd.substring(0, 2) - tempStart.substring(0, 2) < 2) {
        fontSize = 8;
      }

      // change color if more than one event in same time.
      if (sameTimeEventCount <= 1) {
        color = `${arr[i].color}`;
      } else if (sameTimeEventCount > 1) {
        color = mix_hexes(arr[i - 1].color, arr[i].color);
        console.log(arr[i].color, arr[i - 1].color);
      } else {
        color = `${arr[i].color}`;
      }

      // Need to strip trailing zeros because the data in the database
      // is inconsistent about this
      const start_time = arr[i].schedule.start_time
        .substring(11)
        .split(/[:\s+]/);
      if (start_time[0][0] == '0') start_time[0] = start_time[0][1];
      const end_time = arr[i].schedule.end_time.substring(11).split(/[:\s+]/);
      // Need to strip trailing zeros because the data in the database
      // is inconsistent about this
      if (end_time[0][0] == '0') end_time[0] = end_time[0][1];
      let newElement = (
        <div key={'event' + i}>
          <div
            className="clickButton"
            data-toggle="tooltip"
            data-placement="right"
            key={i}
            style={{
              zIndex: 1,
              marginTop: minsToMarginTop + 'px',
              padding: '3px',
              fontSize: fontSize + 'px',
              // border: '1px lightgray solid ',
              // border:
              //   this.props.highLight === arr[i].title
              //     ? '2px solid #FF6B4A '
              //     : '',
              float: 'left',
              background: color,
              width: itemWidth + 'px',
              position: 'absolute',
              height: height + 'px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              //opacity: '0.45',
            }}
          >
            {/* insert border change here: */}
          </div>
        </div>
      );
      //console.log('newElement', newElement, arr[i]);
      res.push(newElement);
    }

    console.log('res_wr = ', res);
    return res;
  };
  const weekViewItems = () => {
    // this creates the events adjusting their div size to reflecting the time it's slotted for
    var res = [];
    let dic = sortSchedule();
    console.log(dic);
    for (let i = 0; i < 7; ++i) {
      var arr = [];
      for (let j = 0; j < 24; ++j) {
        arr.push(
          <Container key={'weekschedule' + i + j}>
            <Row style={{ position: 'relative' }}>
              <Col
                style={{
                  position: 'relative',
                  // borderTop: '1px solid lavender',
                  // background: 'aliceblue',
                  height: '50px',
                  color: 'white',
                  borderTop: '1px solid #AFAFB3',
                  margin: '0px',
                  padding: '0px',
                  width: '100%',
                }}
              >
                {getScheduleItemFromDic(i, leftFillNum(j, 2), dic)}
              </Col>
            </Row>
          </Container>
        );
      }
      //console.log(arr);
      res.push(
        <Col
          key={'daySchedule' + i}
          style={{
            margin: '0px',
            padding: '0px',
          }}
        >
          {arr}
        </Col>
      );
      console.log(res);
    }
    for (let i = 0; i < 5; ++i) {
      var arr = [];
      for (let j = 0; j < 24; ++j) {
        arr.push(
          <Container key={'weekschedule' + i + j}>
            <Row style={{ position: 'relative' }}>
              <Col
                style={{
                  position: 'relative',
                  // borderTop: '1px solid lavender',
                  // background: 'aliceblue',
                  height: '50px',
                  color: 'white',
                  borderTop: '1px solid #AFAFB3',
                  margin: '0px',
                  padding: '0px',
                  width: '100%',
                }}
              >
                {getScheduleItemFromDic(i, leftFillNum(j, 2), dic)}
              </Col>
            </Row>
          </Container>
        );
      }
      //console.log(arr);
      res.push(
        <Col
          key={'daySchedule' + i}
          style={{
            margin: '0px',
            padding: '0px',
          }}
        >
          {arr}
        </Col>
      );
      console.log(res);
    }
    return res;
  };
  return (
    <div className={classes.container}>
      <Row>
        {allViews.map((view) => {
          return (
            <Col>
              <Typography
                style={{
                  textTransform: 'uppercase',
                  color: '#2C2C2E',
                  padding: '0',
                  font: 'normal normal normal 20px/25px Prohibition',
                  backgroundColor: `${view.color}`,
                }}
              >
                {view.view_name}
              </Typography>

              <Row>
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
                                    color: '#2C2C2E',
                                    padding: '0',
                                    font: 'normal normal normal 20px/25px Prohibition',
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
                                font: 'normal normal normal 14px/16px SF Pro Display',
                              }}
                            >
                              <div>
                                {Number(event.duration.substring(0, 1)) > 1
                                  ? event.duration.substring(2, 4) !== '00'
                                    ? Number(event.duration.substring(0, 1)) +
                                      ' hrs ' +
                                      Number(event.duration.substring(2, 4)) +
                                      ' min'
                                    : Number(event.duration.substring(0, 1)) +
                                      ' hrs'
                                  : Number(event.duration.substring(0, 1)) == 1
                                  ? '60 min'
                                  : event.duration.substring(3, 5) + ' min'}
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
                          </div>
                        </div>
                      ) : (
                        <div></div>
                      )}
                    </div>
                  );
                })}
              </Row>
            </Col>
          );
        })}
      </Row>
      <Container
        fluid
        style={{
          borderTop: '1px solid #AFAFB3',
          margin: '20px 0px',
          padding: '0px',
        }}
      >
        <Row>
          <Col
            xs={1}
            style={{
              color: '#636366',
              font: 'normal normal bold 16px SF Pro Display',
              paddingTop: '20px',
            }}
          >
            <br></br>
            <br></br>
            {moment().format('MMMM')}
          </Col>
          <Col>
            <Row>{weekdaysAndDateDisplay()}</Row>
          </Col>
        </Row>
      </Container>

      <Row noGutters={true} style={{ marginLeft: '0rem', marginRight: '0rem' }}>
        <Col xs={1}>
          <Container style={{ margin: '0', padding: '0' }}>
            {timeDisplay()}
          </Container>
        </Col>

        <Col>
          <Row>{weekViewItems()}</Row>
        </Col>
      </Row>
    </div>
  );
}
