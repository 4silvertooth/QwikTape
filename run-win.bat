@echo off
if "%1" == "-dev" goto dev 
"sdk/bin/windows/x64/scapp.exe" "src/main.htm"
exit /b 1
goto :eof
:dev
"sdk/bin/windows/x64/scapp.exe" -o "run-dev.html" "--debug"
exit /b 1