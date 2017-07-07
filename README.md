# Product Name Goes Here
This is an update to the BMC Workload Automation (aka Control-M) integration for xMatters.  The [origonal integration](https://support.xmatters.com/hc/en-us/articles/202025245?_ga=2.38456676.659900434.1499075783-1836047778.1485785168) is known as controlm20, this is known as controlm25.  This is a complete integration.
* Tested on Control-M 8 (Please update in if this works on Control-M 9)
* Now updated to use REST
* Now tolerent of authenticated proxy server
* Now not using depricated methods to call comunication plan forms
* This integration is UBER closed loop! That is to say responding with Rerun, ForceOK, Logs or Output will take actual actions in Control-M, Logs and Output notifying the responding user with the resault.

# Pre-Requisites
* Control-M V8
* BMC CONTROL-M/EM API v8
* The latest xMatters Integration Agent
* xMatters on Demand 

# Files
Update me
* [ExampleCommPlan.zip](ExampleCommPlan.zip) - This is an example comm plan to help get started. (If it doesn't make sense to have a full communication plan, then you can just use a couple javascript files like the one below.)
* [EmailMessageTemplate.html](EmailMessageTemplate.html) - This is an example HTML template for emails and push messages. 
* [FileA.js](FileA.js) - An example javascript file to be pasted into a Shared Library in the Integration builder. Note the comments

# How it works
1. The integration is trigured by Control-M in 1 of two ways. Either:
   * A shout action is configured in Control-M for a job to execute the Controlm-APClient.bat/.sh script on a job abend, overun, underun. In this case a second action can be configured to execute Controlm-APClient-Del.bat/.sh in the event of a clear.  This is the clasic method.
   * The Control-M EM is configured to run Controlm-APClientFromSysProperty.bat/sh for all events that arrive in the EM, this is configued with Control-M system properties.
2. The scripts process the trigger into a APClient call to the integration on the xMatters Integration Agent passing the job Order ID.
3. The integration uses the Control-M API to query Control-M for extended information about the job referanced by that Order ID.
4. The integration uses either a message passed to it by the shout, or if non passed or the system property method used the current status of the job, to look up the URL of the form (or inbound IB) to envoke in xMatters.
5. The integration invokes the form (or inbound IB) in xMatters.
6. And responses are delbt with by invoking the Control-M API. Standard responses include Rerun, ForceOK, Logs and Output.  Logs and Output responces query information and pass it to a new form in xMatters to go back to the responder in a new notification.


# Installation
Long and complicated...

## Application ABC set up
Any specific steps for setting up the target application? The more precise you can be, the better!

Images are encouraged. Adding them is as easy as:
```
<kbd>
  <img src="media/cat-tax.png" width="200" height="400">
</kbd>
```

<kbd>
  <img src="media/cat-tax.png" width="200" height="400">
</kbd>


## xMatters set up
1. Steps to create a new Shared Library or (in|out)bound integration or point them to the xMatters online help to cover specific steps; i.e., import a communication plan (link: http://help.xmatters.com/OnDemand/xmodwelcome/communicationplanbuilder/exportcommplan.htm)
2. Add this code to some place on what page:
   ```
   var items = [];
   items.push( { "stuff": "value"} );
   console.log( 'Do stuff' );
   ```
   
# Testing
Be specific. What should happen to make sure this code works? What would a user expect to see? 

# Troubleshooting
Optional section for how to troubleshoot. Especially anything in the source application that an xMatters developer might not know about, or specific areas in xMatters to look for details - like the Activity Stream? 
