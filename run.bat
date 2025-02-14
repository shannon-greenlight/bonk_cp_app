call npm start
if errorlevel 1 (
   if [%1]==[] echo Run Error: %errorlevel%
   set /p exitkey= "Press any key to continue..."
   exit /b %errorlevel%
)

pause
