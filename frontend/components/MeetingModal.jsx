import React, { useState, useEffect } from 'react';
import {post} from 'utils/api';

export default function Modal(props){
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
      {/* TODO: reference a variable that can actually tell if manual or zoom call */}
      <div className="modal-body">
        <h4 className="modal-title text-center">
          {props.userRegistration.join_url && props.meeting.breakouts_transfer && 
            <a href={props.userRegistration.join_url} target="_blank">
              Click here to join the breakouts in a new Zoom call.</a>}
          {!props.userRegistration.join_url && props.meeting.breakouts_transfer && 
            'Please return to the Zoom call to join your breakouts.'}
          {!props.meeting.breakouts_transfer && 'The host has frozen breakouts.'}
        </h4>
        {props.meeting.breakouts_transfer &&
          <p>Keep this window open if you will be doing another round of breakouts.</p>}
        {!props.meeting.breakouts_transfer && 
          <p>Please wait for the host to open breakouts on Zoom.</p>}
        </div>
      </div>
    </div>
  );
}

function HostModal(props){
  return (
    <div className="modal-dialog modal-dialog-centered modal-dialog-host" role="document">
      <div className="modal-content align-middle">
        {props.meeting.breakouts_transfer && <TransferSuccess {... props} />}
        {!props.meeting.breakouts_transfer && <TransferDialogue {... props} />}
      </div>
    </div>
  );
}

function TransferSuccess(props){
  const reset = () => {
    post(`/${props.meeting.slug}/freeze`, {});  
    post(`/${props.meeting.slug}/transfer`, {});
    //TODO: discard call
  }

  return (
    //TODO: reference a variable that can actually tell if manual or zoom call
    <div className="modal-body">
      <h4 className="modal-title text-center">
        {props.userRegistration.join_url && 
          <a href={props.userRegistration.join_url} target="_blank">Click here to join the call</a>}
        {!props.userRegistration.join_url && 'You did it!'}
      </h4>
      {props.userRegistration.join_url && 
        <p>Your participants will now be prompted to return to Zoom. If you want to start a new Unbreakout session, use the buttons below.</p>}
      {!props.userRegistration.join_url &&  
        <p>Your participants will now be prompted to join the new call. If you’re done with these new breakouts and want to start a new Unbreakout session, use the buttons below. But be careful, it will stop showing them the Zoom join link!</p>}
        
      <div className="text-center">
        <p><a onClick={reset} className="btn btn-primary">Return to Session</a></p>
      </div>
    </div>
  );
}

function TransferDialogue(props){
  const [tabView, setTabView] = useState(0);
  const cancel = () => {
    post(`/${props.meeting.slug}/freeze`, {}); 
    post(`/${props.meeting.slug}/discard_zoom_meeting`, {});
  }

  return (
    <div>
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
          <ManualBreakoutTab cancel={cancel} {...props} />)
      || (tabView === 1 &&
          <CallCreateTab cancel={cancel} {...props}/>)
      }
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
        <button type="button" className="btn btn-secondary" onClick={props.cancel} data-dismiss="modal">Done</button>
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
        <p><a type="button" className="btn btn-secondary" onClick={props.cancel} data-dismiss="modal">
          Cancel
        </a></p>
        <p><a type="button" className={"btn btn-primary" + (props.noBreakouts ? ' disabled': "")}
          onClick={transfer} data-dismiss="modal">
          Transfer Participants
        </a></p>
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
