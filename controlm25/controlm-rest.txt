// Functions to support REST API calls from the Integration Agent

function apia_input_reb(apxml)
{
  ServiceAPI.getLogger().debug("Sending to xMatters via REB.");

  var wsutil = new xMattersWS();

  // These need to be constructed as Strings because they are coming in as
  // byte arrays, and JSON.stringify() does not know how to serialize these.
  var recipients = new String(apxml.getValue("recipients"));
  var incident_id = new String(apxml.getValue("order_id"));
  var event_type =  new String(apxml.getValue("event_type"));
  ServiceAPI.getLogger().debug("apia_input_reb - event_type: " + event_type);

  var job_name = new String(apxml.getValue("job_name"));

  // Drive xMatters priority based on Control-M job priority value
  var priority = new String(apxml.getValue("priority"));
  if (priority.equalsIgnoreCase("very high"))
  {
    var xm_priority = "high";
  }
  else if (priority.equalsIgnoreCase("high"))
  {
    var xm_priority = "high";
  }
  else if (priority.equalsIgnoreCase("medium"))
  {
    var xm_priority = "medium";
  }
  else if (priority.equalsIgnoreCase("low"))
  {
    var xm_priority = "low";
  }
  else if (priority.equalsIgnoreCase("very low"))
  {
    var xm_priority = "low";
  }
  else
  {
    var xm_priority = "low";
  }

  var order_id = new String(apxml.getValue("order_id"));
  var message = new String(apxml.getValue("message"));
  ServiceAPI.getLogger().debug("apia_input_reb - message: " + message);

  if (event_type.equalsIgnoreCase("INITIALINJECTION"))
  {
    var ticket_number = new String(apxml.getValue("ticket_number"));
    var control_m = new String(apxml.getValue("control_m"));
    var rba = new String(apxml.getValue("rba"));
    var table_rba = new String(apxml.getValue("table_rba"));
    var application = new String(apxml.getValue("application"));
    var application_type = new String(apxml.getValue("application_type"));
    var group = new String(apxml.getValue("group"));
    var mem_name = new String(apxml.getValue("mem_name"));
    var mem_lib = new String(apxml.getValue("mem_lib"));
    var order_table = new String(apxml.getValue("order_table"));
    var owner = new String(apxml.getValue("owner"));
    var description = new String(apxml.getValue("description"));
    var task_type = new String(apxml.getValue("task_type"));
    var time_zone = new String(apxml.getValue("time_zone"));
    var in_BIM_service = new String(apxml.getValue("in_BIM_service"));
    var job_status = new String(apxml.getValue("job_status"));
    var job_state = new String(apxml.getValue("job_state"));
    var state_digits = new String(apxml.getValue("state_digits"));
    var group = new String(apxml.getValue("group"));
    var odate = new String(apxml.getValue("odate"));
    var otime = new String(apxml.getValue("otime"));
    var next_time = new String(apxml.getValue("next_time"));
    var rerun_counter = new String(apxml.getValue("rerun_counter"));
    var average_runtime = new String(apxml.getValue("average_runtime"));
    var start_time = new String(apxml.getValue("start_time"));
    var end_time = new String(apxml.getValue("end_time"));
    var critical = new String(apxml.getValue("critical"));
    var cyclic = new String(apxml.getValue("cyclic"));
    var emergency = new String(apxml.getValue("emergency"));
    var time_from = new String(apxml.getValue("time_from"));
    var time_until = new String(apxml.getValue("time_until"));
  }
  else
  {
    var job_request = new String(apxml.getValue("job_request"));
    ServiceAPI.getLogger().debug("apia_input_reb - job_request: " + job_request);
  }

  var restServer = getXmattersRestServer();


  // If we can determine the integration agent's ID and include it in the
  // user agent string, xMatters will attempt to target this particular
  // Integration Agent in its callback if there happen to be two or more.
  var myId = getIntegrationAgentId();

  var headers = new HashMap();
  headers.put('Content-Type', 'application/json');
  headers.put('Connection', 'keep-alive');
  if (myId != null) {
    ServiceAPI.getLogger().debug("apia_input_reb - Targeting IA by ID: " + myId);
    // The user agent string must include 'xMattersIntegrationAgent' with the ID in
    // parentheses.
    headers.put('User-Agent', 'xMattersIntegrationAgent (' + myId + ')');
  }

  if (event_type.equalsIgnoreCase("INITIALINJECTION"))
  {
    var requestBody = {
      'properties' : {
        'ticket_number' : ticket_number,
        'Control-M Server' : control_m,
        'Order ID' : order_id,
        'rba' : rba,
        'table_rba' : table_rba,
        'Application' : application,
        'Application Type' : application_type,
        'Group' : group,
        'Job Name' : job_name,
        'Script Name' : mem_name,
        'mem_lib' : mem_lib,
        'Order Table' : order_table,
        'Owner' : owner,
        'Job Description' : description,
        'Task Type' : task_type,
        'Time Zone' : time_zone,
        'In BIM Service' : in_BIM_service,
        'Job Status' : job_status,
        'State Digits' : state_digits,
        'Order Date' : odate,
        'Order Time' : otime,
        'Next Time' : next_time,
        'Rerun Count' : rerun_counter,
        'Average Runtime' : average_runtime,
        'Start Time' : start_time,
        'End Time' : end_time,
        'Critical' : critical,
        'Cyclic' : cyclic,
        'Emergency' : emergency,
        'Time From' : time_from,
        'Time Until' : time_until,
        'Message' : message
      },
      'recipients' : [
        {'targetName' : recipients }
      ],
      'priority' : xm_priority,
      'callbacks' : [
        {"url": "ia://controlm" + INT_VERSION, "type": "status"},
        {"url": "ia://controlm" + INT_VERSION, "type": "deliveryStatus"},
        {"url": "ia://controlm" + INT_VERSION, "type": "response"}
      ]
    };

    var form = XMATTERS_IB_INBOUND_INTEGRATIONS[message.toUpperCase()];
    if (form && form !== undefined && form.length > 0)
    {
	     ServiceAPI.getLogger().debug("apia_input_reb - Found form: " + form);
    } else {
       form = XMATTERS_IB_INBOUND_INTEGRATIONS[XMATTERS_IB_USE_WHEN_NO_MATCH];
       ServiceAPI.getLogger().debug("apia_input_reb - Could not find form based on message, using " + XMATTERS_IB_USE_WHEN_NO_MATCH + " as a default : " + form);
    }

  }  else  {    //else for   if (event_type.equalsIgnoreCase("INITIALINJECTION"))
    var requestBody = {
      'properties' : {
        'Job Name' : job_name,
        'Order ID' : order_id,
        'Command Executed' : job_request,
        'Result' : message
      },
      'recipients' : [
        {'targetName' : recipients }
      ],
      'callbacks' : [
        {"url": "ia://controlm" + INT_VERSION, "type": "status"},
        {"url": "ia://controlm" + INT_VERSION, "type": "deliveryStatus"},
        {"url": "ia://controlm" + INT_VERSION, "type": "response"}
      ]
    };

	var form = XMATTERS_IB_INBOUND_INTEGRATIONS[XMATTERS_REB_CMDRESULT_FORM];
	ServiceAPI.getLogger().debug("apia_input_reb - Using CMDRESULT : " + form);
  }   //end of    if (event_type.equalsIgnoreCase("INITIALINJECTION"))

  ServiceAPI.getLogger().debug("apia_input_reb - REST request targeting " + restServer.protocol + "://" + restServer.host + ":" + restServer.port + "/" + form);
  ServiceAPI.getLogger().debug("apia_input_reb - REST request user: " + REST_USER);
  ServiceAPI.getLogger().debug("apia_input_reb - REST request payload: " + JSON.stringify(requestBody));

//  var response = wsutil.restSendReceive(restServer.protocol, restServer.host, restServer.port, form,
//    REST_USER, REST_PASS, 'POST', JSON.stringify(requestBody), headers);

// Added for proxy server configuration during POST call
  if ( XMATTERS_PROXY_HOST != '' )  {
    XMIO.http.setCredentials( XMATTERS_PROXY_USER, XMIO.decryptFile(XMATTERS_PROXY_USER_PWD_FILE) );
    XMIO.http.setProxy(XMATTERS_PROXY_HOST, XMATTERS_PROXY_PORT, XMATTERS_PROXY_USER, XMIO.decryptFile(XMATTERS_PROXY_USER_PWD_FILE), XMATTERS_PROXY_NTLM_DOMAIN);
    ServiceAPI.getLogger().debug("apia_input_reb - Proxy configuration set: " + XMATTERS_PROXY_USER + ":<password>@" + XMATTERS_PROXY_HOST + ":" + XMATTERS_PROXY_PORT);
  }

  var response = XMIO.post(JSON.stringify(requestBody), 'https://'+restServer.host+':443/'+form, REST_USER, XMIO.decryptFile(REST_PASS_FILE) );


  ServiceAPI.getLogger().debug("apia_input_reb - REST response: " + response.body);

  return;
}

