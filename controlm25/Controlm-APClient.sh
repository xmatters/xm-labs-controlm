#!/bin/bash

MAP='--map-data'
CLIENT='applications|controlm25'
CONTROLM=$1
SHOUT_MSG=$2
IA_HOME=/home/adam/integrationagent-5.1.8/


date >> ${IA_HOME}/ControlmAPClient.log
echo MAP=$MAP >> ${IA_HOME}/ControlmAPClient.log
echo CLIENT=$CLIENT >> ${IA_HOME}/ControlmAPClient.log
echo CONTROLM=$CONTROLM >> ${IA_HOME}/ControlmAPClient.log
echo SHOUT_MSG=$SHOUT_MSG >> ${IA_HOME}/ControlmAPClient.log


echo "APARGS=\"$MAP\" \"$CLIENT\" \"$SHOUT_MSG\" \"$CONTROLM\"" >> ${IA_HOME}/ControlmAPClient.log

${IA_HOME}/bin/APClient.bin "$MAP" "$CLIENT" "$SHOUT_MSG" "$CONTROLM" >> ${IA_HOME}/ControlmAPClient.log
echo >> ${IA_HOME}/ControlmAPClient.log

if [ $? -ne 0 ]; then
	echo "An error has occurred trying to dispatch a Control M Job Message to APClient with the following message: $SHOUT_MSG" >> ${IA_HOME}/ControlmAPClientErrors.log
	echo "An error has occurred trying to dispatch a Control M Job Message to APClient with the following message: $SHOUT_MSG"
	exit 1
fi
