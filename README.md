# BMC Control-M integration for xMatters
This is an update to the BMC Control-M (Workload Automation) integration for xMatters.  The [original integration](https://support.xmatters.com/hc/en-us/articles/202025245?_ga=2.38456676.659900434.1499075783-1836047778.1485785168) is known as controlm20, this is known as controlm25.  This is a complete integration.
* Tested on Control-M 8 (Please update in if this works on Control-M 9)
* Now updated to use REST
* Now tolerant of authenticated proxy server
* Now not using deprecated methods to call workflow forms
* This integration is UBER closed loop! That is to say responding with Rerun, ForceOK, Logs or Output will take actual actions in Control-M, Logs and Output notifying the responding user with the result.

---------

<kbd>
  <a href="https://support.xmatters.com/hc/en-us/community/topics">
  <img src="https://github.com/xmatters/xMatters-Labs/raw/master/media/disclaimer.png">
  </a>
</kbd>

---------


# Pre-Requisites
* Control-M v8   (not tested on v9 yet)
* BMC CONTROL-M/EM API
* The latest xMatters Integration Agent
* xMatters on Demand

# Files
* [BMCControlMIntegration.zip](BMCControlMIntegration.zip) - Workflow to be loaded into xMatters On Demand.  (DoTo: This still needs the agent failure form)
* [controlm25](controlm25) - The integration service to be placed in 'integrationservices' on the xMatters Integration Agent.


# How it works
Control-M   <----->   Integration Agent Service   <----->   xMatters On Demand

1. The integration is triggered by Control-M in 1 of two ways. Either:
   * A shout action is configured in Control-M for a job to execute the Controlm-APClient.bat/.sh script on a job abend, over run, under run. In this case a second action can be configured to execute Controlm-APClient-Del.bat/.sh in the event of a clear.  This is the classic method.
   * The Control-M EM is configured to run Controlm-APClientFromSysProperty.bat/sh for all events that arrive in the EM, this is configured with Control-M system properties.
2. The scripts process the trigger into a APClient call to the integration on the xMatters Integration Agent passing the job Order ID.
3. The integration uses the Control-M API to query Control-M for extended information about the job referenced by that Order ID.
4. The integration uses either a message passed to it by the shout, or if non passed or the system property method used the current status of the job, to look up the URL of the form (or inbound IB) to invoke in xMatters.
5. The integration invokes the form (or inbound IB) in xMatters.
6. And responses are dealt with by invoking the Control-M API. Standard responses include Rerun, ForceOK, Logs and Output.  Logs and Output responses query information and pass it to a new form in xMatters to go back to the responder in a new notification.


# Installation
These instructions assume:
* You have installed an [xMatters Integration Agent](https://support.xmatters.com/hc/en-us/articles/201463419) on the Contorl-M EM server and you have already successfully configured it to connect to xMatters On Demand.
* You have installed and configured the Control-M/EM API (Instructions link required)

There are 3 stages to configuring this integration. Before you can configure Control-M to call the Integration Service you have to have configured the Integration Service, and before you can configure the Integration Service you have to have configured the Com Plan in xMatters.

## xMatters on Demand setup
1. Create rest account (default controlm.rest)
2. Import Workflow
3. Add rest account to sender permissions of each form in the Workflow
4. Note the Web Service URLs for each of the forms in the Workflow

## Integration Setup
This assumes you have already installed and configured an xMatters Integration Agent. The install location of the agent is referred to here as $IA_HOME.

1. Place controlm25 in `$IAHOME/integrationservices/`
2. Edit `$IA_HOME/conf/deduplicator-filter.xml` and insert this filter:
```xml
<!-- Filter to prevent duplicate events injecting more often than once every 5 seconds -->
<filter name="controlm">
  <predicates>
    <predicate>shout_msg</predicate>
  </predicates>
  <suppression_period>5</suppression_period>
  <window_size>1</window_size>
</filter>
```
3. Edit `$IA_HOME/conf/IAConfig.xml` and insert this service definition inside `<service-configs dir="../integrationservices">` (towards the bottom of the file):
```xml
<path>controlm25/controlm.xml</path>
```
4. Place the control-m api configuration Files in `$IAHOME/integrationservices/controlm25/`
5. Edit `$IAHOME/integrationservices/controlm25/controlm-config.js`
6. Edit Controlm-APClient.sh or Controlm-APClient.bat, Controlm-APClient-Del.sh or Controlm-APClient-Del.bat, Controlm-APClientFromSysProperty.sh or Controlm-APClientFromSysProperty.bat
7. Update passwords, Control-M password, xmatters rest password, proxy server password if used
8. Restart the integration agent


## Control-M Setup
Choose your method.  You can do both but then watch for duplicate events.

### Using shout


### Using Control-M System Properties



# Testing
Fail a job, watch it work.

# Troubleshooting
None yet
