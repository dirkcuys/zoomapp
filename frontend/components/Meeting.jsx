import React from 'react';

export default function Meeting(props) {
  return (
    <div className="meeting">
      Meeting {props.meeting.zoom_id}
    </div>
  );
}
