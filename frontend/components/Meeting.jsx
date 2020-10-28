import React, { useState } from 'react';
import {post} from 'utils/api';

function User({user}){
  return (
    <li className={"avatar" + (user.ws_active?' ws-active':'')} key={user.registrant_id}>
      <a tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').slice(1)} >{user.name.split(' ')[0]}</a>
    </li>
  );
}

function Breakout(props){
  const {id, title, size, participants} = props.breakout;
  const onClick = () => {
    post(`/${props.meeting.slug}/breakout/${id}/join`, {});
  };
  const areaClick = e => {
    console.log(e.pageX, e.pageY);
  };
  return (
    <div className="col-md-6">
      <div className="breakout" onClick={areaClick} >
        <a className="float-right" onClick={onClick}>Join</a>
        <h4>{title}</h4>
        <p>{participants.length}/{size}</p>
        <ul className="unstyled">
          { participants.map(user => <User key={user.registrant_id} user={user} />) }
        </ul>
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
    post(`/${props.meeting.slug}/create_breakout`, data).then(resp => {
      if (resp.code == '201'){
        setTitle('');
      }
    });
  };

  return (
    <form onSubmit={onSubmit} >
      <div className="form-group">
        <div className="input-group">
          <input 
            name="title"
            id="titleInput"
            type="text"
            className="form-control"
            placeholder="Suggest a breakout"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <div className="input-group-append">
            <button type="submit" className="btn btn-primary"><strong>+</strong></button>
          </div>
        </div>
      </div>
    </form>
  );
}


function AdminActions(props){

  const freeze = () => {
    post(`/${props.meeting.slug}/freeze`, {});
  }

  const clear = () => {
    post(`/${props.meeting.slug}/clear`, {});
  }

  const registrationUrl = `${document.location.origin}/${props.meeting.short_code}`
  return (
    <div>
      <p>Registration link: <a href={registrationUrl}>{registrationUrl}</a></p>
      <p><a className="btn btn-primary" onClick={freeze}>{props.meeting.breakouts_frozen?'Unfreeze breakouts':'Freeze breakouts'}</a></p>
      <p><a className="btn btn-primary" onClick={clear}>Clear breakouts</a></p>
      <p><a href={`/${props.meeting.slug}/export`} className="btn btn-primary">Export breakouts CSV</a></p>
      <p><a href={`https://zoom.us/meeting/${props.meeting.zoom_id}/edit`} target="_blank">Edit zoom meeting</a></p>
    </div>
  );
}


function UserProfile(props){
  const {userRegistration, zoomUser} = props;
  if (!userRegistration){
    return null;
  }
  return (
    <div>
      <p>
        <span className="avatar">
          <a>{userRegistration.name.split(' ')[0]}</a>
        </span>
        &nbsp;{userRegistration.name.split(' ').slice(1)}
      </p>
      { zoomUser && <AdminActions {...props} /> }
    </div>
  );
}

function Registrants(props){
  const {registrants} = props.meeting;
  return (
    <ul className="list-unstyled">
      {registrants.filter(user => user.breakout_id == null).map(user => 
        <li className={"avatar" + (user.ws_active?' ws-active':'')} key={user.registrant_id}>
          <a tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').slice(1)} >{user.name.split(' ')[0]}</a>
        </li>
      )}
    </ul>
  );
}

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  return (
    <div className="meeting container-md">
      <div className="row">
        <div className="col-md-3">
          <Registrants {...props} />
        </div>
        <div className="col-md-6">
          <h2>Meeting {props.meeting.topic}</h2>
          <hr/>
          <BreakoutForm {...props} />
          <div className="row breakout-list">{ breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} /> )}
          </div>
        </div>
        <div className="col-md-3">
          <UserProfile {...props} />
        </div>
      </div>
    </div>
  );
}
