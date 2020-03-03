# promise-value

A tiny wrapper for Promise to carry a promise and (if known) a value, plus a resolved flag.

This makes it easy to bridge between async promise-based code, and single-thread code.

Use-cases: e.g. within a React render() function.

### Example code

	import pv from 'promise-value';

	// Make from a promise, e.g. an ajax call
	let pvAjax = pv($.get("https://bbc.co.uk"));
	
	console.log(pvAjax.resolved, " = false");

	// You can add a then() handler
	pvAjax.promise.then(function(result) {
		console.log("Web-page get promise resolved", result);
	});

	// Error handling? just check pvAjax.error

	// Or you can make a PromiseValue directly from a value
	let pvInstant = pv("hello");
	
	console.log(pvInstant.resolved, " = true");
	
	// once a promise resolves, you can get the value. Until then value is null.
	console.log(pvInstant.value);

	pvInstant.promise.then(function(result) {
		console.log("Instant Promise resolved to: "+result);
	});


### React Example: Using PromiseValue to manage web requests inside a render function

	import pv from 'promise-value';

	const MyAjaxWidget = () => {
		// What is the state?
		let [pvMyAjaxData, setpvMyAjaxData] = useState();
		if ( ! pvMyAjaxData) {
			// Start the ajax call!
			const pAjax = $.get("http://mysite.com/endpoint?foo=blah");
			pvMyAjaxData = pv(pAjax);
			setpvMyAjaxData(pvMyAjaxData);
		}
		// Has the web request come back?
		if ( ! pvMyAjaxData.resolved) {
			// ...no -- return a spinner
			return <span class='spinner'>Loading...</span>;
		}
		// ...yes! We have data
		const myAjaxData = pvMyAjaxData.value;
		return <div>Lovely data! {JSON.stringify(myAjaxData)}</div>;
	};


## Documentation

function pv(valueOrPromise)

@param {*} valueOrPromise 
@returns {value: ?Object, promise: !Promise, error: ?Object, resolved: boolean} 

The return is never null, and the promise part is always set.
The behaviour depends on valueOrPromise:

 - If it's a value -> resolved Promise
 - If it's a Promise (or thenable) -> the input Promise
 - null/undefined -> rejected Promise

The `value` and `error` properties will be set instantly if known, and otherwise auto-set when the promise resolves.
The `resolved` flag records the promise status, and changes to true once the promise is resolved.
