importPackage(java.lang);
importPackage(java.util);
importPackage(java.io);
importPackage(Packages.com.bmc.ctmem.emapi);
importPackage(Packages.org.jacorb);

var ctmem = new Namespace("http://www.bmc.com/ctmem/schema800");
var soap = new Namespace("http://schemas.xmlsoap.org/soap/envelope/");

var ControlMAPI = BaseClass.extend(
{
  init : function ()
  {
    // Control-M API variables
    this.registeredAPI = false;
    this.gsrInvoker;
    this.userToken = "";

    this.log = new Logger("ControlMAPI: ");
    this.initiateAPI();
    this.registerAPI();

    this.log.debug("Control-M API initialized.");
  },
  
  initiateAPI : function ()
  {
    log.debug("Entering initiateAPI");
    var xmlResponse;
        
    try
    {
      // load the CORBA API properties files
      var propsOrb = new Properties();
      var propsEm = new Properties();
      propsOrb.load(new FileInputStream(new File(JACORB_PROPERTIES_FILE)));
      propsOrb.setProperty("org.omg.CORBA.ORBClass", "org.jacorb.orb.ORB");
      propsOrb.setProperty("org.omg.CORBA.ORBSingletonClass", "org.jacorb.orb.ORBSingleton");
      
      log.debug("EMXMLInvoker init");
      EMXMLInvoker.init(new Array(), propsOrb);
      
      propsEm.load(new FileInputStream(new File(CTMEMAPI_PROPERTIES_FILE)));
      
      log.debug("Setting ctmemapi properties for EMXMLInvoker");
      // set the properties on the EMXMLInvoker for JACORB
      EMXMLInvoker.setProperties(propsEm);
      log.debug("creating EMXMLInvoker");
      // create the instance to the API
      this.gsrInvoker = new EMXMLInvoker(new GSRComponent());

    }
    catch(e)
    {
      // handle invoke failures
      log.error("ERROR in initiateAPI register : " + e.toString());
    }
    
    log.debug("Exiting initiateAPI");
  },

  registerAPI : function ()
  {
    log.debug("Entering registerAPI");
    var xmlResponse;
    
    try
    {
      // now we need to build a USER_TOKEN
      var passwordToken = this.gsrInvoker.BuildPasswordString(CONTROL_M_PASS);
      
      log.debug("passwordToken " + passwordToken);
      
      var xmlRequest = new Scanner( new File("integrationservices/controlm25/xmldata/EMAPI_register.xml") ).useDelimiter("\\A").next();
      
      xmlRequest = xmlRequest.replaceAll("\\$USER_NAME\\$", CONTROL_M_USER)
      xmlRequest = xmlRequest.replaceAll("\\$USER_PASS\\$", passwordToken)
      xmlRequest = xmlRequest.replaceAll("\\$HOST_NAME\\$", CONTROL_M_HOST_NAME)
      
      log.debug("xmlRequest register = " + xmlRequest);
      xmlResponse = this.gsrInvoker.invoke(xmlRequest);
    }
    catch(e)
    {
      // handle invoke failures
      log.error("ERROR in registerAPI register : " + e.toString());
      return;
    }
    // handle xml response
    log.debug("register xmlResponse = " + xmlResponse);
    
    var wsutil = new WSUtil();
    var response = new XML(wsutil.formatStringForE4X(String(xmlResponse))).soap::Body;
    //log.debug("(ARW) XMLafy  = " + response);
    this.userToken = response.ctmem::response_register.ctmem::user_token;
    
    log.debug("registerAPI userToken = " + this.userToken);
    log.debug("Exiting registerAPI");
  },

  /**
   * This function will retrieve the control-m job details from
   * the server for a particular job based on the job's orderId.
   * The jobs details will then be put into the APXML.
   * @param orderId, this is the orderId of the job to retrieve
   * @param apxml
   */
  getJobDetailsForAPXML : function (orderId, apxml)
  {
    var xmlResponse;    
    log.debug("getJobDetailsForAPXML entering - for orderId = " + orderId);
    
    // now try to get the job details
    try
    {
      var wsutil = new WSUtil();
      var retryAPI = true;
      var retries = 0;

      while((retries < API_NUMBER_OF_RETRIES) && retryAPI)
      {
        
        var xmlRequest = new Scanner( new File("integrationservices/controlm25/xmldata/EMAPI_act_retrieve_jobs.xml") ).useDelimiter("\\A").next();
        xmlRequest = xmlRequest.replaceAll("\\$USER_TOKEN\\$", this.userToken)
        xmlRequest = xmlRequest.replaceAll("\\$ORDER_ID\\$", orderId)
        
        log.debug("Calling gsrInvoker.invoke(xmlRequest) for xmlRequest " + xmlRequest);
        responseStr = this.gsrInvoker.invoke(xmlRequest);
      
        // get the response
        xmlResponse = new XML(wsutil.formatStringForE4X(String(responseStr))).soap::Body;
        
        // check for errors
        if ((xmlResponse.soap::Fault).length() > 0) {
          log.error("The following SOAP Fault has occurred " + xmlResponse.soap::Fault);
          
          xmlResponse = xmlResponse.soap::Fault;
          //determine if it is a Invalid User Token and we need to re-register for a new one
          var faultError = xmlResponse.detail.ctmem::fault_act_retrieve_jobs.ctmem::error_list.ctmem::error;
          var faultMajorCode = faultError.@ctmem::major;
          var faultMinorCode = faultError.@ctmem::minor;
          var faultErrorMessage = faultError.ctmem::error_message;
          
          // check to see if the user token has expired
          if (faultMajorCode == AUTHORIZATION_REQUEST_MAJOR_CODE && faultMinorCode == AUTHORIZATION_REQUEST_MINOR_CODE) {
            // try to register and rerun the request
            log.debug("SOAP Error for faultMajorCode " + faultMajorCode + " and faultMinorCode " + faultMinorCode + " with faultErrorMessage " + faultErrorMessage + " we will try to do a API re-register to get the User Token");
            this.registerAPI();
          } else {
            apxml.setToken("message", "The following SOAP Error occurred for the API request to request_act_retrieve_jobs: " + xmlResponse);
            retryAPI = false;
          }
        } else {
          xmlResponse = xmlResponse.ctmem::response_act_retrieve_jobs.ctmem::jobs.ctmem::job.ctmem::job_data;
          
          // exit the retry API loop as we have the response
          retryAPI = false;
        }
        retries++;
      }
    }
    catch(e)
    {
      // handle invoke failures
      log.error("ERROR in getJobDetailsForAPXML: " + e.toString());
    }
    
    log.debug("getJobDetailsForAPXML exiting with xmlResponse " + xmlResponse);
    return xmlResponse;
  },
  
  done : function ()
  {
    log.debug("Calling EMXMLInvoker.done()");
    EMXMLInvoker.done();
  },

});