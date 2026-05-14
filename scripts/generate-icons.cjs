const fs = require('fs')
const zlib = require('zlib')
const path = require('path')

const OUT = path.join(__dirname, '..', 'src', 'static', 'tab')
fs.mkdirSync(OUT, { recursive: true })

const S = 81

function crc32(data) {
  let c = 0xffffffff
  for (let i = 0; i < data.length; i++) c = (c >>> 8) ^ TABLE[(c ^ data[i]) & 0xff]
  return (c ^ 0xffffffff) >>> 0
}
const TABLE = new Uint32Array(256)
for (let i = 0; i < 256; i++) {
  let c = i
  for (let j = 0; j < 8; j++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
  TABLE[i] = c
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0)
  const t = Buffer.from(type, 'ascii')
  const c = Buffer.alloc(4); c.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, c])
}

function createPNG(pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4)
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0
  const raw = Buffer.alloc(S * (1 + S * 4))
  for (let y = 0; y < S; y++) {
    raw[y * (1 + S * 4)] = 0
    for (let x = 0; x < S; x++) {
      const si = (y * S + x) * 4, di = y * (1 + S * 4) + 1 + x * 4
      raw[di] = pixels[si]; raw[di+1] = pixels[si+1]
      raw[di+2] = pixels[si+2]; raw[di+3] = pixels[si+3]
    }
  }
  const idat = chunk('IDAT', zlib.deflateSync(raw))
  return Buffer.concat([sig, chunk('IHDR', ihdr), idat, chunk('IEND', Buffer.alloc(0))])
}

function solid(pixels) {
  for (let i = 0; i < pixels.length; i++) pixels[i] = 0
}

function setPx(pixels, x, y, col) {
  if (x < 0 || x >= S || y < 0 || y >= S) return
  const i = (y * S + x) * 4
  pixels[i] = col[0]; pixels[i+1] = col[1]; pixels[i+2] = col[2]; pixels[i+3] = col[3]
}

function fillCircle(pixels, cx, cy, r, col) {
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx, dy = y - cy
      if (dx * dx + dy * dy <= r * r) {
        setPx(pixels, x, y, col)
      }
    }
  }
}

function drawLine(pixels, x1, y1, x2, y2, col, thick) {
  thick = thick || 1
  const dx = x2 - x1, dy = y2 - y1
  const steps = Math.max(Math.abs(dx), Math.abs(dy))
  if (steps === 0) { setPx(pixels, x1, y1, col); return }
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const x = Math.round(x1 + dx * t), y = Math.round(y1 + dy * t)
    for (let ty = -Math.floor(thick/2); ty <= Math.floor(thick/2); ty++) {
      for (let tx = -Math.floor(thick/2); tx <= Math.floor(thick/2); tx++) {
        setPx(pixels, x + tx, y + ty, col)
      }
    }
  }
}

function fillRect(pixels, l, t, r, b, col) {
  for (let y = t; y <= b; y++) {
    for (let x = l; x <= r; x++) {
      setPx(pixels, x, y, col)
    }
  }
}

function drawHome(pixels, col) {
  // Roof - triangle
  for (let y = 14; y <= 32; y++) {
    const halfW = Math.round((32 - y) * 1.5 + 8)
    const lx = 40 - halfW, rx = 40 + halfW
    for (let x = lx; x <= rx; x++) {
      setPx(pixels, x, y, col)
    }
  }
  // Body - rectangle
  fillRect(pixels, 16, 32, 64, 66, col)
  // Door
  fillRect(pixels, 34, 46, 46, 66, col)
  // Door inner (remove center to make it a door shape)
  fillRect(pixels, 36, 48, 44, 64, [0, 0, 0, 0])
  // Door arch top
  for (let y = 42; y <= 48; y++) {
    const halfW = Math.round((48 - y) * 0.7)
    const lx = 40 - halfW, rx = 40 + halfW
    for (let x = lx; x <= rx; x++) {
      setPx(pixels, x, y, col)
    }
  }
}

