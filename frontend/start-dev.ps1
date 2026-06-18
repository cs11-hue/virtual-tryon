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

Write-Host "Starting dev server at http://localhost:3000"
npm run dev
