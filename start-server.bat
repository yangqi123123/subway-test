@echo off
chcp 65001 >nul
cd /d "%~dp0"

set PORT=8080
echo.
echo ========================================
echo   武汉地铁保护区原型 - 本地访问服务
echo ========================================
echo   根目录: %CD%
echo   地址:   http://localhost:%PORT%/
echo   入口:   http://localhost:%PORT%/index.html
echo   移动端: http://localhost:%PORT%/app/index.html
echo   电脑端: http://localhost:%PORT%/web/web-login.html
echo.
echo 按 Ctrl+C 停止服务
echo.

where python >nul 2>&1
if %errorlevel%==0 (
  python -m http.server %PORT%
  goto :eof
)

where py >nul 2>&1
if %errorlevel%==0 (
  py -m http.server %PORT%
  goto :eof
)

where node >nul 2>&1
if %errorlevel%==0 (
  echo Python 未找到，使用 npx serve...
  npx --yes serve -l %PORT% .
  goto :eof
)

echo 未检测到 Python 或 Node.js，请先安装其一后重试。
pause
