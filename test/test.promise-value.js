
SJTest.run({name:'PromiseValue: value',
	
	function() {
		let a = pv(7);
		assert(a.value===7, a);
		assert(a.promise.then);
		return "OK";
	}

});

SJTest.run({name:'PromiseValue: reject (fail)',

function() {
	let a = pv(undefined);
	assert( ! a.value, a);
	assert(a.promise.then);
	return "OK";
}

});
