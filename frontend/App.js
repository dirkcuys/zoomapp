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
  let user = state.userRegistration;
  if (user) {
    // get latest state for user registration and replace prop with that
    let users = state.meeting.registrants.filter(user => user.id == state.userRegistration.id);
    user = users.pop();
  }

  return {...state, userRegistration: user}
}

const Appa = connect(mapStateToProps, null)(App)
export default Appa;
