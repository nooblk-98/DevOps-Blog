import fs from 'fs'
import path from 'path'

const dbFile = path.join(process.cwd(), 'db', 'data.sqlite')
try {
  if (fs.existsSync(dbFile)) {
    fs.rmSync(dbFile, { force: true })
    console.log('[db] removed', dbFile)
  } else {
    console.log('[db] no database file to remove')
  }
  process.exit(0)
} catch (e) {
  console.error('[db] reset failed:', e)
  process.exit(1)
}

