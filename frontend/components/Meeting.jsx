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
    if (props.meeting.breakouts_frozen){
      return;
    }
    //post(`/${props.meeting.slug}/breakout/${id}/join`, {});
  };
  const areaClick = e => {
    e.preventDefault();
    if (props.meeting.breakouts_frozen){
      return;
    }
    let div = document.getElementById(`breakout-${id}`)
    let rect = div.getBoundingClientRect();
    const x = (e.clientX - rect.x)/rect.width*100; // normalize position to 0..100
    const y = (e.clientY - rect.y)/rect.height*100; // normalize position to 0..100
    post(`/${props.meeting.slug}/breakout/${id}/join`, {x, y});
    e.persist();
    console.log(x, y);
  };
  return (
    <div className="col-lg-6 mb-4">
      <div id={'breakout-'+id} className="breakout" onClick={areaClick} onMouseOver={() => showPointer(true)} onMouseOut={()=> showPointer(false)}>
        <a href="#" className="float-right" onClick={onClick}>JOIN</a>
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
    if (title.length == 0){
      return;
    }
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
      <h5>Host controls</h5>
      <p>Registration link: <a href={registrationUrl}>{registrationUrl}</a></p>
      <hr/>
      <p><a className="btn" href={`https://zoom.us/meeting/${props.meeting.zoom_id}/edit`} target="_blank">Edit zoom meeting</a></p>
      <hr/>
      <p><a className="btn" onClick={freeze}>{props.meeting.breakouts_frozen?'Unfreeze breakouts':'Freeze breakouts'}</a></p>
      <hr/>
      <p className="mb-4"><a className="btn" onClick={clear}>Delete all breakouts</a></p>

      <p><a href={`/${props.meeting.slug}/export`} className="btn btn-primary">Export breakouts CSV</a></p>
    </div>
  );
}


function UserProfile(props){
  const {userRegistration, zoomUser} = props;
  if (!userRegistration){
    return null;
  }
  let users = props.meeting.registrants.filter(user => user.registrant_id == userRegistration.registrant_id);
  if (users.length !== 1){
    return null;
  }
  const user = users[0];
  let breakout = props.meeting.breakouts.filter(room => room.id == user.breakout_id).pop();
  return (
    <div>
      <div className="d-flex align-items-start mb-3">
        <span className="avatar mr-2">{user.name.split(' ')[0]}</span>
          <p><strong>{user.name.split(' ').slice(1).join(' ')}</strong><br/>
          {breakout?breakout.title:'No room joined'}</p>
      </div>
      { zoomUser && <AdminActions {...props} /> }
    </div>
  );
}

function Registrant(props){
  const {user} = props;
  let style = {
    transition: 'top .5s ease-out 0.1s, left .5s ease-out 0.1s',
    zIndex: 999,
    position: 'sticky',
  };
  if (user.x > 0 || user.y > 0){
    style.position = 'absolute';
    style.top = user.y - 30;
    style.left = user.x - 30;
    let div = null;
    if (user.breakout_id){
      div = document.getElementById('breakout-' + user.breakout_id);
    } else {
      style.position = 'absolute';
      div = document.getElementById('registrants');
    }
    if (div){
      const rect = div.getBoundingClientRect();
      style.top = rect.y + user.y/100*rect.height - 30 + window.scrollY;
      style.left = rect.x + user.x/100*rect.width - 30 + window.scrollX;
    }
  }

  return (
    <a style={style} className={"avatar" + (user.ws_active?' ws-active':'')} tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').slice(1).join(' ')} >
      <span>
        {user.name.split(' ')[0]}
      </span>
    </a>
  );
}

function Registrants(props){
  const {registrants} = props.meeting;
  const onClick = (e) => {
    console.log(e.target.tagName);
    if (e.target.tagName != 'DIV' || props.meeting.breakouts_frozen){
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
    'flexDirection': 'column',
    'alignItems': 'flex-end',
    //position:'relative',
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
    opacity: show?0.7:0,
  };

  return (
    <div className="meeting container-fluid flex-grow-1 d-flex flex-column pt-3" onMouseMove={e => setMousePosition({x: e.clientX, y: e.clientY})}>
      <span className="avatard" style={style} onMouseOver={() => setShow(true)} onMouseOut={()=> setShow(false)}>{props.userRegistration.name.split(' ')[0]}</span>
      <div className="row flex-grow-1">
        <div className="col-md-3 d-flex flex-column">
          <div>
            <strong>Welcome!</strong>
            <p>{!props.meeting.breakouts_frozen?'Please join a room by cliking on the room or add your own room':'Breakouts are now frozen, please wait for the host to assign you to your breakout in the Zoom call.'}</p>
          </div>
          <div className="lobby flex-grow-1" onMouseOver={() => setShow(true)} onMouseOut={()=> setShow(false)}>
            <Registrants {...props} />
          </div>
          <div>
            <p>Total participants ({props.meeting.registrants.length})</p>
          </div>
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
