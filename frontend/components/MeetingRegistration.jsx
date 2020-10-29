import React, { useState } from 'react';
import {post} from 'utils/api';
import {randomEmoji} from 'utils/emoji';


function RegistrationForm(props){
  const [emoji, setEmoji] = useState(randomEmoji());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const onSubmit = e => {
    e.preventDefault();
    props.onSubmit(`${emoji} ${name}`, email);
  }

  return (
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
  );
}

function RegistrationInfo(props){
  const {userRegistration} = props;
  return (
    <div>
      <p>Thank you for registering!</p>
      <p>Your ID for this meeting is:</p>
      <div className="d-flex p-2 pt-3 pb-3 bg-light mb-5 align-items-center">
        <div className="avatar mr-2">{userRegistration.name.split(' ')[0]}</div>
        <strong className="flex-grow-1">{userRegistration.name.split(' ').slice(1).join(' ')}</strong>
      </div>
      <p>
        <a className="btn btn-primary" href={userRegistration.join_url}>Join meeting on Zoom</a>
      </p>
    </div>
  );
}

export default function MeetingRegistration(props){
  const [userRegistration, setUserRegistration] = useState(props.userRegistration);

  const onSubmit = (name, email) => {
    let data = {
      meeting_id: props.meeting.zoom_id,
      email,
      name,
    };
    post(`/${props.meeting.slug}/register`, data).then(meeting => {
      if (meeting.code == '201'){
        //TODO pass request through redux + update state of userRegistration on success
        setUserRegistration(meeting.registration);
      }
    });
  };

  return (
    <div className="container-md flex-grow-1 d-flex flex-column">
      <div className="row flex-grow-1 d-flex flex-column">
        <div className="col-10 offset-1 col-md-6 offset-md-3 flex-grow-1 d-flex justify-content-around flex-column">
          <div>
            <h2>Meeting {props.meeting.topic}</h2>
            <hr/>
            {!userRegistration && <RegistrationForm onSubmit={onSubmit} {...props} />}
            {userRegistration && <RegistrationInfo {...props} userRegistration={userRegistration} />}
          </div>
        </div>
      </div>
    </div>
  )
}
