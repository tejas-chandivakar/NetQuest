import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const svg = readFileSync('public/icon.svg')
const out = 'public'

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'icon-512-maskable.png', size: 512, pad: 0.1 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
]

for (const { name, size, pad } of sizes) {
  if (pad) {
    const inner = Math.round(size * (1 - pad * 2))
    await sharp({ create: { width: size, height: size, channels: 4, background: '#7C3AED' } })
      .composite([{ input: await sharp(svg).resize(inner, inner).png().toBuffer(), gravity: 'center' }])
      .png()
      .toFile(join(out, name))
  } else {
    await sharp(svg).resize(size, size).png().toFile(join(out, name))
  }
  console.log('wrote', name)
}
