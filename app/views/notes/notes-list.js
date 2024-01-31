import React from 'react';
import Note from './note/note.js';
import pkg from 'react-hyperscript-helpers';
import {NotesViewModel} from "./notes-view-model.js";
import {useInteractionState} from "../interactions/ObservableState.js";
import {cancellationToken} from "../CancellationToken.js";
const { div, hh } = pkg;

export function StaticNotesList(props) {
  const noteNodes = props.notes
    .map((note) => Note({ note: note, key: note.hash }));

  return div('#notes', noteNodes);
}

export function DynamicNotesList(props) {
  const viewModel = React.useMemo(
    () => new NotesViewModel(document, props.notes ?? []),
    [props.notes]);

  const notes = useInteractionState(viewModel.notes);

  React.useEffect(() => {
    const token = cancellationToken();
    viewModel
      .watchFromScrollState(token)
      .catch((err) => console.error("An unrecoverable error occurred watching the scroll state.", err));

    return () => token.cancel();
  }, [viewModel]);

  const noteNodes = notes
    .map((note) => Note({ note: note }));

  return div('#notes', noteNodes);
}
