import fs from 'node:fs/promises'
import path from 'node:path'

export async function readFileContent(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8')
    return data
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error)
    throw error
  }
}
