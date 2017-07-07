#!/bin/bash

MAP='--map-data'
CLIENT='del'
CONTROLM=$1
ORDER_ID=$2
IA_HOME=/home/adam/integrationagent-5.1.8/

date >> ${IA_HOME}/ControlmAPClientDel.log
echo MAP=$MAP >> ${IA_HOME}/ControlmAPClientDel.log
echo CLIENT=$CLIENT >> ${IA_HOME}/ControlmAPClientDel.log
echo CONTROLM=$CONTROLM >> ${IA_HOME}/ControlmAPClientDel.log
echo ORDER_ID=$ORDER_ID >> ${IA_HOME}/ControlmAPClientDel.log

echo "APARGS=\"$MAP\" \"$CLIENT\" \"$ORDER_ID\"" >> ${IA_HOME}/ControlmAPClientDel.log

${IA_HOME}/bin/APClient.bin "$MAP" "$CLIENT" "$ORDER_ID" >> ${IA_HOME}/ControlmAPClientDel.log
echo >> ${IA_HOME}/ControlmAPClientDel.log

if [ $? -ne 0 ]; then
	echo "An error has occurred trying to dispatch a Del for Control M Job Message to APClient with the following ORDER_ID: $ORDER_ID" >> ${IA_HOME}/ControlmAPClientDelErrors.log
	echo "An error has occurred trying to dispatch a Del for Control M Job Message to APClient with the following ORDER_ID: $ORDER_ID"
	exit 1
fi