/**
 * Gets the server properties object
 */
function getXmattersRestServer() {

  if (typeof(XMATTERS_PORT) != 'undefined') {
    var myport = XMATTERS_PORT;
  } else {
    var myport = (XMATTERS_PROTOCOL == 'https') ? 443 : 80;
  }

  return {
    'protocol' : XMATTERS_PROTOCOL,
    'host' : XMATTERS_HOST,
    'port' : myport
  };
}

function getIntegrationAgentId() {
  // If iaConfig has been defined, we can read the IA's ID from it and use it as the User-Agent header.
  // You need to have instantiated an object of type xMattersWS before calling this function for the
  // iaConfig to be available.
  if (typeof(iaConfig) != 'undefined') {
    try {
      var iaId = iaConfig.getId();
      if (iaId != "") {
          return iaId;
      }
    } catch (e) {
      // We couldn't get the ID for some reason.
    }
  }
  return null;
}



/**
 * The main routine for handling Requests starts here.
 * <p>
 * Throw an exception that will be logged by the Integration Agent.
 */
function handleSendRest(apxml)
{

  ServiceAPI.getLogger().debug("APXML received: " + new String(apxml));
  var result = null;

  var callbackType = apxml.getValue("xmatters_callback_type");
  var incidentId = apxml.getToken("incident_id").getValue();

  if (callbackType == "status") {
    result = handleCalloutAnnotate(callbackType, apxml);
  } else if (callbackType == "response") {
    result = handleApsResponses(apxml);
  } else if (callbackType == "deliveryStatus") {
    var deliveryStatus = apxml.getValue("deliverystatus");
    result = handleCalloutAnnotate(callbackType, apxml);
  } else {
    result = ServiceAPI.getLogger().error("Unknown or unspecified callback type: " + callbackType);
  }

  ServiceAPI.getLogger().debug("Exit - handleSendRest");
  return;
}

/**
 * The REB form "eventProperties" member is passed as "additionalTokens" in the IA version
 * of a callback.  This is a serialized XML hash map.
 *
 * This function will convert the additionalTokens into a single JavaScript
 * object whose keys/values correspond to the properties in the map.
 */
function getEventProperties(apxml) {

  var evProps = apxml.getValue("additionalTokens");

  // deserialize the additional tokens
  if (evProps != null && evProps != "") {
    var addTokensLinkedHashMap = xStream.fromXML(evProps);
  } else {
    var addTokensLinkedHashMap = new HashMap();
  }

  var obj = {};
  var keyIterator = addTokensLinkedHashMap.keySet().iterator();
  while (keyIterator.hasNext()) {
    key = keyIterator.next();
    obj[key] = addTokensLinkedHashMap.get(key);
  }

  return obj;
}
