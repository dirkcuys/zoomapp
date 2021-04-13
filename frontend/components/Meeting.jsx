import React, { useState, useEffect } from 'react';
import {post} from 'utils/api';


function UserProfile({userRegistration, ...props}){
  if (!userRegistration)
    return null;
  let users = props.meeting.registrants.filter(user => user.id == userRegistration.id);
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
  }

  const registrationUrl = `${document.location.origin}/m/${props.meeting.slug}`
  return (
    <div>
      <h5>Host controls</h5>
      <p>Registration link: <a href={registrationUrl}>{registrationUrl}</a></p>
      <hr/>
      {props.zoomUser && 
        <div>
          <p>Zoom Account Linked!</p>
          <hr/>
        </div>}
      <p><a onClick={clear} className="btn btn-primary">Clear Breakouts</a></p>
      <p><a onClick={transfer} className="btn btn-primary">Freeze and Transfer</a></p>
      <hr/>
      <p><a href="{% url 'docs' %}" target="_blank">How to use Unbreakout</a></p>
      <hr/>
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
  const [offsetX, offsetY] = [-21, -22];
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
          key={user.id}
          user={user}
          isMe={user.id == props.userRegistration.id}
        />
      )}
    </div>
  );
}

function StatusMessage(props){
  const {breakouts_frozen} = props.meeting;
  return (
    <div className={`p-2${breakouts_frozen?' breakouts-frozen':''}`}>
      <strong>Welcome!</strong>
      <p className="m-0">Please join a room by clicking on the room or add your own room</p>
    </div>
  );
}

function Modal(props){
  return (
    <div className="modal" role="dialog">
        {props.userRegistration.is_host && <HostModal {... props} />}
        {!props.userRegistration.is_host && <ParticipantModal {... props} />}
      </div>
  );
}

function ParticipantModal(props){
  return (
    
    <div className="modal-dialog modal-dialog-centered modal-dialog-guest" role="document">
    <div className="modal-content modal-content-guest align-middle">
      <div className="modal-body">
        <h4 className="modal-title text-center">The host has frozen breakouts.</h4>
        <p>Please wait for the host to open breakouts on Zoom.</p>
        {props.meeting.breakouts_frozen && props.userRegistration.join_url && 
          <p><a href={props.userRegistration.join_url}>Join Meeting</a></p>
        }

        {props.meeting.breakouts_transfer &&
          <p>Transfer</p>
        }
      </div>
    </div>
    </div>
  );
}

function HostModal(props){
  const [tabView, setTabView] = useState(0);
  const close = () => {
    post(`/${props.meeting.slug}/freeze`, {}); 
  }
  
  return (
    <div className="modal-dialog modal-dialog-centered modal-dialog-host" role="document">
      <div className="modal-content align-middle">
        <div className="modal-header">
          <h4 className="modal-title text-center">Transfer Breakouts to Zoom</h4>
          <span></span>
          <ul className="nav nav-pills justify-content-center">
            <li className="nav-item">
              <a className={tabView === 0 ? "nav-link active" : "nav-link"} onClick={() => setTabView(0)} aria-current="page" href="#">Manual Copy</a>
            </li>
            <li className="nav-item">
              <a className={(props.zoomUser ? " " : "disabled ") + (tabView === 1 ? "nav-link active" : "nav-link")} 
                onClick={() => setTabView(1)} href="#">
                  Pre-Populate in New Call
              </a>
            </li>
          </ul>
        </div>

        {(tabView === 0 &&
            <ManualBreakoutTab close={close} {...props} />)
        || (tabView === 1 &&
            <CallCreateTab close={close} {...props}/>)
        }
      </div>
    </div>
  );
}

