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
export const addView = (view) => {
  if (view === null || view === undefined) {
    return;
  }

  API.post('/AddView', view).catch((error) => {
    console.log('AXIOS POST ERROR:', error);
  });
};
export const updateView = (newView, oldViewID) => {
  if (
    oldViewID === null ||
    oldViewID === undefined ||
    newView === null ||
    newView === undefined
  ) {
    return;
  }

  API.post(`/UpdateView/${oldViewID}`, newView).catch((error) => {
    console.log('AXIOS POST ERROR:', error);
  });
};
export const deleteView = (viewID) => {
  if (viewID === null || viewID === undefined) {
    return;
  }

  API.post(`/DeleteView`, { view_id: viewID }).catch((error) => {
    console.log('AXIOS POST ERROR:', error);
  });
};

// GET VIEWS (THIS SHOULD ALWAYS FOLLOW ANY POST REQUEST IN ORDER TO UPDATE THE STATE)
export const getAllViews = (setAllViews, user) => {
  if (user === null || user === undefined) {
    return;
  }

  return API.get(`/GetAllViews/${user}`).then((res) => {
    // SETS THE FIRST VIEW AS SELECTED
    let result = res.data.result.result;
    result[0].view_unique_id = result[0].view_unique_id.concat('Selected');
    setAllViews(result);
    return result;
  });
};
