@echo off

rem Change the recipient to be a group or user id in xMatters that should be targeted for every event.
rem The expectation is that subscriptions in xMatters will be used to send messages elsewhere in addition to this recipient.
set RECIPIENT=go.nowhere

rem The CLIENT and IA_HOME will also require changing here
set CLIENT="applications|controlm25"
set IA_HOME=C:\xMatters\integrationagent-5.1.8

set MAP=--map-data

For /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
For /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a:%%b)

echo TIME=%mydate%_%mytime% >> %IA_HOME%\log\ControlmAPClientFromSysProperty.log
echo MAP=%MAP% >> %IA_HOME%\log\ControlmAPClientFromSysProperty.log
echo CLIENT=%CLIENT% >> %IA_HOME%\log\ControlmAPClientFromSysProperty.log
echo ScriptARGS=%* >> %IA_HOME%\log\ControlmAPClientFromSysProperty.log


:getRemainingArgs
if "%~1" neq ""  (
	if "%~1" == "order_id:" (
		set ORDERID=%~2
	)
	if "%~1" == "message:" (
		set MESSAGE=%~2
	)
	if "%~1" == "data_center:" (
		set DATACENTER=%~2
	)

	shift
	goto :getRemainingArgs
)

set APARGS=%MAP% %CLIENT% "%ORDERID%;%RECIPIENT%;%MESSAGE%" "%DATACENTER%"

echo APARGS=%APARGS% >> %IA_HOME%\log\ControlmAPClientFromSysProperty.log

echo Command is %IA_HOME%\bin\APClient.bin.exe %APARGS%



%IA_HOME%\bin\APClient.bin.exe %APARGS%

IF %ERRORLEVEL% NEQ 0 echo An error has occurred trying to dispatch a Control M Job Message to APClient >> %IA_HOME%\log\ControlmAPClientErrors.log
