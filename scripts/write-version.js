// scripts/write-version.js
const fs = require('fs');
const version = new Date().toISOString();
fs.writeFileSync('docs/.vitepress/dist/__version.json', JSON.stringify({ version }));
console.log('📦 构建版本：', version);
