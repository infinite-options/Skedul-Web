import axios from 'axios';

// USERID
export const userID = document.cookie
  .split(';')
  .some((item) => item.trim().startsWith('user_uid='))
  ? document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_uid='))
      .split('=')[1]
  : '';

// REQUESTS
export const API = axios.create({
  baseURL: process.env.REACT_APP_SERVER_BASE_URI,
});

// POST VIEWS
export const addView = (setAllViews, user, view) => {
  if (view === null || view === undefined) {
    return;
  }

  API.post('/AddView', view)
    .then(() => {
      API.get(`/GetAllViews/${user}`).then((res) => {
        // SETS THE FIRST VIEW AS SELECTED
        let result = res.data.result.result;
        result[result.length - 1].view_unique_id =
          result[result.length - 1].view_unique_id.concat('Selected');
        setAllViews(result);
      });
    })
    .catch((error) => {
      console.log('AXIOS POST ERROR:', error);
    });
};
export const updateView = (setAllViews, user, newView, oldViewID) => {
  if (
    oldViewID === null ||
    oldViewID === undefined ||
    newView === null ||
    newView === undefined
  ) {
    return;
  }

  // CORRECTIONS
  let newSched = { schedule: JSON.parse(newView.schedule) };
  // Object.keys(newSched.schedule).forEach((key) => {
  //   if (newSched.schedule[key].length <= 0) {
  //     newSched.schedule[key].push({ start_time: '00:00', end_time: '00:00' });
  //   }
  // });
  const ID = oldViewID.replace('Selected', '');

  API.post(`/UpdateView/${ID}`, newSched)
    .then(() => {
      API.get(`/GetAllViews/${user}`).then((res) => {
        // SETS THE FIRST VIEW AS SELECTED
        let result = res.data.result.result;
        result[result.length - 1].view_unique_id =
          result[result.length - 1].view_unique_id.concat('Selected');
        setAllViews(result);
      });
    })
    .catch((error) => {
      console.log('AXIOS POST ERROR:', error);
    });
};
export const deleteView = (setAllViews, user, viewID) => {
  if (viewID === null || viewID === undefined) {
    return;
  }

  API.post(`/DeleteView`, { view_id: viewID })
    .then(() => {
      API.get(`/GetAllViews/${user}`).then((res) => {
        // SETS THE FIRST VIEW AS SELECTED
        let result = res.data.result.result;
        result[result.length - 1].view_unique_id =
          result[result.length - 1].view_unique_id.concat('Selected');
        setAllViews(result);
      });
    })
    .catch((error) => {
      console.log('AXIOS POST ERROR:', error);
    });
};

// GET VIEWS (THIS SHOULD ALWAYS FOLLOW ANY POST REQUEST IN ORDER TO UPDATE THE STATE)
export const getAllViews = (setAllViews, user) => {
  if (user === null || user === undefined) {
    return;
  }

  API.get(`/GetAllViews/${user}`).then((res) => {
    // SETS THE FIRST VIEW AS SELECTED
    let result = res.data.result.result;
    result[result.length - 1].view_unique_id =
      result[result.length - 1].view_unique_id.concat('Selected');
    setAllViews(result);
  });
};
