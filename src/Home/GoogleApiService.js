let gapi = window.gapi;
const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const DISCOVERY_DOCS = [
  'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
];
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events email';

export function initClient(callback) {
  gapi.load('client:auth2', () => {
    try {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(
          function () {
            if (typeof callback === 'function') {
              callback(true);
            }
          },
          function (error) {
            console.log(error);
          }
        );
    } catch (error) {
      console.log(error);
    }
  });
}

export const checkSignInStatus = async () => {
  try {
    let status = await gapi.auth2.getAuthInstance().isSignedIn.get();
    return status;
  } catch (error) {
    console.log(error);
  }
};

export const signInToGoogle = async () => {
  try {
    let googleuser = await gapi.auth2.getAuthInstance().signIn();
    if (googleuser) {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};
export const getSignedInUserEmail = async () => {
  try {
    let status = await checkSignInStatus();
    if (status) {
      var auth2 = gapi.auth2.getAuthInstance();
      var profile = auth2.currentUser.get().getBasicProfile();
      console.log(profile);
      return [profile.getEmail(), profile.getName()];
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
  }
};
export const signOutFromGoogle = () => {
  try {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function () {
      auth2.disconnect();
    });
    return true;
  } catch (error) {
    console.log(error);
  }
};
export const publishTheCalenderEvent = (event) => {
  try {
    gapi.client.load('calendar', 'v3', () => {
      var request = gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event,
      });

      request.execute(function (event) {
        console.log('Event created: ' + event.htmlLink);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateTheCalenderEvent = (event) => {
  try {
    //console.log('updatedTheCalenderEvent', event);
    gapi.client.load('calendar', 'v3', () => {
      console.log('updatedTheCalenderEvent in');
      var request = gapi.client.calendar.events.patch({
        calendarId: 'primary',
        eventId: event['id'],
        resource: event,
      });
      console.log('updatedTheCalenderEvent', request);
      request.execute(function (event) {
        console.log('Event updated: ' + event.htmlLink);
      });
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteTheCalenderEvent = (id) => {
  try {
    console.log('deletedTheCalenderid', id);
    gapi.client.load('calendar', 'v3', () => {
      console.log('deletedTheCalenderEvent in');
      var request = gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: id,
      });
      console.log('deletedTheCalenderEvent', request);
      request.execute(function (id) {
        console.log('Event deleted ');
      });
    });
  } catch (error) {
    console.log(error);
  }
};
