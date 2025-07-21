@echo off
echo ===================================
echo 正在重新部署API到生产环境...
echo ===================================

echo [1/6] 停止现有服务
taskkill /f /im TaskManagementAPI.exe 2>nul
timeout /t 2

echo [2/6] 清理旧文件
if exist publish rmdir /s /q publish

echo [3/6] 还原NuGet包
dotnet restore

echo [4/6] 重新发布应用
dotnet publish -c Release -o publish --self-contained false

echo [5/6] 复制生产环境配置
copy /Y appsettings.Production.json publish\appsettings.Production.json

echo [6/6] 启动新服务
cd publish
set ASPNETCORE_ENVIRONMENT=Production
set ASPNETCORE_URLS=http://0.0.0.0:5000
start TaskManagementAPI.exe

echo 等待服务启动...
timeout /t 5

echo.
echo ===================================
echo API重新部署完成！
echo ===================================
echo.
echo API现已运行在: http://localhost:5000
echo Swagger文档: http://localhost:5000/swagger
echo CORS已设置为允许所有来源
echo.
echo 提示: 如需停止服务，请使用任务管理器或运行:
echo       taskkill /f /im TaskManagementAPI.exe
echo.
pause