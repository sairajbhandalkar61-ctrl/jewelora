@echo off
echo ========================================================
echo   JEWELORA - AUTOMATED GITHUB PUSH
echo   Target: https://github.com/sairajbhandalkar61-ctrl/jewelora
echo ========================================================
echo.
echo Pushing 'main' branch to GitHub...
git push -u origin main
if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo   SUCCESS! Jewelora has been pushed to GitHub!
    echo   Repository: https://github.com/sairajbhandalkar61-ctrl/jewelora
    echo ========================================================
) else (
    echo.
    echo ========================================================
    echo   NOTE: If you see 'repository not found', please open:
    echo   https://github.com/new?name=jewelora
    echo   and click the green 'Create repository' button first,
    echo   then run this script again!
    echo ========================================================
)
pause
