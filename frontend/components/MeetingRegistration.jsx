import React, { useState } from 'react';
import {post} from 'utils/api';
import {randomEmoji} from 'utils/emoji';


function RegistrationForm(props){
  const [emoji, setEmoji] = useState(randomEmoji());
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [nameField, setNameField] = useState(null);
  const [emailField, setEmailField] = useState(null);
  const onSubmit = e => {
    e.preventDefault();
    if (!emailField.checkValidity() || !nameField.checkValidity()){
      console.log('error');
      return;
    }
    props.onSubmit(`${emoji} ${name}`, email);
  }
  return (
    <form onSubmit={onSubmit} >
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
        <label htmlFor="nameInput">Name</label>
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
      <button type="submit" className="btn btn-primary">Register</button>
    </form>
  );
}


export default function MeetingRegistration(props){
  const onSubmit = (name, email) => {
    let data = {
      meeting_id: props.meeting.zoom_id,
      email,
      name,
    };
    post(`/${props.meeting.slug}/register`, data).then(meeting => {
      if (meeting.code == '201'){
        location.reload();
      }
    });
  };

  return (
    <div className="container-md flex-grow-1 d-flex flex-column">
      <div className="row flex-grow-1 d-flex flex-column">
        <div className="col-10 offset-1 col-md-6 offset-md-3 flex-grow-1 d-flex justify-content-around flex-column">
          <div>
            <h2>{props.meeting.topic}</h2>
            <hr/>
            <RegistrationForm onSubmit={onSubmit} {...props} />
          </div>
        </div>
      </div>
    </div>
  )
}
