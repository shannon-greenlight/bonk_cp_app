@echo off

echo This will backup the bonk_cp_app project

if defined BACKUP_DRIVE goto ask_num

:ask
set /p drive=What's the drive letter?
setx BACKUP_DRIVE %drive%
setx BONK_CP_APP_BACKUP_NUMBER ""
goto ask_num2

:ask_num
set drive=%BACKUP_DRIVE%

:ask_num2
if not defined BONK_CP_APP_BACKUP_NUMBER ( 
	set /p backup_number=What's the backup number?
) else (
	set backup_number=%BONK_CP_APP_BACKUP_NUMBER%
)

set /p ans=That's %drive%:\back\bonk_cp_app\bonk_cp_app-%backup_number%, eh? (y/n)

if %ans% == n goto ask

xcopy /i /exclude:excluded_from_backup.txt *.* %drive%:\back\bonk_cp_app\bonk_cp_app-%backup_number%  /e

set /A backup_number=backup_number+1

setx BONK_CP_APP_BACKUP_NUMBER %backup_number%

pause