import {BehaviorSubject} from "rxjs";
import React from "react";

const isDevelopment = process.env.NODE_ENV !== 'production';

class MutableInteractionState extends BehaviorSubject {

  constructor(initialValue) {
    super(initialValue);
  }

  get value() {
    return this.getValue();
  }

  set value(value) {
    this.next(value);
  }
}

class LiftedInteractionState extends BehaviorSubject {
  #sub;

  constructor(observable, initialValue) {
    super(initialValue);
    this.#sub = observable.subscribe(this);
  }

  get value() {
    return this.getValue();
  }

  unsubscribe() {
    this.sub.unsubscribe();
    super.unsubscribe();
  }
}

export function liftInteractionState(observable, initialValue) {
  return new LiftedInteractionState(observable, initialValue);
}

export function mutableInteractionState(initialValue) {
  return new MutableInteractionState(initialValue);
}

export function useInteractionState(interactionState) {
  if (isDevelopment) {
    console.debug("useInteractionState", interactionState.value);
  }

  const [state, setState] = React.useState(interactionState.value);

  React.useEffect(() => {
    const sub = interactionState.subscribe({
      next: (v) => {
        setState(v);

        if (isDevelopment) {
          console.debug("useInteractionState update", state);
        }
      }
    });
    return () => sub.unsubscribe();
  }, [interactionState]);

  if (isDevelopment) {
    console.debug("useInteractionState", state);
  }
  return state;
}

export function useMutableInteractionState(interactionState) {
  const state = useInteractionState(interactionState);

  return [
    state,
    (stateOrAction) => {
      if (stateOrAction instanceof Function) {
        interactionState.value = stateOrAction(interactionState.value);
        return;
      }

      interactionState.value = stateOrAction;
    }];
}