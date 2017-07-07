@echo off

set MAP=--map-data
set CLIENT="applications|controlm25"
set CONTROLM=%1
set SHOUT_MSG=%2
set IA_HOME=C:\xMatters\integrationagent-5.1.8\bin

VER | TIME > TEMP.BAT
ECHO SET TIME=%%3>CURRENT.BAT
CALL TEMP.BAT
DEL TEMP.BAT
DEL CURRENT.BAT

echo TIME=%TIME% >> %IA_HOME%\ControlmAPClient.log
echo MAP=%MAP% >> %IA_HOME%\ControlmAPClient.log
echo CLIENT=%CLIENT% >> %IA_HOME%\ControlmAPClient.log
echo CONTROLM=%CONTROLM% >> %IA_HOME%\ControlmAPClient.log
echo SHOUT_MSG=%SHOUT_MSG% >> %IA_HOME%\ControlmAPClient.log

set APARGS=%MAP% %CLIENT% %SHOUT_MSG% %CONTROLM%

echo APARGS=%APARGS% >> %IA_HOME%\ControlmAPClient.log

%IA_HOME%\APClient.bin.exe %APARGS%

IF %ERRORLEVEL% NEQ 0 echo An error has occurred trying to dispatch a Control M Job Message to APClient with the following message: %SHOUT_MSG% >> %IA_HOME%\ControlmAPClientErrors.log