function drawRecipes(pixels, col) {
  // Left page
  const lx = [22, 24, 28, 33, 38]
  for (let i = 0; i < lx.length; i++) {
    const x = lx[i]
    const top = 14 + i * 2
    const bot = 66 - i * 2
    for (let y = top; y <= bot; y++) {
      setPx(pixels, x, y, col)
    }
  }
  // Right page
  const rx = [58, 56, 52, 47, 42]
  for (let i = 0; i < rx.length; i++) {
    const x = rx[i]
    const top = 14 + i * 2
    const bot = 66 - i * 2
    for (let y = top; y <= bot; y++) {
      setPx(pixels, x, y, col)
    }
  }
  // Spine
  fillRect(pixels, 38, 12, 42, 68, col)
  // Top curve
  for (let y = 10; y <= 14; y++) {
    for (let x = 38 - (14 - y); x <= 42 + (14 - y); x++) {
      setPx(pixels, x, y, col)
    }
  }
  // Bottom curve
  for (let y = 66; y <= 70; y++) {
    for (let x = 38 - (y - 66); x <= 42 + (y - 66); x++) {
      setPx(pixels, x, y, col)
    }
  }
  // Text lines on left page
  for (let ly = 24; ly <= 54; ly += 8) {
    for (let lx = 26; lx <= 36; lx++) {
      setPx(pixels, lx, ly, [255, 255, 255, 200])
    }
  }
  // Text lines on right page
  for (let ly = 24; ly <= 54; ly += 8) {
    for (let lx = 44; lx <= 56; lx++) {
      setPx(pixels, lx, ly, [255, 255, 255, 200])
    }
  }
}

function drawHealth(pixels, col) {
  // Baseline
  fillRect(pixels, 10, 66, 72, 68, col)
  // Bars - 4 bars of increasing height
  const bars = [
    {x: 16, h: 22},
    {x: 30, h: 38},
    {x: 44, h: 16},
    {x: 58, h: 46}
  ]
  for (const bar of bars) {
    fillRect(pixels, bar.x, 68 - bar.h, bar.x + 8, 66, col)
  }
  // Bar top rounded effect
  for (const bar of bars) {
    const topY = 68 - bar.h
    for (let x = bar.x - 1; x <= bar.x + 9; x++) {
      for (let y = topY - 1; y <= topY + 1; y++) {
        const dx = x - (bar.x + 4), dy = y - topY
        if (dx * dx + dy * dy <= 9) {
          setPx(pixels, x, y, col)
        }
      }
    }
  }
}

function drawProfile(pixels, col) {
  // Head - circle
  fillCircle(pixels, 40, 22, 13, col)
  // Body
  for (let y = 34; y <= 70; y++) {
    const t = (y - 34) / 36
    const halfW = Math.round(8 + t * 18)
    for (let x = 40 - halfW; x <= 40 + halfW; x++) {
      setPx(pixels, x, y, col)
    }
  }
  // Shoulders rounding
  for (let y = 32; y <= 36; y++) {
    const halfW = Math.round(8 + ((y - 32) / 4) * 15)
    for (let x = 40 - halfW; x <= 40 + halfW; x++) {
      setPx(pixels, x, y, col)
    }
  }
}

const configs = {
  home: drawHome,
  recipes: drawRecipes,
  health: drawHealth,
  profile: drawProfile
}

const gray = [153, 153, 153, 255]
const orange = [249, 115, 22, 255]

for (const [name, draw] of Object.entries(configs)) {
  const px1 = new Uint8Array(S * S * 4); solid(px1)
  draw(px1, gray)
  fs.writeFileSync(path.join(OUT, `${name}.png`), createPNG(px1))

  const px2 = new Uint8Array(S * S * 4); solid(px2)
  draw(px2, orange)
  fs.writeFileSync(path.join(OUT, `${name}-active.png`), createPNG(px2))

  console.log(`  ${name}.png + ${name}-active.png`)
}

console.log('All 8 icons generated!')