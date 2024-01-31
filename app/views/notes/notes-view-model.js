import {mutableInteractionState} from "../interactions/ObservableState.js";
import {firstValueFrom, fromEvent, filter} from "rxjs";

export class NotesViewModel {
  #isLoadingSubject = mutableInteractionState(false);
  #loadedNotes;
  notes;
  #document;

  constructor(document, initialNotes) {
    this.#document = document;
    this.notes = mutableInteractionState(initialNotes);
    this.#loadedNotes = new Set(initialNotes.map(n => n.hash));
  }

  get isLoading() {
    return this.#isLoadingSubject;
  }

  async watchFromScrollState(cancellationToken) {
    let nextPageNumber = 1;
    while (!cancellationToken.isCancelled) {
      try {
        const promisedResponse = fetch(`/notes/${nextPageNumber}`);
        await Promise.any([promisedResponse, cancellationToken.promisedCancellation]);
        if (cancellationToken.isCancelled) return;

        const response = await promisedResponse;
        if (!response.ok) return;

        const notes = await response.json();
        if (notes.length === 0) return;

        this.notes.value = this.notes.value.concat(notes.filter(n => {
          if (this.#loadedNotes.has(n.hash)) return false;

          this.#loadedNotes.add(n.hash);
          return true;
        }));

        nextPageNumber += 1;
      } catch (error) {
        console.error("There was an error getting item pictures", error);
      }

      const events = fromEvent(this.#document, "scroll").pipe(
        filter(() => {
          const fifthLastPicture = this.#document.querySelector('div.note:nth-last-child(5)');
          if (!fifthLastPicture) return false;

          const rect = fifthLastPicture.getBoundingClientRect();
          return rect.top <= 0;
        }),
      );

      await Promise.any([firstValueFrom(events), cancellationToken.promisedCancellation]);
    }
  }
}