importPackage(java.lang);
importPackage(java.util);
importPackage(java.io);
importPackage(java.net);
importPackage(java.sql);
importClass(Packages.com.alarmpoint.integrationagent.apxml.APXMLMessage);
importClass(Packages.com.alarmpoint.integrationagent.apxml.APXMLMessageImpl);
importClass(Packages.com.alarmpoint.integrationagent.apxml.APXMLToken);
importClass(Packages.com.thoughtworks.xstream.XStream);
importClass(Packages.com.thoughtworks.xstream.converters.reflection.PureJavaReflectionProvider);

/* Created by Aaron Magi
 * Copyright 2013 xMatters
 */

var xStream = new XStream(new PureJavaReflectionProvider())
var INT_VERSION = "25";
var LOG_SOURCE = "controlm.js: ";

// Core Javascript files provided by the IA
load("integrationservices/controlm" + INT_VERSION + "/controlm-config.js");
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/core/baseclass.js");
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/core/logger.js");
this.log = new Logger(this.LOG_SOURCE);
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/webservices/wsutil.js");
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/webservices/soapfault.js");
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/xmatters/xmattersws.js");
load("integrationservices/controlm" + INT_VERSION + "/util.js");
load("integrationservices/controlm" + INT_VERSION + "/controlm-api.js");
load("integrationservices/controlm" + INT_VERSION + "/apia-lifecycle.js");

// Added to support REST API
load("integrationservices/controlm" + INT_VERSION + "/lib/javascript/xmio.js");
load("integrationservices/controlm" + INT_VERSION + "/controlm-rest.js")



var notePrefix = "[xMatters] ";  // The Prefix which is added to the note comments for AlarmPoint
var exceptionString = "JavaException: ";

var TOKEN_NAME = "apiaResult";
var TOKEN_NAME_EXCEPTION = "apiaResultException";

var CONTROL_M_PASS = getPassword(CONTROLM_PASSWORD_FILE);

/**
 * This is the main method for handling APXML messages sent to the
 * Integration Service by APClient.  The messages may be requests to perform
 * local activity, or they may be requests to make submissions to AlarmPoint.
 * <p>
 * Any APXMLMessage object that this method returns will be sent to AlarmPoint
 * via the Integration Service's outbound queues.
 */
function apia_input(apxml)
{
  var xmWebSerice = new xMattersWS();

  if (apxml.getValue("controlm_server") == null) {
    // Delete event
    var incidentId = apxml.getValue("shout_msg");
    ServiceAPI.getLogger().info(notePrefix + "Terminating xMatters incident " + incidentId);
    var submitted = xmWebSerice.sendDelAPXML(incidentId, apxml.getValue(APXMLMessage.APIA_PROCESS_GROUP), "normal");
    ServiceAPI.getLogger().info(notePrefix + "Request to terminate incident " + incidentId + " was " + (submitted ? "" : "not ") + "successful");
    return;
  }

  log.info("Sending to xMatters.");
  var xmWebSerice = new xMattersWS();

  //split the parameters up and store them into the proper tokens to be sent to xMatters
  var controlm_server = apxml.getToken("controlm_server").getValue();
  log.debug("controlm_server: " + controlm_server);
  var shoutMsg = apxml.getToken("shout_msg").getValue();
  log.debug("shoutMsg: " + shoutMsg);
  var tokens = shoutMsg.split(";");

  var orderId = tokens[0];

  apxml.setToken("order_id", orderId);
  log.debug("setting order_id to tokens[0]: " + orderId);
  apxml.setToken("incident_id", orderId);
  log.debug("setting incident_id to tokens[0]: " + orderId);
  apxml.setToken("recipients", tokens[1]);
  log.debug("setting recipients to tokens[1]: " + tokens[1]);
  if (tokens.length > 2) {
    apxml.setToken("message", tokens[2]);
    log.debug("setting message to tokens[2]: " + tokens[2]);
  } else {
    log.debug("NOT setting message, tokens[2] not provided.");
  }


  // Sleep period between receiving a SHOUT Message and making the callback to the Control-M API for the job details
  try {
      Thread.sleep(SLEEP_PERIOD_BETWEEN_CALLBACK);
  } catch(ex) {
      Thread.currentThread().interrupt();
  }

  // Get the job details from the Control-M API
  log.debug("About to request job details from Control-M.");
  var wsutil = new WSUtil();
  var processedResponse = controlmAPI.getJobDetailsForAPXML(orderId, apxml);
  log.debug("Queried API for job details and got : " + processedResponse);

  unmarshalledResponse = wsutil.unmarshall(processedResponse, newGenericObject());

  xmWebSerice.addEventTokensFromObject(apxml, unmarshalledResponse);

//  log.debug("(ARW) response start_time : " + unmarshalledResponse.start_time );
//  log.debug("(ARW) resault of apxml.getValue('start_time') : " + apxml.getValue("start_time") );
//  log.debug("(ARW) resault of convertTime(apxml.getValue'start_time')) : " + convertTime(apxml.getValue("start_time")) );

  // update times (start_time and end_time to be readable)
  apxml.setToken("start_time", convertTime(apxml.getValue("start_time")));
  apxml.setToken("end_time", convertTime(apxml.getValue("end_time")));

  apxml.setToken("event_type", "initialInjection");

  // call REST function to inject event into xMatters REB forms
  apia_input_reb(apxml);
  // Return null because we do not create an event through the IA.
  return null;

}

