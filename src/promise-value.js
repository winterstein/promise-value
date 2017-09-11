
/**
 * 
 * @param {*} valueOrPromise 
 * @returns {value: ?Object, promise: !Promise} The return is never null, and the promise part is always set.
 * 	The behaviour depends on valueOrPromise:
 * 	If it's a value -> resolved Promise
 * * 	If it's a Promise (or thenable) -> the input Promise
 * 	null/undefined -> rejected Promise
 */
function pv(valueOrPromise) {
	if (valueOrPromise===null || valueOrPromise===undefined) {
		return {
			promise: Promise.reject(new Error("null value"))
		};
	}
	// NB: Promise.resolve() can be used with Promises without nesting	
	if (typeof(valueOrPromise.then) === 'function') {		
		// Having then() is the only real requirement for a Promise
		const vp = {promise:valueOrPromise};
		// set the value when we have it
		valueOrPromise.then(r => {
			vp.value = r;
			return r;
		});
		return vp;	
	}
	// It's a value - return now
	return {
		value: valueOrPromise,
		promise: Promise.resolve(valueOrPromise)
	};
};

export default pv;
