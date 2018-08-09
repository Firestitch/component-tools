"use strict";

const fnArgs = require('fn-args')

var toString = Object.prototype.toString;

function all(description, dataset, fn) {
	return createDataDrivenSpecs(it, description, dataset, fn, true);
}

function xall(description, dataset, fn) {
	return createDataDrivenSpecs(xit, description, dataset, fn, true);
}

function using(description, dataset, fn) {
	return createDataDrivenSpecs(describe, description, dataset, fn, false);
}

function xusing(description, dataset, fn) {
	return createDataDrivenSpecs(xdescribe, description, dataset, fn, false);
}

function createSyncDataDrivenFn(args, fn) {
	return function synchronousSpec() {
		fn.apply(this, args);
	};
}

function createAsyncDataDrivenFn(args, fn) {
	return function asynchronousSpec(done) {
		var fnArgs = [done];
		fnArgs.unshift.apply(fnArgs, args);
		fn.apply(this, fnArgs);
	};
}

function createVariantDescription(description, args, index) {
	// var variantDesc = description + " (Variant #" + index + " <",
	//     i = 0, length = args.length, x;

	// for (i; i < length; i++) {
	// 	if (i > 0) {
	// 		variantDesc += ", ";
	// 	}

	// 	if (typeof args[i] === "string") {
	// 		variantDesc += '"' + args[i] + '"';
	// 	}
	// 	else if (isArray(args[i])) {
	// 		variantDesc += toString.call(args[i]);
	// 	}
	// 	else {
	// 		variantDesc += String(args[i]);
	// 	}
	// }

	// variantDesc += ">)";

	// return variantDesc;
	return `${description} | Variant #${index}: ${JSON.stringify(args)}`
}


function parseDataObj(data, testFunc) {
	let res = [];
	for(let pName of fnArgs(testFunc)) {
		const prop = data[pName];
		if(!prop)
			throw error(`Jasmine.ArgumentsMissingError: expected value ${pName}`);
		res.push(prop);
	}
	return res;
}

function createDataDrivenSpecs(specProvider, description, dataset, fn, isAsyncAllowed) {
	let i = 0,
	    length = 0,
	    specs = [],
	    args,
	    //maxArgCount = 0,
	    variantDesc,
	    suite;

	// if (!dataset || !isArray(dataset) || dataset.length === 0) {
	// 	throw error("Jasmine.ArgumentsMissingError", "No arguments for a data-driven test were provided ({0})", description);
	// }

	// Validate the dataset first
	// for (i, length = dataset.length; i < length; i++) {
	// 	args = isArray(dataset[i]) ? dataset[i] : [dataset[i]];
	// 	maxArgCount = maxArgCount || args.length;
	// 	variantDesc = createVariantDescription(description, args, i);

	// 	if (args.length !== maxArgCount) {
	// 		throw error("Jasmine.ArgumentCountMismatchError",
	// 			"Expected {0} argument(s). Found {1} at index {2} ({3})",
	// 			maxArgCount, args.length, i, description);
	// 	}
	// 	else if (args.length === fn.length) {
	// 		specs.push({
	// 			description: variantDesc,
	// 			fn: createSyncDataDrivenFn(args, fn)
	// 		});
	// 	}
	// 	else if (isAsyncAllowed && args.length + 1 === fn.length) {
	// 		specs.push({
	// 			description: variantDesc,
	// 			fn: createAsyncDataDrivenFn(args, fn)
	// 		});
	// 	}
	// 	else {
	// 		throw error("Jasmine.ArgumentCountMismatchError",
	// 			"Expecting data driven spec to accept {0} {1}, but {2} {3} specified in the callback function ({4})",
	// 			args.length,
	// 			args.length === 1 ? "argument" : "arguments",
	// 			fn.length,
	// 			fn.length === 1 ? "argument is" : "arguments are",
	// 			description);
	// 	}
	// }

	if (!dataset) {
		throw error("Jasmine.ArgumentsMissingError", "No arguments for a data-driven test were provided ({0})", description);
	}
	let iter = dataset();
	// for (let dataObj of iter) {
	// 	args = parseDataObj(dataObj, fn);
	// 	variantDesc = createVariantDescription(description, dataObj, i++);
	// 	specs.push({
	// 					description: variantDesc,
	// 					fn: createSyncDataDrivenFn(args, fn)
	// 				});
	// }
	// // Create the suite and specs
	// suite = describe(description, function() {
	// 	for (i = 0, length = specs.length; i < length; i++) {
	// 		specProvider(specs[i].description, specs[i].fn);
	// 	}
	// });

	// return suite;

	for (let dataObj of iter) {
		args = parseDataObj(dataObj, fn);
		variantDesc = createVariantDescription(description, dataObj, i++);
		const testProc = createSyncDataDrivenFn(args, fn);
		specProvider(variantDesc, testProc);
	}
}

function isArray(x) {
	return toString.call(x) === "[object Array]";
}

function error(name, message) {
	var args = Array.prototype.slice.call(arguments, 2),
	    error;

	if (args && args.length) {
		message = message.replace(/\{(\d+)\}/g, function(match, index) {
			return args[Number(index)] || "";
		});
	}

	error = new Error(message);
	error.name = name;

	return error;
}

module.exports = {all, xall, using, xusing}
