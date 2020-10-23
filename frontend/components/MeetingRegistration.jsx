import React, { useState } from 'react';
import {post} from 'utils/api';

export default function MeetingRegistration(props){

  const [email, setEmail] = useState();
  const [name, setName] = useState();

  const onSubmit = e => {
    e.preventDefault();
    let data = {
      meeting_id: props.meeting.zoom_id,
      email,
      name,
    };
    post(`${props.meeting.slug}/register`, data).then(meeting => {
      if (meeting.code == '201'){
        window.location = meeting.url;
      }
    });
  };

  return (
    <div className="col-md-6 offset-md-3">
      <form onSubmit={onSubmit} >
        <div className="form-group">
          <label htmlFor="nameInput">Name</label>
          <input 
            name="name"
            id="nameInput"
            type="text"
            className="form-control"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="emailInput">Email address</label>
          <input 
            name="email"
            id="emailInput"
            type="email"
            className="form-control"
            value={email}
            onChange={e => setEmail(e.target.value)} 
          />
        </div>
        <button type="submit" className="btn btn-primary">Register</button>
      </form>
    </div>
  )
}
