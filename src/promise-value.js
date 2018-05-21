
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
function pv(valueOrPromise) {
	if (valueOrPromise===null || valueOrPromise===undefined) {
		const err = new Error("null value");
		return {
			error: err,
			promise: Promise.reject(err),
			resolved: true
		};
	}
	// NB: Promise.resolve() can be used with Promises without nesting	
	if (typeof(valueOrPromise.then) === 'function') {		
		// Having then() is the only real requirement for a Promise
		var vp = {resolved: false};
		// set the value when we have it
		// NB: the promise we expose is _after_ resolved and value gets set
		let _promise = valueOrPromise.then(
			function (r) {
				vp.value = r;
				vp.resolved = true;
				return r;
			}, 
			function (err) {				
				// also store any error
				vp.error = err; // maybe we should store err.statusText? Nah, this is a wrapper, lets just pass on whatever we get.
				vp.resolved = true;
				return err;
			});
		vp.promise = _promise;		
		return vp;
	}
	// It's a value - return now
	return {
		value: valueOrPromise,
		resolved: true,
		promise: Promise.resolve(valueOrPromise)
	};
};

export default pv;