function CallCreateTab(props){
  const createZoomMeeting = () => {
    post(`/${props.meeting.slug}/create_zoom_meeting`, {});
  }
  return (
    <div>
      <div className="modal-body">
        {!props.zoomUser && 
          <div>
            <p>You'll need to authenticate with your Zoom account before we can create a call for you.</p>
            <span></span>
            <div className="text-center">
              <p><a href={`/zoom/redirect?next=/m/${props.meeting.slug}`} className="btn btn-primary justify-content-center">Link Your Zoom Account</a></p>
            </div>
          </div>
        }
        {props.zoomUser && 
          <div>
            <p>Unbreakout will create a new Zoom call with the breakouts pre-populated, and will give links to your participants to join.</p>
            <span></span>
            <div className="text-center">

              {!props.meeting.zoom_id && 
                <div>
                  {props.noBreakouts && <p className="text-center"><i>No breakouts to display or all breakouts are empty!</i></p>}
                  <p><a onClick={createZoomMeeting} className={"btn btn-primary" + (props.noBreakouts ? ' disabled': "")}>Create Meeting</a></p>
                </div>}
              { props.meeting.zoom_id && 
                <div>
                <p><a className="btn btn-primary">Start Zoom Call</a></p>
                </div>}
            </div>
          </div>
        }
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={close} data-dismiss="modal">Done</button>
      </div>
    </div>
  );
}

function ManualBreakoutTab(props){
  const {breakouts = []} = props.meeting;
  // TODO: Change state in some way to let participants know to return to the main zoom call
  const transfer = () => {
    post(`/${props.meeting.slug}/transfer`, {});
  }
  return (
    <div>
      <div className="modal-body">
        <div className="accordion" id="accordion">
          <p>If you’re not connected to Zoom or don’t want participants to move calls, <strong>manually create breakouts</strong> and copy them from here.</p>
          <p>When you press <strong>"Transfer Breakouts"</strong>, your participants will be prompted to return to your call.</p>
          <span></span>
          {props.noBreakouts
            ? <p className="text-center"><i>No breakouts to display or all breakouts are empty!</i></p>
            : breakouts.map( breakout => 
              <BreakoutCard dataParent="accordion" key={breakout.id} breakout={breakout} {...props} />)
          }
        </div>
      </div>
      <div className="modal-footer">
        <button type="button" className="btn btn-secondary" onClick={props.close} data-dismiss="modal">
          Cancel
        </button>
        <button type="button" className={"btn btn-primary" + (props.noBreakouts ? ' disabled': "")}
          onClick={transfer} data-dismiss="modal">
          Transfer Participants
        </button>
      </div>
    </div>
  );
}

function BreakoutCard(props){
  const [collapsed, setCollapsed] = useState(true);
  const {id, title, participants} = props.breakout;
  const names = participants.map(registrant => registrant.name.substring(3)).sort();
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
          <ul className="list-group list-group-flush">
            {names.map(name => <li className="list-group-item">{name}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default function Meeting(props) {
  console.log(props);
  const {breakouts = []} = props.meeting;
  const transferring = props.meeting.breakouts_frozen;
  const [showPointer, setShowPointer] = useState(false);
  const [mousePosition, setMousePosition] = useState({x:0, y:0});
  const noBreakouts = breakouts.reduce(
    (accumulator, currentValue ) => accumulator + currentValue.participants.length, 0)
    == 0;
  const style = {
    top: mousePosition.y-20,
    left: mousePosition.x-15,
    opacity: (showPointer&&!props.meeting.breakouts_frozen)?0.6:0,
  };
  props.meeting.breakouts_frozen ? document.body.style.overflow = 'hidden' : document.body.style.overflow = 'unset';

  return (
    <div>
      {props.meeting.breakouts_frozen  && <Modal noBreakouts={noBreakouts} {...props} />}
      <div className="meeting container-fluid flex-grow-1 d-flex flex-column pt-3" onMouseMove={e => setMousePosition({x: e.clientX, y: e.clientY})}>
        <span className="ghost" style={style} onMouseOver={() => setShowPointer(true)} onMouseOut={()=> setShowPointer(false)}>{props.userRegistration.name.split(' ')[0]}</span>
        <div className="row d-flex align-items-center mb-3">
          <div className="col-md-3 order-1 order-md-0">
            <StatusMessage {...props} />
          </div>
          <div className="col-md-6 order-0 order-md-1">
            <h1>{props.meeting.title}</h1>
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
            { props.userRegistration.is_host && <AdminActions {...props} /> }
          </div>
        </div>
      </div>
    </div>
  );
}
