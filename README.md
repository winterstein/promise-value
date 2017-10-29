# promise-value

A tiny wrapper for Promise to carry a promise and (if known) a value, plus a resolved flag.

This makes it easy to bridge between async promise-based code, and single-thread code.

Use-cases: e.g. within a React render() function.

Example code:

	import pv from 'promise-value';

	// Make from a promise, e.g. an ajax call
	let pAjax = pv($.get("https://bbc.co.uk"));
	
	console.log(pAjax.resolved);
	pAjax.promise.then(function(result) {
		console.log("Web-page get promise resolved", result);
	});


	// Or make from a value
	let pInstant = pv("hello");

	console.log(pInstant.value);
	console.log(pInstant.resolved);
	pInstant.promise.then(function(result) {
		console.log("Instant Promise resolved to: "+result);
	});


Documentation:

function pv(valueOrPromise)

@param {*} valueOrPromise 
@returns {value: ?Object, promise: !Promise, error: ?Object, resolved: boolean} 

The return is never null, and the promise part is always set.
The behaviour depends on valueOrPromise:

 - If it's a value -> resolved Promise
 - If it's a Promise (or thenable) -> the input Promise
 - null/undefined -> rejected Promise

The `value` and `error` properties will be set instantly if known, and otherwise set when the promise resolves.
The `resolved` flag records the promise status, and changes to true once the promise is resolved.





