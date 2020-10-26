import React, { useState } from 'react';
import {post} from 'utils/api';

function Breakout(props){
  const {title, size, participants} = props.breakout;
  return (
    <div className="list-group-item">
      {title} {participants.length}/{size}
    </div>
  );
}

function BreakoutForm(props){
  const [title, setTitle] = useState('');
  const onSubmit = e => {
    e.preventDefault();
    let data = {
      meeting_id: props.meeting.zoom_id,
      title,
    };
    post(`${props.meeting.slug}/create_breakout`, data).then(resp => {
      if (resp.code == '201'){
        setTitle('');
      }
    });
  };

  return (
      <form onSubmit={onSubmit} >
        <div className="form-group">
          <label htmlFor="titleInput">Title</label>
          <input 
            name="title"
            id="titleInput"
            type="text"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Add breakout</button>
      </form>
  );
}

function UserProfile(props){
  if (!props.userRegistration){
    return null;
  }
  return (
    <a href={props.userRegistration.join_url}>Join meeting</a>
  );
}

function Registrants(props){
  const {registrants} = props.meeting;
  return (
    <ul>
      {registrants.map(user => <li>{user.name}</li>)}
    </ul>
  );
}

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  return (
    <div className="meeting row">
      <div className="col-md-3">
        <h2>Meeting {props.meeting.topic}</h2>
        <hr/>
        <UserProfile {...props} />
      </div>
      <div className="col-md-6">
        <div className="list-group">{ breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} /> )}
        </div>

        <BreakoutForm {...props} />
      </div>
      <div className="col-md-3">
        <Registrants {...props} />
      </div>
    </div>
  );
}
