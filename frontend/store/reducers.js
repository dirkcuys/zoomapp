export * from '../transport/reducers';
import * as A from './actions';


const defaultMeeting = {
  breakouts: [],
  presence: [],
  participants: []
};

export function meeting(state=null, action){
  switch (action.type) {
    case A.ADD_BREAKOUT:
      return {...state, breakouts: state.breakouts.concat([action.payload])};
      break;
    case 'SET_BREAKOUTS':
      return {...state, breakouts: action.payload};
      break;
    case 'SET_REGISTRANTS':
      return {...state, registrants: action.payload};
      break;
  }
  return state;
}

export function zoomUser(state=null, action){
  return state;
}

export function userRegistration(state=null, action){
  return state;
}



