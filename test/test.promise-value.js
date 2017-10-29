
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
