@echo off
echo ===================================
echo 正在构建React前端生产版本...
echo ===================================

echo [1/4] 清理旧的构建文件
if exist build rmdir /s /q build

echo [2/4] 安装依赖
call npm install
if %errorlevel% neq 0 (
  echo 安装依赖失败，请检查网络连接或package.json文件
  pause
  exit /b %errorlevel%
)

echo [3/4] 构建生产版本
call npm run build
if %errorlevel% neq 0 (
  echo 构建失败，请检查错误信息
  pause
  exit /b %errorlevel%
)

echo [4/4] 优化构建文件

echo.
echo ===================================
echo 前端构建成功！
echo ===================================
echo.
echo 构建文件位于: %cd%\build
echo.
echo 部署步骤:
echo 1. 将build文件夹中的所有文件复制到Web服务器
echo 2. 配置Web服务器(Nginx/Apache)指向这些文件
echo 3. 确保API服务器已启动并可访问
echo.
pause