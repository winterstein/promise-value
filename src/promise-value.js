
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
	/** 
	 * @type {?Object} The result from the promise.
	 * 
	 * Note: If pending() is used, then is possible for `value` to be null. 
	*/
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
		// Sanity check the input: Has someone mistakenly passed in a PromiseValue?
		if (valueOrPromise instanceof PromiseValue) {
			console.warn("Double wrapped PromiseValue", valueOrPromise);
			// Hm -- keep on trucking?? Or would it better to throw an error?
			valueOrPromise = valueOrPromise.value || valueOrPromise.promise;
		}
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
					// oh dear - store the error
					setError(vp, err);
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
 * Convenience to call `then` on the promise and rewrap the result.
 * 
 * Differences from `Promise.then` (added to avoid gotchas): 
 * 
 * 1. As a safety guard against repeated calls (e.g. in React rendering), only the first call will have any effect for a given input PV.
 * Repeated calls will return the cached PV from the first call. Which is usually helpful - but does affect how you can chain a set of PV.then()s.
 * 
 * 2. If the input is resolved, then the output is also instantly resolved. By contrast, a Promise.then in this case would start unresolved, then resolve a moment later.
 * 
 * @param {!PromiseValue} pv 
 * @param {Function} onResolve 
 * @param {?Function} onReject 
 * @returns {!PromiseValue} a new PV with the promise pv.promise.then
 */
PromiseValue.then = (pv, onResolve, onReject) => {	
	// safety against repeated calls 
	if (pv._then) {
		return pv._then;
	}
	// Input is resolved? Make an already resolved response (otherwise it wouldn't resolve until a moment later)
	if (pv.resolved) {
		let pv2 = PromiseValue.pending(); // NB: this allows for thenV = null without an ugly error message in the console
		pv._then = pv2;		
		if (pv.error) {
			const thenErr = onReject? onReject(pv.error) : pv.error;
			pv2.reject(thenErr);
		} else {
			let thenV = onResolve? onResolve(pv.value) : pv.value;
			pv2.resolve(thenV);
		}
		return pv2;
	}
	// ...then...
	const p2 = pv.promise.then(onResolve, onReject);	
	let pv2 = new PromiseValue(p2);
	pv._then = pv2;
	return pv2;
};

const setError = (pv, err) => {
	if (err instanceof Error || (err && err.stack)) {
		pv.error = err;
		return;
	}
	pv.error = new Error(err? (err.responseText || err.statusText || err.status || ""+err) : "");	
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
		setError(pv, err);
		pv.resolved  = true;
		rr.reject(err);
	};
	return pv;
};

// Uncomment for release
// Hack: comment out to run test.promise-value.html
// export default PromiseValue;
