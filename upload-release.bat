@echo off
REM Upload release to GitHub
REM Requires GitHub token set as environment variable

setlocal enabledelayedexpansion

echo =========================================
echo   JPred Release Upload Script
echo =========================================
echo.

REM Check for GitHub token
if "%GH_TOKEN%"=="" (
    echo ERROR: GitHub token not found!
    echo.
    echo Please create a release manually:
    echo 1. Go to https://github.com/MaqsudMallick/jpred/releases/new
    echo 2. Tag version: v1.0.0
    echo 3. Release title: JPred v1.0.0 - Initial Release
    echo 4. Copy content from RELEASE_NOTES.md
    echo 5. Upload dist\jpred.exe
    echo.
    pause
    exit /b 1
)

echo Uploading jpred.exe to GitHub Releases...
echo.

REM Use PowerShell to upload
powershell -Command "^
$token = '%GH_TOKEN%'; ^
$base64AuthInfo = [Convert]::ToBase64String([Text.Encoding]::ASCII.GetBytes((':{0}' -f $token))); ^
$filePath = 'dist\jpred.exe'; ^
$fileName = 'jpred.exe'; ^
$uploadUrl = 'https://uploads.github.com/repos/MaqsudMallick/jpred/releases?tag_name=v1.0.0'; ^
$releaseInfo = Invoke-RestMethod -Uri 'https://api.github.com/repos/MaqsudMallick/jpred/releases/tags/v1.0.0' -Headers @{Authorization=('Basic {0}' -f $base64AuthInfo)}; ^
$uploadUrl = $releaseInfo.upload_url -replace '\{.*','?name=' + $fileName; ^
Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers @{Authorization=('Basic {0}' -f $base64AuthInfo)} -ContentType 'application/octet-stream' -Body ([byte[]](Get-Content $filePath -Encoding Byte)); ^
Write-Host 'Upload complete!'"

echo.
echo =========================================
echo   Release uploaded successfully!
echo =========================================
echo.
echo View release: https://github.com/MaqsudMallick/jpred/releases/tag/v1.0.0
echo.

pause
