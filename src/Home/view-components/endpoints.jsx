import axios from "axios";
import moment from "moment";

// USERID

// REQUESTS
export const API = axios.create({
    baseURL: process.env.REACT_APP_SERVER_BASE_URI,
});

// POST VIEWS
export const addView = (setAllViews, user, view, setshowLoadingImg) => {
    if (view === null || view === undefined) {
        return;
    }
    console.log("xtx : view ", view);
    API.post("/AddView", view)
        .then(() => {
            API.get(`/GetAllViews/${user}`).then((res) => {
                // SETS THE FIRST VIEW AS SELECTED
                let result = res.data.result.result;
                result[result.length - 1].view_unique_id =
                    result[result.length - 1].view_unique_id.concat("Selected");
                setAllViews(result);
                setshowLoadingImg(false);
            });
        })
        .catch((error) => {
            console.log("AXIOS POST ERROR:", error);
        });
};
export const updateView = (setAllViews, user, newView, oldViewID, type, setshowLoadingImg) => {
    if (
        oldViewID === null ||
        oldViewID === undefined ||
        newView === null ||
        newView === undefined
    ) {
        return;
    }

    // CORRECTIONS
  console.log("newView ",newView)
  console.log("newView.schedule ",newView.schedule)
  console.log("newView.schedule ", JSON.parse(newView.schedule))
  let scheduleObj = JSON.parse(newView.schedule);
  let newSched = { name: newView.view_name, color: newView.color, schedule: scheduleObj, updateType: type };
  console.log("newSched ", newSched)

    // let newSched = { name: newView.view_name, color: newView.color, schedule: JSON.parse(newView.schedule), updateType: type };
    console.log(" newSched : ",newSched)
    // Object.keys(newSched.schedule).forEach((key) => {
    //   if (newSched.schedule[key].length <= 0) {
    //     newSched.schedule[key].push({ start_time: '00:00', end_time: '00:00' });
    //   }
    // });
    let selectedID = 0;
      if (oldViewID.includes('Selected')) {
      selectedID = oldViewID.replace("Selected", "")
    }
    const ID = oldViewID.replace("Selected", "");
    console.log(" ID : ",ID)
    setshowLoadingImg(true)
    let UTCsched = convertScheduleTolocalTimeZone(newSched.schedule);
    console.log("txt : UTC 1", UTCsched);
    newSched.schedule = UTCsched;
    console.log("txt : newSched", newSched);

    API.post(`/UpdateView/${ID}`, newSched)
        .then(() => {
            API.get(`/GetAllViews/${user}`).then((res) => {
                // SETS THE FIRST VIEW AS SELECTED

                let result = res.data.result.result;
                console.log("old selected ViewID ",selectedID)
                let idx = result.findIndex(view => view.view_unique_id === selectedID);
                console.log("old selected ViewID in new result ",idx, " & result = ", result[idx].view_unique_id)
                result[idx].view_unique_id =
                    result[idx].view_unique_id.concat("Selected");
                // result[result.length - 2].view_unique_id =
                //     result[result.length - 2].view_unique_id.concat("Selected");
                setAllViews(result);
                setshowLoadingImg(false)
            });
        })
        .catch((error) => {
            console.log("AXIOS POST ERROR:", error);
        });
    
        function convertDateToCurrentTimeZone(date) {
            let utcDate = moment.utc(date).format();
            let localDateString = utcDate.toString();
            console.log("txt localDateString ", localDateString)
            
            let localDate = moment.utc(localDateString).format("YYYY-MM-DD");
            let localTime = moment.utc(localDateString).format("HH:mm");
            var localDayOfWeek = moment.utc(localDateString, "YYYY-MM-DD HH:mm:ss").format('dddd');
            console.log("txt : local date ", localDateString, " , formatted date : ", localDate, " , formatted time ", localTime, " , localDayOfWeek ", localDayOfWeek);
            
            let dateObj = {
              'localDate' : localDate,
              'localTime': localTime,
              'localDayOfWeek': localDayOfWeek,
            }
            console.log("txt : dateObj = ", dateObj, " ** ", localTime);
            return dateObj ;
          }
          function convertScheduleTolocalTimeZone(schedule) {
            console.log("txt : schedule3 ", schedule);
            var dates = Last7Days();
            // console.log("txt :  dates ", dates);
            let tzOffset = getTimezoneOffset();
            let localSchedule = {};
            
            Object.keys(schedule).forEach((day) => {
              let dailySchedule = schedule[day];
              if (localSchedule[day] === undefined) { 
                localSchedule[day] = [];
              }
              if (dailySchedule.length !== 0) {
                for (let i in dailySchedule) {
                  console.log(" dailySchedule = ", dailySchedule[i]);
                  dailySchedule[i]['date'] = dates[day];
        
                  let DSEobj = {};
        
                  // convert date and START time to UTC
                  var dateString_startTime = dailySchedule[i]['date'].toString() + " " + dailySchedule[i]['start_time'].toString() + ":00" + tzOffset;
                  console.log("txt : original dateString_startTime", dateString_startTime);
                  var localStartDateTime = convertDateToCurrentTimeZone(dateString_startTime);
                  DSEobj = { 'start_time': localStartDateTime.localTime }
                  // console.log("txt : DSEobj", DSEobj);
        
                  // convert date and END time to UTC
                  var dateString_endTime = dailySchedule[i]['date'].toString() + " " + dailySchedule[i]['end_time'].toString() + ":00" + tzOffset;
                  console.log("txt : original dateString_endTime", dateString_endTime);
                  var localEndDateTime = convertDateToCurrentTimeZone(dateString_endTime);
        
                  if (localEndDateTime.localDate !== localStartDateTime.localDate) {
                    DSEobj = { ...DSEobj, 'end_time': "23:59" };
                    console.log("txt : DSEobj 1", DSEobj);
                    localSchedule[localStartDateTime.localDayOfWeek].push(DSEobj);
                    var endTimeLocal = localEndDateTime.localTime;
                    DSEobj = { 'start_time': "00:00", 'end_time': endTimeLocal }
                    console.log("txt : DSEobj 2 in if", DSEobj);
                  }
                  else {
                    DSEobj['end_time'] = localEndDateTime.localTime;
                    console.log("txt : DSEobj 3", DSEobj);
                  }
                  if (localSchedule[localEndDateTime.localDayOfWeek] === undefined) {
                    localSchedule[localEndDateTime.localDayOfWeek] = [];
                  }
                  localSchedule[localEndDateTime.localDayOfWeek].push(DSEobj);
                }
              }
            })
            console.log("txt : localSchedule ", localSchedule);
            console.log("txt : schedule2 ", schedule);
            return localSchedule;
            }
          
          function Last7Days() {
            var result = [];
            var resultDay = [];
            let date = {};
            for (var i = 0; i < 7; i++) {
              var d = new Date();
              var x = new Date().getDay();
              d.setDate(d.getDate() + i);
              x = moment(d).format("dddd");
              result.push(formatDate(d));
              resultDay.push(x);
              date[x] = moment(d).format("YYYY-MM-DD");
            }
            // console.log("date ", date);
            return date;
          }
    
          function formatDate(date) {
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            var yyyy = date.getFullYear();
            if (dd < 10) {
              dd = "0" + dd;
            }
            if (mm < 10) {
              mm = "0" + mm;
            }
            date = mm + "/" + dd + "/" + yyyy;
            return date;
          }
          
          function getTimezoneOffset() {
            function z(n){return (n<10? '0' : '') + n}
            var offset = new Date().getTimezoneOffset();
            var sign = offset < 0? '+' : '-';
            offset = Math.abs(offset);
            return sign + z(offset/60 | 0) + z(offset%60);
          }
};
export const deleteView = (setAllViews, user, viewID, setshowLoadingImg) => {
    if (viewID === null || viewID === undefined) {
        return;
    }
    setshowLoadingImg(true)
    API.post(`/DeleteView`, { view_id: viewID })
        .then(() => {
            API.get(`/GetAllViews/${user}`).then((res) => {
                // SETS THE FIRST VIEW AS SELECTED
                let result = res.data.result.result;
                result[result.length - 1].view_unique_id =
                    result[result.length - 1].view_unique_id.concat("Selected");
                setAllViews(result);
                setshowLoadingImg(false)
            });
        })
        .catch((error) => {
            console.log("AXIOS POST ERROR:", error);
        });
};

// GET VIEWS (THIS SHOULD ALWAYS FOLLOW ANY POST REQUEST IN ORDER TO UPDATE THE STATE)
export const getAllViews = (setAllViews, user, setshowLoadingImg) => {
    if (user === null || user === undefined) {
        return;
    }
    setshowLoadingImg(true)
    API.get(`/GetAllViews/${user}`).then((res) => {
        // SETS THE FIRST VIEW AS SELECTED
        let result = res.data.result.result;
        setshowLoadingImg(false)
        if (result !== 0) 
          result[result.length - 1].view_unique_id =
          result[result.length - 1].view_unique_id.concat("Selected");
          setAllViews(result);
    });
};