/**
 * This is the main method for handling APXML messages sent to the
 * Integration Service by AlarmPoint.  The messages may be responses to
 * previous submissions, or they may be requests to the Integration Service
 * that originate from AlarmPoint
 * (e.g., via an ExternalServiceMessage/ExternalServiceRequest2).
 * <p>
 * Any APXMLMessage object that this method returns will be sent to AlarmPoint
 * either via the Integration Service's outbound queues or directly as a
 * Web Service response, depending on the mechanism used to submit the APXML.
 */
function apia_response(apxml)
{
  var method = apxml.getMethod();

  if (APXMLMessage.OK_METHOD.equalsIgnoreCase(method))
  {
    return handleOK(apxml);
  }
  else if (APXMLMessage.ERROR_METHOD.equalsIgnoreCase(method))
  {
    return handleERROR(apxml);
  }
  else if (APXMLMessage.SEND_METHOD.equalsIgnoreCase(method))
  {
    return handleSend(apxml);
  }
  else if (APXMLMessage.REQUEST_METHOD.equalsIgnoreCase(method))
  {
    return handleRequest(apxml);
  }
  else
  {
    throw new IllegalArgumentException("Unrecognized APXML method: " + method);
  }
}

/**
 * OK responses are returned by AlarmPoint for each APXML message that it accepts
 * from an Integration Service.
 * <p>
 * Log the acknowledgement using the nnmi Integration Service's logger.
 */
function handleOK(apxml)
{
  var id = apxml.getTransactionId();
  log.info("Submission of transaction " + id + " succeeded.");
}

/**
 * ERROR responses are returned by AlarmPoint for each APXML message that it
 * is unable to accept from an Integration Service.
 * <p>
 * Log the error using the nnmi Integration Service's logger.
 */
function handleERROR(apxml)
{
  var id = apxml.getTransactionId();
  var code = apxml.getValue(APXMLMessage.ERROR_CODE);
  log.error("Submission of transaction " + id + "failed with error code " + code);
}

/**
 * The main routine for handling Requests AlarmPoint
 * <p>
 * Throw an exception that will be logged by the Integration Agent.
 */
function handleSend(apxml)
{
  log.debug("handleSend received apxml: " + apxml);

  // handle annotations coming from callout APS script
  // they are formatted differently
  // the presence of the message token means this message
  // is a callout annotation.
  var message = apxml.getValue("message");
  var incidentId = apxml.getToken("incident_id").getValue();

  if (message != null && incidentId != null)
  {
    return handleCalloutAnnotate(apxml);
  }
  else
  {
    return handleApsResponses(apxml);
  }

}

/**
 * Requests are forwarded to the Send handler.
 * <p>
 * Redirects to the handleSend as messages may come from ESM or ESR to the IA.
 */
function handleRequest(apxml)
{
  return handleSend(apxml);
}

