export * from '../transport/reducers';
import * as A from './actions';

export function meeting(state=null, action){
  console.log(`super snuiter ${JSON.stringify(action)}`);
  switch (action.type) {
    case A.ADD_BREAKOUT:
      return {breakouts: state.breakouts.push(action.breakout), ...state};
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



