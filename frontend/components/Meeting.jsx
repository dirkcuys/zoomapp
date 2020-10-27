import React, { useState } from 'react';
import {post} from 'utils/api';

function Breakout(props){
  const {title, size, participants} = props.breakout;
  return (
    <div className="col-md-6">
      <div className="breakout">
        {title} {participants.length}/{size}
      </div>
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
    <ul className="list-unstyled">
      {registrants.map(user => 
        <li className="avatar" key={user.zoom_registrant_id}>
          <a tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').pop()} >{user.name.split(' ')[0]}</a>
        </li>
      )}
    </ul>
  );
}

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  return (
    <div className="meeting container-md">
      <div className="registrants">
        <Registrants {...props} />
      </div>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h2>Meeting {props.meeting.topic}</h2>
          <hr/>
          <UserProfile {...props} />
        </div>
      </div>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <BreakoutForm {...props} />
          <div className="row breakout-list">{ breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} /> )}
          </div>
        </div>
      </div>
    </div>
  );
}
