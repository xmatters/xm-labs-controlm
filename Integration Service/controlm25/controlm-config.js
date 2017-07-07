var DELETE_EXISTING_EVENTS = true;
var DEDUPLICATOR_FILTER = "controlm";

var CONTROL_M_USER = "emuser";
var CONTROL_M_HOST_NAME = "VIC-VM-CTRL-M";
var CONTROLM_PASSWORD_FILE = "conf/arwbmccontrolm";

// Specifies how many retries to preform if a error in the API occurs
// This is also used for API timeouts to perform a re-connect for the API
var API_NUMBER_OF_RETRIES = 3;

// API properties
var CTMEMAPI_PROPERTIES_FILE = "integrationservices/controlm25/ctmemapi.properties";
var JACORB_PROPERTIES_FILE = "integrationservices/controlm25/jacorb.properties";
var AUTHORIZATION_REQUEST_MAJOR_CODE = "407";
var AUTHORIZATION_REQUEST_MINOR_CODE = "1";

// Configuration for the amount of time to sleep between receiving a SHOUT Message and making the callback to the Control-M API for the job details
var SLEEP_PERIOD_BETWEEN_CALLBACK = 3000; // 3 seconds in milliseconds




// ----------------------------------------------------------------------------------------------------
// Configuration information for the xMatters instance the service will target
// The protocol (http or https) and domain name are required.
// ----------------------------------------------------------------------------------------------------
var XMATTERS_PROTOCOL = "https";
var XMATTERS_HOST = "adamwatson.eu1.xmatters.com";

//ARW
// ----------------------------------------------------------------------------------------------------
// These values determine the Integration Builder Entry Point used to inject events into
// xMatters. They are used to construct URLs for REST Web service requests
// URL encoding is not required
// ----------------------------------------------------------------------------------------------------
var XMATTERS_IB_INBOUND_INTEGRATIONS = {
	"CMDRESULT":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"JOB ENDED NOT OK":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"JOB RUNS TOO LONG":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"JOB COMPLETED TOO FAST":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"ENDED NOT OK":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"RUNS TOO LONG":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"COMPLETED TOO FAST":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers",
	"AGENTFAILURE":"reapi/2015-04-01/forms/fcda8ba2-b965-4d7c-905f-696f88f5fb0c/triggers"
};

var XMATTERS_IB_USE_WHEN_NO_MATCH = "AGENTFAILURE";
var XMATTERS_REB_CMDRESULT_FORM = "CMDRESULT";

// ----------------------------------------------------------------------------------------------------
// The maximum size of a text property in xMatters
// ----------------------------------------------------------------------------------------------------
var XMATTERS_MAX_TEXT = 20000;

var REAPI_COMPANY_NAME = 'ADAM WATSON';

var REST_USER = 'controlm.rest';
var REST_PASS_FILE = 'conf/arwcontrolmrest.pwd';

// If there is an empty string for the Proxy Host the proxy config will be skipped
var XMATTERS_PROXY_HOST = '';
var XMATTERS_PROXY_PORT = '8080';
var XMATTERS_PROXY_USER = '';
var XMATTERS_PROXY_USER_PWD_FILE = '';
var XMATTERS_PROXY_NTLM_DOMAIN = '';
