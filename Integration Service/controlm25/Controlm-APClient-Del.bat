@echo off

set MAP=--map-data
set CLIENT="applications|controlm25"
set CONTROLM=%1
set ORDER_ID=%2
set IA_HOME=C:\xMatters\integrationagent-5.1.8\bin

VER | TIME > TEMP.BAT
ECHO SET TIME=%%3>CURRENT.BAT
CALL TEMP.BAT
DEL TEMP.BAT
DEL CURRENT.BAT

echo TIME=%TIME% >> %IA_HOME%\ControlmAPClientDel.log
echo MAP=%MAP% >> %IA_HOME%\ControlmAPClientDel.log
echo CLIENT=%CLIENT% >> %IA_HOME%\ControlmAPClientDel.log
echo CONTROLM=%CONTROLM% >> %IA_HOME%\ControlmAPClientDel.log
echo ORDER_ID=%ORDER_ID% >> %IA_HOME%\ControlmAPClientDel.log

set APARGS=%MAP% %CLIENT% %ORDER_ID%

echo APARGS=%APARGS% >> %IA_HOME%\ControlmAPClientDel.log

%IA_HOME%\APClient.bin.exe %APARGS%

IF %ERRORLEVEL% NEQ 0 echo An error has occurred trying to dispatch a Del for Control M Job Message to APClient with the following ORDER_ID: %ORDER_ID% >> %IA_HOME%\ControlmAPClientDelErrors.log
