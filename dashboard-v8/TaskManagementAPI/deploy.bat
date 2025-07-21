@echo off
echo ===================================
echo 正在发布.NET API到生产环境...
echo ===================================

REM 设置环境变量
set ASPNETCORE_ENVIRONMENT=Production

REM 清理之前的发布文件
if exist publish rmdir /s /q publish
echo [1/4] 清理完成

REM 还原NuGet包
dotnet restore
echo [2/4] 包还原完成

REM 发布项目
dotnet publish -c Release -o ./publish --self-contained false
echo [3/4] 项目发布完成

REM 复制生产环境配置
copy /Y appsettings.Production.json publish\appsettings.Production.json
echo [4/4] 配置文件复制完成

echo.
echo ===================================
echo 发布成功！发布文件位置: %cd%\publish
echo ===================================
echo.
echo 部署步骤:
echo 1. 将 publish 文件夹中的所有文件复制到服务器
echo 2. 确保服务器已安装 .NET 8.0 Runtime
echo 3. 确认数据库连接已配置正确
echo 4. 在服务器上运行: 
echo    set ASPNETCORE_ENVIRONMENT=Production
echo    TaskManagementAPI.exe
echo.
echo 5. 访问API: http://服务器IP:5000/swagger
echo.
pause