import React from 'react';
import { connect } from 'react-redux'

import Meeting from 'components/Meeting';
import MeetingRegistration from 'components/MeetingRegistration';


function App(props) {
  const {meeting, zoomUser, userRegistration, shortCode} = props;
  if (!userRegistration){
    return <MeetingRegistration {...props} />;
  } 
  return <Meeting {...props} />;
}

const mapStateToProps = (state, ownProps) => {
  return {...state}
}

const Appa = connect(mapStateToProps, null)(App)
export default Appa;