/**
 * Used to send job Events to Control-M
 * <p>
 * The main routine for handling user responses to xMatters notifications.
 * <p>
 * Throw an exception that will be logged by the Integration Agent.
 */
function handleApsResponses(apxml)
{
  var response = new xMattersWS().initializeResponse(apxml);

  // deserialize the additional tokens
  var additionalTokens = getAdditionalTokens(apxml);

  var orderId = processAdditionalTokens(additionalTokens, "Order ID", true);
  var jobName = processAdditionalTokens(additionalTokens, "Job Name", true);
  var responseAction = apxml.getValue("response");
  var responder = apxml.getValue("recipient");
  var responseEvent = apxml.getValue("eventidentifier");
  var comment = apxml.getValue("annotation");
  var recipientTarget = apxml.getValue("device");
  // used CONTROL_M_USER to execute job commands
  var recipientUsername = CONTROL_M_USER;

  // For RECEIVED_RESPONSE events, a responseAction key/value pair should exist.
  if (responseAction == null || responseAction == "")
  {
    throw "handleApsResponses() - responseAction not set for a RECEIVED_RESPONSE responseEvent.  responseAction required check xMatters Relevance Engine to ensure response choices are set";
  }

  if (comment == null || comment == "")
  {
    // This test shouldn't pass if this message is seen in the logs there is an error creating an annotation.
    comment = notePrefix + "Default Message from Integration Agent scripting";
  }

  log.debug("handleApsResponses() - AdditionalTokens keys: " + additionalTokens + ". About to start handling " + responseAction);

  var cmdParams = new Array();
  var CTMPSM_COMMAND     = "ctmpsm";
  var CTMLOG_COMMAND     = "ctmlog";
  var CTMKILLJOB_COMMAND = "ctmkilljob";
  var ctmsecure = true;

  try
  {

    if (responseAction.equalsIgnoreCase("RERUN") || responseAction.equalsIgnoreCase("FORCEOK") || responseAction.equalsIgnoreCase("CONFIRM")) {

      cmdParams[0] = CTMPSM_COMMAND;
      cmdParams[1] = "-UPDATEAJF";
      cmdParams[2] = orderId;
      cmdParams[3] = responseAction;
    }
    else if (responseAction.equalsIgnoreCase("KILL") )
    {

      cmdParams[0] = CTMKILLJOB_COMMAND;
      cmdParams[1] = "-ORDERID";
      cmdParams[2] = orderId;

    }else if (responseAction.equalsIgnoreCase("logs"))
    {
      ctmsecure = false;
      cmdParams[0] = CTMLOG_COMMAND;
      cmdParams[1] = "LISTORD";
      cmdParams[2] = orderId;
      cmdParams[3] = "*";

    }
    else if (responseAction.equalsIgnoreCase("output"))
    {
      ctmsecure = false;
      cmdParams[0] = CTMPSM_COMMAND;
      cmdParams[1] = "-LISTSYSOUT";
      cmdParams[2] = orderId;
    }
    else if (responseAction.equalsIgnoreCase("statistics"))
    {
      ctmsecure = false;
      cmdParams[0] = CTMPSM_COMMAND;
      cmdParams[1] = "-UPDATEAJF";
      cmdParams[2] = orderId;
      cmdParams[3] = "STATISTICS";

    }
    else
    {
      comment = notePrefix + " " + responder + " responded xMatters notification with " + responseAction;
    }

    // Log the response since we can not write to the Control-M job log
    log.info(comment);

    var cmdResult = "";

    if( cmdParams.length > 0 )
    {
      // Used for auditing purposes by all the commands, except logs.

      if( ctmsecure )
      {
        cmdParams[ cmdParams.length ] = "-SECUSERAG";
        cmdParams[ cmdParams.length ] = recipientUsername;
      }

      log.debug("Going to execute : " + cmdParams);
      cmdResult = execute( cmdParams );
      log.debug("Result of execute is " + cmdResult);


      // var xmWebSerice = new xMattersWS();
      var apxmlMessage = new APXMLMessageImpl();
      // xMatters form can only host up to a specific limit of characters
	  // Jo-Ann Stores wants the last n where n = the limit, if length is over
      var newCmdResultString = "";
      var len = cmdResult.length();
      if (len > XMATTERS_MAX_TEXT)
      {
        newCmdResultString = cmdResult.substring(len-XMATTERS_MAX_TEXT);
      }
      else
      {
        newCmdResultString = cmdResult;
      }
      apxmlMessage.setToken("message", newCmdResultString);

      // var chunkedString = splitInChunks(cmdResult, 4000).toArray();

      // JavaScript String
      // apxmlMessage.setToken("message_chunks", chunkedString.length);
      // for(var i=0, len=chunkedString.length; i<len; ++i)
      // {
      //   var tempString = new String(chunkedString[i]);
      //   apxmlMessage.setToken("message_"+i, tempString );
      // }

      apxmlMessage.setToken("event_type", "cmdResult");
      apxmlMessage.setToken("recipients", responder);
      apxmlMessage.setToken("order_id", orderId);
      apxmlMessage.setToken("job_name", jobName);
      apxmlMessage.setToken("job_request", responseAction);

      apia_input_reb(apxmlMessage);
    }

    response.setToken(TOKEN_NAME, "OK", APXMLToken.Type.STRING);

  }
  catch (e)
  {
    log.error("handleApsResponses() - Caught exception processing responseAction [" + responseAction + "] Exception:" + e);
    response.setToken(TOKEN_NAME_EXCEPTION, e.toString().replace(exceptionString, ""), APXMLToken.Type.STRING);

  }

  if (log.isDebugEnabled())
  {
    log.debug("handleApsResponses() - Finished call to management system for requestText: [" + responseAction + "]; Response: " + response);
  }

  return response;
}

