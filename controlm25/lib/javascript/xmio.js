XMIO = {};

var WEB_SERVICE_URL;
var INITIATOR;
var PASSWORD;

(function(){
	var javaPkgs = new JavaImporter(
			com.alarmpoint.integrationagent.script.api,
			com.alarmpoint.integrationagent.security,
			com.alarmpoint.integrationagent.exceptions.retriable
	);
	
	with (javaPkgs) {
		var httpClient = new IntegrationServiceHttpClient();
		XMIO.http = httpClient;
		
		XMIO.decryptFile = function(path) {
			return EncryptionUtils.decrypt(new java.io.File(path));
		}

		XMIO.post = function(jsonStr, url, username, password) {
			return execute('POST', jsonStr, url, username, password);
		}
		
		XMIO.put = function(jsonStr, url, username, password) {
			return execute('PUT', jsonStr, url, username, password);
		}

		XMIO.get = function(url, username, password) {
			return execute('GET', null, url, username, password);
		}

		function execute(method, jsonStr, url, username, password) {
			var urL = url === undefined ? WEB_SERVICE_URL : url,
				    user = username === undefined ? INITIATOR : username,
				    pwd = password === undefined ? XMIO.decryptFile(PASSWORD) : password;

			XMIO.http.setUrl(urL);
			XMIO.http.setCredentials(user, pwd);
			
			if (method !== 'GET') {
				XMIO.http.addHeader('Content-Type', 'application/json');
			}
			    
			var resp;
			if (method === 'POST') {
				//ServiceAPI.getLogger().debug("POST to: {0} with payload: {1}", urL, jsonStr);
				resp = XMIO.http.post(jsonStr);
			}
			else if (method === 'PUT') {
				//ServiceAPI.getLogger().debug("PUT to: {0} with payload: {1}", urL, jsonStr);
				resp = XMIO.http.put(jsonStr);
			}
			else if (method === 'GET') {
				//ServiceAPI.getLogger().debug("GET from: {0}", urL);
				resp = XMIO.http.get();
			}
			
			var response = {};
			response.status = resp.getStatusLine().getStatusCode();
			response.body = XMIO.http.getResponseAsString(resp); 
				
	        XMIO.http.releaseConnection(resp);
			//ServiceAPI.getLogger().info("xMatters response code: {0} and payload: {1}", response.status, response.body);
			return response;
		}
	}
})();