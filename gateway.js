/**
 * JSONGateway
 * This is not a required file. It's just a simple class to connect front end to back end methods.
 * Very simple jQuery ajax JSON Get and Post wrapper
**/

// static service base endpoints
var serviceBase = 'http://www.mysite.com/MyService.svc/Json/';

function JSONGateway(base, cache) {

	this.serviceBase = base;
	this.cache = cache;
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

//
JSONGateway.prototype.doFail = function(jqXHR, textStatus, errorThrown) {
	alert('Error : ' + textStatus + ' - ' + errorThrown);
}
