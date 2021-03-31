import React, { useState, useEffect } from 'react';
import {post} from 'utils/api';


function UserProfile({userRegistration, ...props}){
  if (!userRegistration)
    return null;
  let users = props.meeting.registrants.filter(user => user.registrant_id == userRegistration.registrant_id);
  const user = users.pop();
  if (!user)
    return null;
  let breakout = props.meeting.breakouts.filter(room => room.id == user.breakout_id).pop();
  return (
    <div className="d-flex align-items-start">
      <span className="avatar me profile mr-2">{user.name.split(' ')[0]}</span>
      <div><strong>{user.name.split(' ').slice(1).join(' ')}</strong> (You)<br/>
        {breakout?(<><strong>You're in:</strong> {breakout.title}</>):'No room joined'}
      </div>
    </div>
  );
}


function AdminActions(props){
  const freeze = () => {
    post(`/${props.meeting.slug}/freeze`, {});
  }

  const clear = () => {
    post(`/${props.meeting.slug}/clear`, {});
  }

  const transfer = () => {
    post(`/${props.meeting.slug}/freeze`, {}); 
    props.showModal(true);
  }

  const registrationUrl = `${document.location.origin}/${props.meeting.short_code}`
  return (
    <div>
      <h5>Host controls</h5>
      <p>Registration link: <a href={registrationUrl}>{registrationUrl}</a></p>
      <hr/>
      <p><a onClick={clear} className="btn btn-primary">Clear Breakouts</a></p>
      <p><a onClick={transfer} className="btn btn-primary">Transfer to Zoom</a></p>
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
    if (!!props.meeting.breakouts.filter(breakout => breakout.title == title).pop()){
      // TODO - an error would be nice
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


function Breakout(props){
  const {id, title, size, participants} = props.breakout;
  const {showPointer} = props;
  const onClick = e => {
    e.preventDefault();
    if (props.meeting.breakouts_frozen) return;
    let div = document.getElementById(`breakout-${id}`)
    let rect = div.getBoundingClientRect();
    const x = (e.clientX - rect.x)/rect.width*100; // normalize position to 0..100
    const y = (e.clientY - rect.y)/rect.height*100; // normalize position to 0..100
    post(`/${props.meeting.slug}/breakout/${id}/join`, {x, y});
    console.log(x, y);
  };
  return (
    <div id={'breakout-'+id} className="breakout" onClick={onClick} onMouseOver={() => showPointer(true)} onMouseOut={()=> showPointer(false)}>
      <h5>{title} <small className="text-muted">({participants.length})</small></h5>
    </div>
  );
}


function calcRegistrantAttrs(nX, nY, pX, pY, destX, destY, destW, destH){
  const [offsetX, offsetY] = [-30, -30];
  const x = offsetX + destX + nX/100*destW;
  const y = offsetY + destY + nY/100*destH - pY; // col has position: relative
  /*if (user.breakout_id){
    const el = document.getElementById('breakout-list-container');
    if (el && y + parentRect.y < el.getBoundingClientRect().y){
      style.opacity = 0;
    }
  }*/
  console.log(`Participant position(${x},${y}). parent(${pX}, ${pY}) user(${nX}, ${nY})`);
  return [x, y]
}

function Registrant(props){
  const {user, isMe} = props;
  let style = {
    //transition: 'top .5s ease-out 0.1s, left .5s ease-out 0.1s',
    transition: 'all .5s ease-out',
    zIndex: 999,
  };
  if (user.x > 0 || user.y > 0){
    style.position = 'absolute';
    let parentDiv = document.getElementById('registrants');
    let destDiv = user.breakout_id?document.getElementById('breakout-' + user.breakout_id):parentDiv;
    if (parentDiv){
      const parentRect = parentDiv.getBoundingClientRect();
      const destRect = destDiv.getBoundingClientRect();
      const [x, y] = calcRegistrantAttrs(user.x, user.y, parentRect.x, parentRect.y, destRect.x, destRect.y, destRect.width, destRect.height);
      style.top = y;
      style.left = x;
    }
  }
  const [element, setElement] = useState(null);
  useEffect(() => {
    if (element)
      $(element).popover();
  });
  return (
    <a ref={setElement} style={style} className={"avatar" + (user.ws_active?' ws-active':'') + (isMe?' me':'')} tabIndex="-1" role="button" data-container="body" data-toggle="popover" data-trigger="focus" data-placement="top" data-content={user.name.split(' ').slice(1).join(' ')} >
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
    console.log(`Lobby click (${x},${y})`);
    // clear breakout, if any
    post(`/${props.meeting.slug}/breakout/unjoin`, {x, y});
  }
  let style = {
    display: 'flex',
    'flexDirection': 'column',
    'alignItems': 'flex-end',
    height: '100%'
  };
  return (
    <div id="registrants" style={style} onClick={onClick} >
      {registrants.map(user =>
        <Registrant 
          key={user.registrant_id}
          user={user}
          isMe={user.registrant_id == props.userRegistration.registrant_id}
        />
      )}
    </div>
  );
}

function StatusMessage(props){
  const breakouts_frozen = props.meeting.breakouts_frozen;
  return (
    <div className={`p-2${breakouts_frozen?' breakouts-frozen':''}`}>
      <strong>{!breakouts_frozen?'Welcome!':'Thanks for joining!'}</strong>
      <p className="m-0">{!breakouts_frozen?'Please join a room by clicking on the room or add your own room':'Please wait for the host to open breakouts on Zoom.'}</p>
    </div>
  );
}

function Modal(props){
  return (
    <div className="modal">
      <div className="modal-body">
        <h2>Thanks for joining!</h2>
        <p>Please wait for the host to open breakouts on Zoom.</p>
      </div>
    </div>
  );
}

function BreakoutModal(props){
  return (
  <div className="modal" role="dialog">
    <div className="modal-dialog" role="document">
      <div className="modal-content align-middle">
        <div className="modal-header">
          <h5 className="modal-title">Breakout List</h5>
        </div>
        <div className="modal-body">
          <p>If you’re not connected to Zoom or don’t want participants to move calls, manually open breakouts and copy them from here.</p>
          <BreakoutList {...props} />
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={() => props.showModal(false)} data-dismiss="modal">Done</button>
        </div>
      </div>
    </div>
  </div>
  );
}

function BreakoutList(props){
  const {breakouts = []} = props.meeting;
  return (
    <div className="accordion" id="accordion">
      { breakouts.map( breakout => 
        <BreakoutCard dataParent="accordion" key={breakout.id} breakout={breakout} {...props} /> 
      )}
      {/* <div className="card">
        <div className="card-header" id="headingone">
          <h2 className="mb-0">
            <button className="btn btn-link btn-block text-left" type="button" data-toggle="collapse" data-target="#collapseone" aria-expanded="true" aria-controls="collapseone">
              collapsible group item #1
            </button>
          </h2>
        </div>

        <div id="collapseone" className="collapse" aria-labelledby="headingone" data-parent="#accordionexample">
          <div className="card-body">
            some placeholder content for the first accordion panel. this panel is shown by default, thanks to the <code>.show</code> class.
          </div>
        </div>
      </div> */}
    </div>
  );
}

function BreakoutCard(props){
  const [collapsed, setCollapsed] = useState(true);
  const {id, title, participants} = props.breakout;
  const names = participants.map(registrant => registrant.name);
  return (
    <div className="card">
      <div className="card-header" id={id}>
        <h2 className="mb-0">
          <button className="btn btn-link btn-block text-left" type="button" onClick={() => setCollapsed(!collapsed)} aria-expanded="true" aria-controls="collapseone">
            {title}
          </button>
        </h2>
      </div>

      <div id={id} className={collapsed ? "collapse hide" : "collapse show"} aria-labelledby="headingone" data-parent={props.dataParent} >
        <div className="card-body">
          <ul className="list-group list-group-flush">{names}</ul>
        </div>
      </div>
    </div>
  )
}

export default function Meeting(props) {
  const {breakouts = []} = props.meeting;
  const [showPointer, setShowPointer] = useState(false);
  const [showBreakoutModal, setShowModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({x:0, y:0});
  const style = {
    top: mousePosition.y-25,
    left: mousePosition.x-25,
    opacity: (showPointer&&!props.meeting.breakouts_frozen)?0.6:0,
  };
  document.body.setAttribute('style', showBreakoutModal ? "position: fixed" : "");

  return (
    <div className="meeting container-fluid flex-grow-1 d-flex flex-column pt-3" onMouseMove={e => setMousePosition({x: e.clientX, y: e.clientY})}>
      {showBreakoutModal ? <BreakoutModal showModal={setShowModal} {...props} /> : null}
      <span className="ghost" style={style} onMouseOver={() => setShowPointer(true)} onMouseOut={()=> setShowPointer(false)}>{props.userRegistration.name.split(' ')[0]}</span>
      <div className="row d-flex align-items-center mb-3">
        <div className="col-md-3 order-1 order-md-0">
          <StatusMessage {...props} />
        </div>
        <div className="col-md-6 order-0 order-md-1">
          <h1>{props.meeting.topic}</h1>
        </div>
        <div className="col-md-3 order-2 order-md-2">
          <UserProfile {...props} />
        </div>
      </div>
      <div className="row flex-grow-1">
        <div className="col-md-3 d-flex flex-column">
          <div className="lobby flex-grow-1" onMouseOver={() => setShowPointer(true)} onMouseOut={()=> setShowPointer(false)}>
            <Registrants {...props} />
          </div>
          <div className="participant-count">
            <p>Total participants ({props.meeting.registrants.length})</p>
          </div>
        </div>
        <div className="col-md-6 d-flex flex-column">
          <BreakoutForm {...props} />
          <div id="breakout-list-container" className="flex-grow-1">
            <div className="breakout-list w-100">
              { breakouts.map( breakout => <Breakout key={breakout.id} breakout={breakout} {...props} showPointer={setShowPointer} /> )}
            </div>
          </div>
        </div>
        <div className="col-md-3">
          { props.zoomUser && <AdminActions showModal={setShowModal} {...props} /> }
        </div>
      </div>
    </div>
  );
}
