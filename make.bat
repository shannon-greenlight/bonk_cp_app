call npx electron-forge make
if errorlevel 1 (
   if [%1]==[] echo Make Error: %errorlevel%
   set /p exitkey= "Press any key to continue..."
   exit /b %errorlevel%
)

del .\out\bonk_cp_app.zip
"C:\Program Files\7-Zip\7z.exe" a .\out\bonk_cp_app.zip .\out\make\squirrel.windows\x64\*.exe
pause
