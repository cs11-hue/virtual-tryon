# Node.js PATH (새 터미널에서 npm을 못 찾을 때 대비)
$nodeDir = "C:\Program Files\nodejs"
if (Test-Path $nodeDir) {
  $env:Path = "$nodeDir;$env:Path"
}

Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
  Write-Host "Installing dependencies..."
  npm install
}

Write-Host "Starting dev server"
Write-Host "  Local:  http://localhost:3000"
Write-Host "  Pages:  https://cs11-hue.github.io/virtual-tryon/"
Write-Host "(localhost:3000/virtual-tryon 은 404입니다 — 위 주소를 사용하세요)"
npm run dev
