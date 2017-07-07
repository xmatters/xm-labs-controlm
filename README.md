# BMC Control-M integration for xMatters
This is an update to the BMC Workload Automation (aka Control-M) integration for xMatters.  The [original integration](https://support.xmatters.com/hc/en-us/articles/202025245?_ga=2.38456676.659900434.1499075783-1836047778.1485785168) is known as controlm20, this is known as controlm25.  This is a complete integration.
* Tested on Control-M 8 (Please update in if this works on Control-M 9)
* Now updated to use REST
* Now tolerant of authenticated proxy server
* Now not using deprecated methods to call communication plan forms
* This integration is UBER closed loop! That is to say responding with Rerun, ForceOK, Logs or Output will take actual actions in Control-M, Logs and Output notifying the responding user with the result.

# Pre-Requisites
* Control-M v8   (not tested on v9 yet)
* BMC CONTROL-M/EM API
* The latest xMatters Integration Agent
* xMatters on Demand

# Files
* [BMCControlMIntegration.zip](BMCControlMIntegration.zip) - Communication Plan to be loaded into xMatters On Demand.  (DoTo: This still needs the agent failure form)

# How it works
1. The integration is triggered by Control-M in 1 of two ways. Either:
   * A shout action is configured in Control-M for a job to execute the Controlm-APClient.bat/.sh script on a job abend, over run, under run. In this case a second action can be configured to execute Controlm-APClient-Del.bat/.sh in the event of a clear.  This is the classic method.
   * The Control-M EM is configured to run Controlm-APClientFromSysProperty.bat/sh for all events that arrive in the EM, this is configured with Control-M system properties.
2. The scripts process the trigger into a APClient call to the integration on the xMatters Integration Agent passing the job Order ID.
3. The integration uses the Control-M API to query Control-M for extended information about the job referenced by that Order ID.
4. The integration uses either a message passed to it by the shout, or if non passed or the system property method used the current status of the job, to look up the URL of the form (or inbound IB) to invoke in xMatters.
5. The integration invokes the form (or inbound IB) in xMatters.
6. And responses are dealt with by invoking the Control-M API. Standard responses include Rerun, ForceOK, Logs and Output.  Logs and Output responses query information and pass it to a new form in xMatters to go back to the responder in a new notification.


# Installation
Long and complicated...

## Integration Setup
1. [Install an integration agent.](https://support.xmatters.com/hc/en-us/articles/201463419)
2.


## Control-M Setup
Choose your method.  You can do both but then watch for duplicate events.


## xMatters on Demand setup



# Testing
Be specific. What should happen to make sure this code works? What would a user expect to see?

# Troubleshooting
Optional section for how to troubleshoot. Especially anything in the source application that an xMatters developer might not know about, or specific areas in xMatters to look for details - like the Activity Stream?
