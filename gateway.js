/**
 * JSONGateway
 * This is not a required file. It's just a simple class to connect front end to back end methods.
**/

// example static service base endpoint
var serviceBase = 'http://www.mysite.com/MyService.svc/Json/';

/**
 * JSONGateway
 * Very simple jQuery ajax JSON Get and Post wrapper
 * @param {string} base - service base path to all the service methods, will prefix the method
 * @param {bool} cache - to use ajax cache parameter or not
 */
function JSONGateway(base, cache) {

	this.serviceBase = base;
	this.cache = cache;
}

/**
 * JSON Request - generic GET or POST request where the type is specified as the last optional parameter
 * @param {string} method
 * @param {function} callback
 * @param {object} data
 * @param {string} type - GET or POST where POST is the default
 */
JSONGateway.prototype.requestJsonAjax = function (method, callback, data, type) {

	if (type == null || type.toLowerCase() != 'get') {
		this.postJsonAjax(method, callback, data);
		return;
	}

	this.getJsonAjax(method, callback, data);
}

/**
 * GET JSON Request
 * @param {string} method
 * @param {function} callback
 * @param {object} data
 */
JSONGateway.prototype.getJsonAjax = function (method, callback, data)
{
	// start the query string
	var params = '?';

	if (data != null) {

		var arr = [];

		for (var key in data) {
			if (data.hasOwnProperty(key)) {
				arr.push(key + '=' + data[key]);
			}
		};

		var result = arr.join('&');
		params += result;
	}

	jQuery.ajax({
		type: "GET",
		cache: this.cache,
		url: this.serviceBase + method + params,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: callback,
		error: this.doFail
	});
}

/**
 * POST JSON Request
 * @param {string} method
 * @param {function} callback
 * @param {object} dataBody
 */
JSONGateway.prototype.postJsonAjax = function (method, callback, dataBody)
{
	if (dataBody != null) {
		dataBody = JSON.stringify(dataBody);
	}

	jQuery.ajax({
		type: "POST",
		cache: this.cache,
		url: this.serviceBase + method,
		contentType: "application/json; charset=utf-8",
		data: dataBody,
		dataType: "json",
		success: callback,
		error: this.doFail
	});
}

/**
 * sync - takes a collection of remote call details and raises a final callback when all are complete
 * @param {array} calls - array of remote call definitions consisting of {method, callback, body, type}
 * @param {array} final - the final callback function when all calls are - returns array [{method, callack, body, monitor, results}]
 */
JSONGateway.prototype.sync = function (calls, final) {

	// set to true the first time the final call is made
	var done = false;

	calls.forEach(
		function (call) {
			call.monitor = false;
			this.requestJsonAjax(call.method,
				function (result, textStatus, jqXHR) {
					// update the call details
					call.monitor = true;
					call.results = result;

					// perform the individual callback
					if (call.callback != null)
					{ call.callback(result, textStatus, jqXHR); }

					// check is everyone is done
					if (calls.every(function (elem, idx, array) { return elem.monitor }) && !done) {
						done = true;
						final(calls);
					}
				},
				call.body, call.type);
		}, this);
}

//
JSONGateway.prototype.doFail = function(jqXHR, textStatus, errorThrown) {
	alert('Error : ' + textStatus + ' - ' + errorThrown);
}
