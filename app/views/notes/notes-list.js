import React from 'react';
import Note from './note/note.js';
import pkg from 'react-hyperscript-helpers';
import {NotesViewModel} from "./notes-view-model.js";
import {useInteractionState} from "../interactions/ObservableState.js";
import {cancellationToken} from "../CancellationToken.js";
const { div } = pkg;

export function NotesList(props) {
  const noteNodes = props.notes
    .map((note) => Note({ note: note }));

  return div('#notes', noteNodes);
}

export function ContinuousNotesList(props) {
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

  return NotesList({ notes: notes });
}
