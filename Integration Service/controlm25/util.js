var APIA_HTTP_RECEIVED = "Received";
var APIA_HTTP_ERROR = "Error";

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * isEmpty
 *
 * Checks if the given value is null or an empty string
 *
 * @param value parameter to check
 * @return true if the value is empty, false otherwise
 * ---------------------------------------------------------------------------------------------------------------------
 */
function isEmpty(value)
{
    if (value == null || "".equalsIgnoreCase(value) || value == "" || typeof value == "undefined")
    {
        return true;
    }
    return false;
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * equalsIgnoreCase
 *
 * Case-insensitive compare of 2 strings. If either argument is null or undefined the result is false.
 *
 * @param string1
 * @param string2
 * ---------------------------------------------------------------------------------------------------------------------
 */
function equalsIgnoreCase(string1, string2)
{
    log.debug("[" + typeof string1 + "], [" + typeof string2 + "]");
    if (string1 != null && typeof string1 != "undefined" && string2 != null && typeof string2 != "undefined")
    {
        return string1.toUpperCase() == string2.toUpperCase();
    }
    return false;
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * getPassword
 *
 * Decrypts the password for the ServiceDeskUser used by the integration
 *
 * @param passwordFile file/path of the file containing the encrypted password
 * @return decrypted password or an empty string if the password cannot be decrypted
 * ---------------------------------------------------------------------------------------------------------------------
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
 * Function to return a generic javascript object with a toString() method
 * implementation to contain the results from webservice calls in a useable form
 */
function newGenericObject()
{
    var GenericObject = BaseClass.extend();
    return new GenericObject();
}

/**
 * Core function for handling of exceptions thrown in webservice calls.
 * @param e exception thrown
 * @param source the function the exception was thrown from
 * @param soapVersion SOAP version for retrieving the correct format of the SOAP fault
 */
function handleError(e, source, soapVersion)
{
    log.debug("Enter - handleError");

    // ---------------------------------------------------------------------------------------------------------
    // When the list would be empty due to the startRecord or Qualification, the Web service will actually
    // return a SOAP fault with faultstring "ERROR (302): Entry does not exist in database".
    //
    // However, this same faultstring can also be returned in other cases such as an invalid userName so it
    // isn't possible to determine the exact cause of the fault by examination. Because of this, we assume that
    // any SOAP fault received here means a legitimate empty list. If the interface changes it may be possible
    // to inspect the fault and determine the exact cause.
    // ---------------------------------------------------------------------------------------------------------


    // Start by seeing if there is any sign of XML in the response.
    var exceptionAsString = e.toString();

    var startIndex = exceptionAsString.indexOf('<');

    if (startIndex != -1)
    {
        log.debug("Constructing SOAPFault Object with " + exceptionAsString.substring(startIndex));
        var soapFault = new SOAPFault(exceptionAsString.substring(startIndex), soapVersion);

        // If the SOAPFault constructor can parse the XML, it should find a faultstring
        if (soapFault.faultstring != null)
        {
            this.log.info(source + " - Found SOAP Fault; assume empty list ");
        }
        else
        {
            this.log.error(source + ": caught Exception - name: [" + e.name + "], message [" + e.message + "]");
            this.log.error(source + " - no SOAPFault in exception; re-throwing.");
            throw(e);
        }
    }
    else
    {
        this.log.error(source + ": caught Exception - name: [" + e.name + "], message [" + e.message + "]");
        this.log.error(source + " - no SOAPFault in exception; re-throwing.");
        throw(e);
    }

    log.debug("Exit - handleError");
}

/**
 * Returns empty string for null or undefined attribute
 * @param attribute value to check
 * @return non-null value
 */
function getNonNullValue(attribute)
{
    if (typeof attribute == "undefined" || attribute == null)
    {
        return "";
    }
    return attribute;
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * buildXmattersGroupName
 *
 * The name of the associated group in xMatters is based on several fields in the Remedy Support Group descriptiong
 *
 * ---------------------------------------------------------------------------------------------------------------------
 */
function buildXmattersGroupName(company, organization, groupName)
{
    log.debug("Enter - buildXmattersGroupName");
    // The group name in xMatters in a concatenation of the Remedy  company, support organization and support group,
    // separated by this character
    var GROUP_NAME_DELIMITER_TOKEN = "*";
    return company + GROUP_NAME_DELIMITER_TOKEN + organization + GROUP_NAME_DELIMITER_TOKEN + groupName;
}

/**
 * ---------------------------------------------------------------------------------------------------------------------
 * makeSoapResponseBody
 *
 * @param status
 * @param description
 * ---------------------------------------------------------------------------------------------------------------------
 */
function makeSoapResponseBody(status, description)
{
    log.debug("Enter - makeSoapResponseBody");

    var soapResponse = new XML();
    soapResponse = <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:apia="http://www.xmatters.com/apia_http_controlm20/">
        <soapenv:Header/>
        <soapenv:Body>
            <apia:TriggerResponse>
                <apia:status/>
                <apia:description/>
            </apia:TriggerResponse>
        </soapenv:Body>
    </soapenv:Envelope>;

    soapResponse.*::Body.*::TriggerResponse.*::status = status;
    soapResponse.*::Body.*::TriggerResponse.*::description = description;

    log.debug("httpResponse [" + soapResponse + "]");
    log.debug("Exit - makeSoapResponseBody");

    return soapResponse;
}