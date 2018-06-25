
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

SJTest.run({'PromiseValue: chain on fail':
	function() {
		let ajaxGet = $.get("http://fdasjhfsd.hfjds.com/dasyuthj")
		let pvAjaxGet = pv(ajaxGet);
		let promise2 = pvAjaxGet.promise.then(ok => {
			console.error("Not OK!", ok);
			return ok;
		}).catch(bad => {
			console.warn("bad", bad);
			throw bad;
		});
		let pv2 = pv(promise2);
		pv2.promise.then(ok => {
			console.error("Level 2: Not OK!", ok);
			return ok;
		}).catch(bad => {
			console.warn("Level 2 bad", bad);
			throw bad;
		});
	}
});
