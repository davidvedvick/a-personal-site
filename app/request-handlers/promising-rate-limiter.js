export default class PromisingRateLimiter {

  constructor(rate) {
    this.rate = rate;
  }

	#availablePromises = this.rate;
	#queuedPromises = []

	limit(factory) {
    return new Promise((resolve, reject) => {
      this.#queuedPromises.push(() => factory().then(resolve, reject));
      this.doNext();
    });
  }

	doNext() {
		while (true) {
      // Drain the queue or max out number of open promises
      if (this.#queuedPromises.length === 0) return;
      this.#availablePromises = Math.max(this.#availablePromises - 1, 0);
      if (this.#availablePromises === 0) return;
      const nextPromise = this.#queuedPromises.shift();
      if (nextPromise) nextPromise().then(() => this.act(), () => this.act());
      else this.makePromiseAvailable();
		}
	}

	act() {
		this.makePromiseAvailable()
		this.doNext()
	}

	makePromiseAvailable() {
    this.#availablePromises = Math.min(this.#availablePromises + 1, this.rate);
	}
}