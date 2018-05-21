
SJTest.run({'PromiseValue: value':
	function() {
		let a = pv(7);
		assert(a.value===7, a);
		assert(a.promise.then);
		return "OK";
	}
});

SJTest.run({'PromiseValue: reject (fail)':
	function() {
		let a = pv(undefined);
		assert( ! a.value, a);
		assert(a.promise.then);
		return "OK";
	}
});

SJTest.run({
	'PromiseValue: resolved':
	function() {
		let a = pv("123");
		assert(a.resolved, a);
	}
});

SJTest.run({'PromiseValue: chain on resolved':
	function() {
		let p = $.get("https://bbc.co.uk");
		let a = pv(p);
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
