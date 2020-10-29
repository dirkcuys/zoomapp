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
  const {showPointer} = props;
  const onClick = e => {
    e.preventDefault();
    console.log(e.target);
    post(`/${props.meeting.slug}/breakout/${id}/join`, {});
  };
  const areaClick = e => {
    //e.preventDefault();
    let div = document.getElementById(`breakout-${id}`)
    let rect = div.getBoundingClientRect();
    const x = (e.clientX - rect.x)/rect.width*100; // normalize position to 0..100
    const y = (e.clientY - rect.y)/rect.height*100; // normalize position to 0..100
    post(`/${props.meeting.slug}/breakout/${id}/join`, {x, y});
    e.persist();
    console.log(x, y);
  };
  return (
    <div className="col-lg-6">
      <div id={'breakout-'+id} className="breakout" onClick={areaClick} onMouseOver={() => showPointer(true)} onMouseOut={()=> showPointer(false)}>
        <a href="#" className="float-right" onClick={onClick}>Join</a>
        <h4>{title}</h4>
        <p>{participants.length}/{size}</p>
        <ul className="unstyled">
          { false && participants.map(user => <User key={user.registrant_id} user={user} />) }
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
        <span className="avatar">{userRegistration.name.split(' ')[0]}</span>
        &nbsp;{userRegistration.name.split(' ').slice(1)}
      </p>
      { zoomUser && <AdminActions {...props} /> }
    </div>
  );
}

function Registrant(props){
  const {user} = props;
  let style = {
    transition: 'top .5s ease-out 0.1s, left .5s ease-out 0.1s',
    zIndex: 999,
  };
  if (user.x > 0 || user.y > 0){
    style.position = 'fixed';
    style.top = user.y - 30;
    style.left = user.x - 30;
    let div = null;
    if (user.breakout_id){
      div = document.getElementById('breakout-' + user.breakout_id);
    } else {
      div = document.getElementById('registrants');
    }
    if (div){
      const rect = div.getBoundingClientRect();
      style.top = rect.y + user.y/100*rect.height - 30;
      style.left = rect.x + user.x/100*rect.width - 30;
    }
  }

  return (
    <span style={style} className={"avatar" + (user.ws_active?' ws-active':'')}>
      <a tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').slice(1)} >{user.name.split(' ')[0]}</a>
    </span>
  );
}

function Registrants(props){
  const {registrants} = props.meeting;
  const onClick = (e) => {
    console.log(e.target.tagName);
    if (e.target.tagName != 'DIV'){
      return;
    }
    // GET x,y
    let rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.x)/rect.width*100; // normalize position to 0..100
    const y = (e.clientY - rect.y)/rect.height*100; // normalize position to 0..100
    // clear breakout, if any
    post(`/${props.meeting.slug}/breakout/unjoin`, {x, y});
  }
  let style = {
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'flex-end',
    position:'relative',
    height: '100%'
  };
  return (
    <div id="registrants" style={style} onClick={onClick} >
      {registrants.map(user =>
        <Registrant key={user.registrant_id} user={user} />
      )}
    </div>
  );
}

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  const [show, setShow] = useState(false);
  const [mousePosition, setMousePosition] = useState({x:0, y:0});
  const style = {
    cursor: 'default',
    transition: 'all .1s ease-out',
    position: 'fixed',
    top: mousePosition.y-25,
    left: mousePosition.x-25,
    zIndex: 999,
    opacity: show?1:0,
  };

  return (
    <div className="meeting container-md flex-grow-1 d-flex flex-column" onMouseMove={e => setMousePosition({x: e.clientX, y: e.clientY})}>
      <span className="avatard" style={style} onMouseOver={() => setShow(true)} onMouseOut={()=> setShow(false)}>{props.userRegistration.name.split(' ')[0]}</span>
      <div className="row flex-grow-1">
        <div className="col-md-3" onMouseOver={() => setShow(true)} onMouseOut={()=> setShow(false)}>
          <Registrants {...props} />
          <div className="lobby"></div>
        </div>
        <div className="col-md-6">
          <h2>Meeting {props.meeting.topic}</h2>
          <hr/>
          <BreakoutForm {...props} />
          <div className="row breakout-list">{ breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} showPointer={setShow} /> )}
          </div>
        </div>
        <div className="col-md-3">
          <UserProfile {...props} />
        </div>
      </div>
    </div>
  );
}
