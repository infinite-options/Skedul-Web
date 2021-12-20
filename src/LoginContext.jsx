import { createContext } from 'react';

const LoginContext = createContext();

export default LoginContext;

export const LoginInitState = {
  loggedIn: false,
  reload: false,
  ta: {
    id: '',
    email: '',
  },
  usersOfTA: [],
  curUser: '',
  curUserTimeZone: '',
  curUserEmail:'',
};
