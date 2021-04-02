import React, { useState } from 'react';
import {post} from 'utils/api';
import {randomEmoji} from 'utils/emoji';


function RegistrationForm(props){
  const [emoji, setEmoji] = useState(randomEmoji());
  const [email, setEmail] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [name, setName] = useState('');
  const [nameField, setNameField] = useState(null);
  const [emailField, setEmailField] = useState(null);
  const onSubmit = e => {
    e.preventDefault();
    if (!emailField.checkValidity() || !nameField.checkValidity()){
      console.log('error');
      return;
    }
    props.onSubmit(`${emoji} ${name}`, email, meetingTitle);
  }
  return (
    <form onSubmit={onSubmit} >

      {props.isHost && 
      <div className="form-group">
          <label htmlFor="nameInput">Meeting Title</label>
          <input 
            name="title"
            required="True"
            id="titleInput"
            type="text"
            className="form-control"
            value={meetingTitle}
            onChange={e => setMeetingTitle(e.target.value)}
          />
        </div>
      }

      <div className="form-group">
        <p>Choose your icon</p>
        <div className="d-flex align-items-center">
          <div className="avatar me profile" >{emoji}</div>
          <button 
            className="btn btn-outline-secondary ml-2" type="button" 
            onClick={e => setEmoji(randomEmoji())}
          >⟳</button>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="nameInput">Name (as it appears in Zoom)</label>
        <input 
          ref={setNameField}
          name="name"
          required="True"
          id="nameInput"
          type="text"
          className="form-control"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="emailInput">Email</label>
        <input 
          ref={setEmailField}
          name="email"
          required="True"
          id="emailInput"
          type="email"
          className="form-control"
          pattern="^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$"
          title="The domain part of your email address doesn't seem right"
          value={email}
          onChange={e => setEmail(e.target.value)} 
        />
      </div>
      <button type="submit" className="btn btn-primary">
        {props.isHost ? 'Launch as Host' : 'Join'}
      </button>
    </form>
  );
}


export default function MeetingRegistration(props){
  const onSubmit = (name, email, title) => {
    let data = {
      meeting_id: props.meeting.zoom_id,
      email,
      name,
      title: title,
    };
    post(`/${props.meeting.slug}/register`, data).then(meeting => {
      if (meeting.code == '201'){
        location.reload();
      }
    });
  };
  const isHost = !props.meeting.registrants.length;

  return (
    <div className="container-md flex-grow-1 d-flex flex-column">
      <div className="row flex-grow-1 d-flex flex-column">
        <div className="col-10 offset-1 col-md-6 offset-md-3 flex-grow-1 d-flex justify-content-around flex-column">
          <div>
                <h2>{isHost ? "Create an Unbreakout" : props.meeting.title}</h2>
                <hr/>
            <RegistrationForm onSubmit={onSubmit} isHost={isHost} {...props} />
          </div>
        </div>
      </div>
    </div>
  )
}
