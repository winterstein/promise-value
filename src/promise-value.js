
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

	/** @type {?Function} Only set by `PromiseValue.pending` Call this with a value to resolve the PV. */
	resolve;
	/** @type {?Function} Only set by `PromiseValue.pending` Call this with an error to reject the PV. */
	reject;

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
			const e = new Error("null value");
			this.error = e;
			this.promise = Promise.reject(e);
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

/**
 * Create a pending PV, which you manually set to be fulfilled
 * @returns {PromiseValue}
 */
PromiseValue.pending = () => {
	const rr = {}
	const p = new Promise((resolve, reject) => {
		console.log("resolve-reject", resolve, reject);
		rr.resolve = resolve;
		rr.reject = reject;
	});
	let pv = new PromiseValue(p);
	pv.resolve = v => {
		pv.value = v;
		pv.resolved  = true;
		rr.resolve(v);		
	};
	pv.reject = err => {
		pv.error = err;
		pv.resolved  = true;
		rr.reject(err);
	};
	return pv;
};

// NB: comment out to run test.promise-value.html
export default PromiseValue;

// Uncomment for tests
// window.pv = PromiseValue;
// window.PromiseValue = PromiseValue;

