/**
 * Make a bag of string constants, kind of like a Java enum.
 * e.g. var MyKind = new Enum('TEXT PERSON');
 * gives you MyKind.TEXT == 'TEXT', MyKind.PERSON == 'PERSON'
 *
 * Also, each of the constants has an isCONSTANT() function added, so you can write:
 * MyKind.isTEXT(myvar) -- which has the advantage that it will create a noisy error if
 * if myvar is invalid (e.g. it helps catch typos). isCONSTANT() allows falsy values, but an unrecognised
 * non-false value indicates an error.
 *
 * MyKind.values holds the full list (and is frozen to keep it safe from edits).
 *
 * MyKind.has(thing) provides a test, true if thing is a valid value.
 * 
 * Use-case: It's safer than just using strings for constants, especially around refactoring.
 * It does use strings, because you want to work with json.
 *
 * @author Daniel
 * Ref: http://stijndewitt.wordpress.com/2014/01/26/enums-in-javascript/
 */
class Enum {

	/** @param values {string|string[]}
	*/
	constructor(values) {
		// Set the values array
		if (typeof(values)==='string') {
			this.values = values.split(' ');
		} else {
			this.values = values;
		}
		for(let i=0; i<this.values.length; i++) {
			let k = this.values[i];
			this[k] = k;
			/** isCONSTANT: {string} -> {boolean} */
			this['is'+k] = function(v) {
				if ( ! v) return false;
				if ( ! this.enumerator[v]) throw new Error('Invalid Enum value: '+v);
				return v===this.k;
			}.bind({enumerator:this, k:k});
			/** $CONSTANT: {string} -> {string} safety accessor */
			this['$'+k] = () => k;
		}		
		// Prevent edits
		if (Object.freeze) {
			Object.freeze(this);
			Object.freeze(this.values);
		}
	}

	/**
	 * @param s {string}
	 * @returns true if s is a value of this enum, false otherwise.
	 * Use-case: assert(has(someInput));
	 */
	has(s) {
		return this.values.indexOf(s) != -1;
	}	
}

export default Enum;