/**
 * handles annotations sent from the Callout APS script
 */
function handleCalloutAnnotate(apxml)
{
  var xmEventID = apxml.getValue("eventidentifier");
  var callbackType = apxml.getValue("xmatters_callback_type");

  if (callbackType.equalsIgnoreCase("status"))
  {
    var status = apxml.getValue("status");
    log.info(notePrefix + " created xMatters event " + xmEventID + " with status of " + status);
  }
  else if (callbackType.equalsIgnoreCase("deliveryStatus"))
  {
    var device = apxml.getValue("device");
    var recipient = apxml.getValue("recipient");
    var deliverystatus = apxml.getValue("deliverystatus");

    log.info(notePrefix + " delivered notification to " + recipient + "|" + device + " with status of " + deliverystatus);
  }
  else
  {
    var status = apxml.getValue("status");
    var xmEventID = apxml.getValue("eventidentifier");

    log.info(notePrefix + " created xMatters event " + xmEventID + " with status of " + status);
  }

  log.debug("handleCalloutAnnotate() - Finished call to management system for callout annotate");
}

/**
 * Retrieves the additional tokens from the APXML
 * @param apxml XML message to process
 * @return additional tokens
 * @throws if the additional tokens are missing from the XML.
 */
function getAdditionalTokens(apxml)
{
  if (apxml.getValue("additionalTokens") != null && !"".equalsIgnoreCase(apxml.getValue("additionalTokens")))
  {
    return xStream.fromXML(apxml.getValue("additionalTokens"));// LinkedHashMap
  }
  throw "additionalTokens is missing from apxml";
}

/**
 * Retrieves the additional tokens from the APXML and throws an exception if a mandatory token is missing
 * @param additionalTokens collection of tokens to process
 * @param tokenName name of the token to retrieve
 * @param mandatory true if token is required, false otherwise
 * @return the token value
 */
function processAdditionalTokens(additionalTokens, tokenName, mandatory)
{
  var token = additionalTokens.get(tokenName);
  if (mandatory && token == null)
  {
    throw "processAdditionalTokens() - additionalTokens in apxml is missing " + tokenName + " which is mandatory";
  }
  return token;
}

