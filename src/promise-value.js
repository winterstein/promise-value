
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
		const vp = {promise:valueOrPromise, resolved:false};
		// set the value when we have it
		valueOrPromise.then(r => {
			vp.value = r;
			vp.resolved = true;
			return r;
		});
		// also store any error
		if (typeof(valueOrPromise.fail) === 'function') {		
			valueOrPromise.fail(err => {
				vp.error = err;
				vp.resolved = true;
				return err;
			});
		}
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
