var serviceBaseDEV = 'http://localhost:9345/IDMService.svc/Json/';
var serviceBasePROD = 'http://www.prod.com/IDMService.svc/json/'

function JSONGateway(base) {

	this.serviceBase = base;
}

// JSON GET Request
JSONGateway.prototype.getJsonAjax = function (method, callback, data)
{
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
		url: this.serviceBase + method + params,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: callback,
		error: this.doFail
	});
}

// JSON POST Request
JSONGateway.prototype.postJsonAjax = function (method, callback, dataBody)
{
	if (dataBody != null) {
		dataBody = JSON.stringify(dataBody);
	}

	jQuery.ajax({
		type: "POST",
		url: this.serviceBase + method,
		contentType: "application/json; charset=utf-8",
		data: dataBody,
		dataType: "json",
		success: callback,
		error: this.doFail
	});
}

//
JSONGateway.prototype.doFail = function (result) {
	alert('Error : ' + result.status + ' ' + result.statusText);
}

// generic error handler
//function doError(jqXHR, textStatus, errorThrown)
//{
//	alert(errorThrown);
//}
