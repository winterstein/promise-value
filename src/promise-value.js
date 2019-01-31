
/**
 * {value: ?Object, promise: !Promise, error: ?Object, resolved: boolean} 
* The promise part is always set.
* The behaviour depends on the valueOrPromise passed to the constructor:
*  - If it's a value -> resolved Promise
*  - If it's a Promise (or thenable) -> the input Promise
*  - null/undefined -> rejected Promise
* 
* The `value` and `error` properties will be set instantly if known, and otherwise set when the promise resolves.
* The `resolved` flag records the promise status, and changes to true once the promise is resolved.
 */
class PromiseValue {

	/** @type {?Error} */
	error;
	/** @type {!Promise} */
	promise;
	/** @type {!boolean} */
	resolved;
	/** @type {?Object} */
	value;

	/**
	 * @param {*} valueOrPromise 
	 * @returns {value: ?Object, promise: !Promise, error: ?Object, resolved: boolean} 
	 *  The return is never null, and the promise part is always set.
	 * 	The behaviour depends on valueOrPromise:
	 * 	 - If it's a value -> resolved Promise
	 *   - If it's a Promise (or thenable) -> the input Promise
	 * 	 - null/undefined -> rejected Promise
	 * 
	 * The `value` and `error` properties will be set instantly if known, and otherwise set when the promise resolves.
	 * The `resolved` flag records the promise status, and changes to true once the promise is resolved.
	 */
	constructor(valueOrPromise) {
		if (valueOrPromise===null || valueOrPromise===undefined) {
			this.error = new Error("null value");
			this.promise = Promise.reject(err);
			this.resolved = true;
			return;
		}
		// NB: Promise.resolve() can be used with Promises without nesting	
		if (typeof(valueOrPromise.then) === 'function') {		
			// Having then() is the only real requirement for a Promise
			const vp = this;
			this.resolved = false;
			// set the value when we have it
			// NB: the promise we expose is _after_ resolved and value gets set
			let _promise = valueOrPromise.then(
				function (r) {
					// Warning: this on-success function will also be called if the server
					// returns a code 200 (OK http) but {status:error} (JSend error) response.
					// Handling this should be done in the Ajax layer.
					vp.value = r;
					vp.resolved = true;
					return r;
				}, 
				function (err) {				
					// also store any error
					vp.error = err; // maybe we should store err.statusText? Nah, this is a wrapper, lets just pass on whatever we get.
					vp.resolved = true;
					// carry on error-handling if the promise has any catches
					throw err;
				});
			this.promise = _promise;		
			return;
		}
		// It's a value - resolve now
		this.value = valueOrPromise,
		this.resolved = true,
		this.promise = Promise.resolve(valueOrPromise);
	}

};

export default PromiseValue;
