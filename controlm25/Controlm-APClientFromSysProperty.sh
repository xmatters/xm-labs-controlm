#!/bin/bash

## Change the recipient to be a group or user id in xMatters that should be targeted for every event.
## The expectation is that subscriptions in xMatters will be used to send messages elsewhere in addition to this recipient.
RECIPIENT=go.nowhere

## The CLIENT and IA_HOME will also require changing here
CLIENT='applications|controlm25'
IA_HOME=/home/adam/integrationagent-5.1.8

MAP='--map-data'

date >> $IA_HOME/log/ControlmAPClientFromSysProperty.log
echo "MAP = $MAP" >> $IA_HOME/log/ControlmAPClientFromSysProperty.log
echo "CLIENT = $CLIENT" >> $IA_HOME/log/ControlmAPClientFromSysProperty.log
echo "ScriptARGS = $*" >> $IA_HOME/log/ControlmAPClientFromSysProperty.log


while (( "$#" )); do
	if [[ "$1" == "order_id:" ]];  then
		ORDERID=$2
	fi
	if [[ "$1" == "message:" ]];  then
		MESSAGE=$2
	fi
	if [[ "$1" == "data_center:" ]];  then
		DATACENTER=$2
	fi

	shift
done

echo "Running this: $IA_HOME/bin/APClient.bin $MAP $CLIENT \"$ORDERID;$RECIPIENT;$MESSAGE\" \"$DATACENTER\"" >> $IA_HOME/log/ControlmAPClientFromSysProperty.log
echo "Running this: $IA_HOME/bin/APClient.bin $MAP $CLIENT \"$ORDERID;$RECIPIENT;$MESSAGE\" \"$DATACENTER\""

$IA_HOME/bin/APClient.bin $MAP $CLIENT "$ORDERID;$RECIPIENT;$MESSAGE" "$DATACENTER"

if [[ $? != 0 ]];  then
	echo "An error has occurred trying to dispatch a Control M Job Message to APClient" >> $IA_HOME/log/ControlmAPClientFromSysProperty.log
fi
