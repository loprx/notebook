// scripts/write-version.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const versionFile = path.resolve(__dirname, '../docs/.vitepress/version.json')
const version = process.env.GITHUB_SHA?.slice(0, 7) ?? 'dev'

fs.writeFileSync(versionFile, JSON.stringify({ version, date: new Date().toISOString() }, null, 2))
console.log(`Version file written to ${versionFile}`)
