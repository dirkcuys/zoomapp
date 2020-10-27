import React, { useState } from 'react';
import {post} from 'utils/api';
import {randomEmoji} from 'utils/emoji';

export default function MeetingRegistration(props){

  const [emoji, setEmoji] = useState(randomEmoji());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const onSubmit = e => {
    e.preventDefault();
    let data = {
      meeting_id: props.meeting.zoom_id,
      email,
      name: `${emoji} ${name}`,
    };
    post(`${props.meeting.slug}/register`, data).then(meeting => {
      if (meeting.code == '201'){
        window.location = `${props.meeting.slug}`;
      }
    });
  };

  return (
    <div className="col-md-6 offset-md-3">
      <form onSubmit={onSubmit} >
        <div className="form-group">
          <label htmlFor="nameInput">Name</label>
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">{emoji}</span>
            </div>
            <input 
              name="name"
              id="nameInput"
              type="text"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          <div className="input-group-append">
            <button 
              className="btn btn-outline-secondary" type="button" 
              onClick={e => setEmoji(randomEmoji())}
            >⟳</button>
          </div>

          </div>
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
