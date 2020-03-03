# promise-value

A tiny wrapper for Promise to carry a promise and (if known) a value, plus a resolved flag.

This makes it easy to bridge between async promise-based code, and single-thread code.

Use-cases: e.g. within a React render() function.

### Example code

	import PromiseValue from 'promise-value';

	// Make from a promise, e.g. an ajax call
	let pvAjax = new PromiseValue($.get("https://bbc.co.uk"));
	
	console.log(pvAjax.resolved, " = false");

	// You can add a then() handler
	pvAjax.promise.then(function(result) {
		console.log("Web-page get promise resolved", result);
	});

	// Error handling? just check pvAjax.error

	// Or you can make a PromiseValue directly from a value
	let pvInstant = new PromiseValue("hello");
	
	console.log(pvInstant.resolved, " = true");
	
	// once a promise resolves, you can get the value. Until then value is null.
	console.log(pvInstant.value);

	pvInstant.promise.then(function(result) {
		console.log("Instant Promise resolved to: "+result);
	});


### React Example: Using PromiseValue to manage web requests inside a render function

	import React, {useState} from 'react';
	import PromiseValue from 'promise-value';
	import $ from 'jquery';

	const MyAjaxWidget = () => {
		// What is the state?
		let [pvMyAjaxData, setpvMyAjaxData] = useState();
		// Hack: a dummy state var to trigger a react update
		let [dummy, setDummy] = useState();
		if ( ! pvMyAjaxData) {
			// Start the ajax call
			const pAjax = $.get("https://mysite.com/endpoint?foo=blah");		
			pvMyAjaxData = new PromiseValue(pAjax);
			setpvMyAjaxData(pvMyAjaxData); // Update the state, so we won't keep calling the server
			// trigger a react render when the response comes back (inc on error)
			pAjax.then(() => setDummy(":)"), () => setDummy(":("));
		}
		// Has the web request come back?
		if ( ! pvMyAjaxData.resolved) {
			// ...no -- return a spinner
			return <div className='spinner'>Loading...</div>;
		}
		// Error handling
		if (pvMyAjaxData.error) return <div>Web Request Failed :( {JSON.stringify(pvMyAjaxData.error)}</div>;
		// yes! We have data
		return <div>Lovely data! {JSON.stringify(pvMyAjaxData.value)}</div>;
	};

## Documentation

	class PromiseValue {
		/** @type {!Promise} */
		promise;
		/** @type {!boolean} */
		resolved;
		/** @type {?Object} */
		value;
		/** @type {?Error} */
		error;
	}

Call it like this: `new PromiseValue(x)` where `x` can be a Promise or a value.

The promise part of a PromiseValue is always set. The behaviour depends on the input `x`:

 - If it's a value -> you'll have a resolved Promise
 - If it's a Promise (or thenable) -> the input Promise
 - null/undefined -> rejected Promise

The `value` and `error` properties will be set instantly if known, and otherwise auto-set when the promise resolves.
The `resolved` flag records the promise status, and changes to true once the promise is resolved.