function execute( command )
{
  var result = "";
  var is = null;

  try
  {
    // Perform the command, then wait for it to finish.
    //
    var p = Runtime.getRuntime().exec( command );
    is = p.getInputStream();

    result = parseStream( is );
  }
  catch( e )
  {
    if (e.javaException instanceof java.lang.IllegalThreadStateException) {
      // Sleep a little to save on CPU cycles
      Thread.currentThread().sleep(500);
    } else {
      log.error("Error occurred during Execute for cmd " + command);
      throw e;
    }
  }
  finally
  {
    try
    {
      if( is != null )
        is.close();
    }
    catch( ex )
    {
      // Doesn't matter if we can't close the file.
    }
  }

  return result;
}

/** ***********************************************************************
 *
 * DESCRIPTION
 * This procedure will read the entire contents of the given input stream
 * and return it as a string.  While reading, it will parse any characters
 * that are XML-unfriendly and replace them with encoded alternatives.
 * Carriage returns and line feeds are NOT stripped from the stream, however
 * the 0x04 character (ASCII End Of Text marker) should be.  This is because
 * the Notification Server expects XML documents to be separated by that
 * character.
 *
 * INPUTS
 * InputStream is - The stream from which we want to read some data.
 *
 * OUTPUTS
 * The XML-friendly string representation of the data read from input.
 *
 * RETURNS
 * The empty string if nothing is read, otherwise all characters from the
 * input stream.
 *
 ** ***********************************************************************/
function parseStream( is )
{
  var AMPERSAND = "&amp;";
  var QUOTE = "&quot;";
  var APOSTROPHE = "&apos;";
  var LESS_THAN = "&lt;";
  var GREATER_THAN = "&gt;";

  // Collect output from command as input to script
  //
  var inStream = new BufferedReader( new InputStreamReader( is ) );
  var result = new StringBuffer( 1024 );
  var escape = false;
  var input = 0;

  while( (input = inStream.read()) > -1 )
  {
    // Strip out linefeeds and carriage returns in the data (unless escaped)
    // Also take care of any stray symbols that will cause XML problems.
    //
    switch( String.fromCharCode(input) )
    {
      // Removes the End Of Text marker that would cause the document to
      // be improperly parsed by the Notification Server if it was sent in
      // the middle of an XML document.
      //
      case String.fromCharCode(0x04):
        break;

      case '&':
        result.append( AMPERSAND );
        break;
      case '<':
        result.append( LESS_THAN );
        break;
      case '>':
        result.append( GREATER_THAN );
        break;
      case '"':
        result.append( QUOTE );
        break;
      case '\'':
        result.append( APOSTROPHE );
        break;
      case '\\':
        if( escape )
          result.append( "\\\\" );

        escape = !escape;
        break;
      case 'n':
      case 'r':
        if( escape )
        {
          result.append( '\\' );
          escape = false;
        }

      default:
        if( (Integer.parseInt(input) > 27) || (input == 10) || (input == 13) )
          result.append( String.fromCharCode(input) );

        break;
    }

    // If the last character was an escape character, simply append it.
    //
    if( escape )
      result.append( '\\' );
  }

  return result.toString();
}

/**
 * Splits string <tt>s</tt> into chunks of size <tt>chunkSize</tt>
 *
 * @param s the string to split; must not be null
 * @param chunkSize number of chars in each chuck; must be greater than 0
 * @return The original string in chunks
 */
function splitInChunks(s, chunkSize) {
    var result = new ArrayList();
    var length = s.length();
    for (var i = 0; i < length; i += chunkSize) {
        result.add(s.substring(i, Math.min(length, i + chunkSize)));
    }
    return result;
}

/**
 * Decrypts the password for the ServiceDeskUser used by the integration
 * @param passwordFile file/path of the file containing the encrypted password
 * @return decrypted password or an empty string if the password cannot be decrypted
 */
function getPassword(passwordFile)
{
  try
  {
    var encryptionUtils = new EncryptionUtils();
    var file = new File(passwordFile);
    return encryptionUtils.decrypt(file);
  }
  catch (e)
  {
    return "";
  }
}

/**
 * Converts time to a readable format.
 **/
function convertTime(oldTime)
{
    if(oldTime.length != 14)
        return oldTime;

    return oldTime.substring(0,4) + "/" + oldTime.substring(4,6) + "/" + oldTime.substring(6,8) + " " + oldTime.substring(8,10) + ":" + oldTime.substring(10,12) + ":" + oldTime.substring(12,14);
}
