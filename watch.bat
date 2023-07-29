@echo off
set PATH=%PATH%;node_modules\.bin
set my_drive=%~d0
set my_path=%~dp0
%my_drive%
cd %my_path%
start C:\Windows\System32\cmd.exe /k "npm run watch:cjs"
start C:\Windows\System32\cmd.exe /k "npm run watch:types"
start C:\Windows\System32\cmd.exe /k "npm run watch:esm"

