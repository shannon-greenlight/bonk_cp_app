@echo off

echo This will compare a backup to the bonk_cp_app project

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
	set /a backup_number -= 1
)

"C:\Program Files\Beyond Compare 4\BComp.com" %drive%:\back\bonk_cp_app\bonk_cp_app-%backup_number% .

