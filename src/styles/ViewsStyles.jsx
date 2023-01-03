import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
  container: {
    display: 'block',
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
    height: 'fit-content',
    border: '2px solid #2C2C2E',
    borderRadius: '3px',
    textTransform: 'none',
    color: ' #2C2C2E',
    fontSize: '18px',
    padding: '10px 15px',
    margin: '0 40px',
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
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    border: '1px solid black',
  },
  activeButton: {
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    border: '3px solid black',
  },
  colorButton: {
    width: '40px',
    height: '40px',
    borderRadius: '3px',
    border: 'none',
  },
  timeSlot: {
    width: '100%',
    height: '100%',
    borderRadius: '2px',
    backgroundColor: 'rgb(0,0,0,0)',
    opacity: '50%',
    boxShadow: '0',
    transition: 'background-color 0.025s ease, box-shadow 0.05s ease',
    '&:hover': {
      backgroundColor: 'rgb(0,0,0, 0.1)',
      boxShadow: '0.5px 0.5px 0.5px black',
    },
  },
});

export default useStyles;
