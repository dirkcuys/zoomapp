import React, { useState } from 'react';
import {post} from 'utils/api';

function Breakout(props){
  const {title, size, participants} = props.breakout;
  return (
    <div>
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
        console.log('added breakout');
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

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  return (
    <div className="meeting">
      <div>
        Meeting {props.meeting.zoom_id}
      </div>
      <div>
        { breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} /> )}
      </div>
      <div>
        <BreakoutForm {...props} />
      </div>
    </div>
  );
}
