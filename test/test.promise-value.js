
// Hm - I cant get this to work with npm export style pv.
// const { default: PromiseValue } = require("../src/promise-value");

const pv = PromiseValue;

SJTest.run({
	'PromiseValue: pending - OK': () => {
		let a = pv.pending();
		assert( ! a.value, a);
		assert( ! a.resolved);
		
		a.resolve("OK");

		assert(a.resolved);
		assert(a.value, a);		
		return "OK";
	}
});


SJTest.run({
	'PromiseValue: pending - reject': () => {
		let a = pv.pending();
		assert( ! a.value, a);
		assert( ! a.resolved);
		
		a.reject(new Error("Boo"));

		assert(a.resolved);
		assert(a.error, a);	
		assert( ! a.value, a);
		return "OK";
	}
});


SJTest.run({'PromiseValue: value':
	function() {
		let a = new pv(7);
		assert(a.value===7, a);
		assert(a.promise.then);
		return "OK";
	}
});

SJTest.run({'PromiseValue: reject (fail)':
	function() {
		let a = new pv(undefined);
		assert( ! a.value, a);
		assert(a.promise.then);
		return "OK";
	}
});

SJTest.run({
	'PromiseValue: resolved':
	function() {
		let a = new pv("123");
		assert(a.resolved, a);
	}
});

SJTest.run({'PromiseValue: chain on resolved':
	function() {
		let p = $.get("https://bbc.co.uk");
		let a = new pv(p);
		assert( ! a.value, a);
		assert( ! a.resolved);
		assert(a.promise.then);
		a.promise.always(r => {
			assert(a.resolved);
			console.log("resolved :)", r, a.value, a.error);
			return ":)";
		});
		return "...";
	}
});


SJTest.run({'PromiseValue: conveniently chain on resolved':
	function() {
		let p = $.get("https://bbc.co.uk");
		let a = new pv(p);
		assert( ! a.value, a);
		assert( ! a.resolved);
		assert(a.promise.then);
		let b = PromiseValue.then(a, r => {
			assert(a.resolved);
			console.log("resolved :)", r, a.value, a.error);
			return ":)";
		}, r => {
			assert(a.resolved);
			console.log("no BBC :(", r, a.value, a.error);
			return ":/";
		});
		return "...";
	}
});


SJTest.run({'PromiseValue.then: already resolved':
	function() {
		let v = "Hello";
		let a = new pv(v);
		assert( a.value, a);
		assert( a.resolved);
		assert(a.promise.then);
		let b = PromiseValue.then(a, r => {
			assert(a.resolved);
			console.log("resolved :)", r, a.value, a.error);
			return ":)";
		}, r => {
			assert(a.resolved);
			console.log("no go :(", r, a.value, a.error);
			return ":/";
		});
		assert(b.resolved);
		assert(b.value === ":)");
		let b2 = PromiseValue.then(a, r => {			
			return "AGAIN :)";
		}, r => {
			return "AGAIN :/";
		});
		assert(b === b2);
		assert(b.value === ":)");
		return b.value;
	}
});

SJTest.run({'PromiseValue: chain on fail':
	function() {
		let ajaxGet = $.get("http://fdasjhfsd.hfjds.com/dasyuthj")
		let pvAjaxGet = new pv(ajaxGet);
		let promise2 = pvAjaxGet.promise.then(ok => {
			console.error("Not OK!", ok);
			return ok;
		}).catch(bad => {
			console.warn("bad", bad);
			throw bad;
		});
		let pv2 = new pv(promise2);
		pv2.promise.then(ok => {
			console.error("Level 2: Not OK!", ok);
			return ok;
		}).catch(bad => {
			console.warn("Level 2 bad", bad);
			throw bad;
		});
	}
});


SJTest.run({'PromiseValue: Double Wrap':
	function() {
		let pv = PromiseValue.pending();
		let pv2 = new PromiseValue(pv);
		pv.resolve(":)");
		return pv2.value;
	}
});
