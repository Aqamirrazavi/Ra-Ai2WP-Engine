import * as zlib from 'zlib';

export class ScreenshotGenerator {
  /**
   * Generates a completely valid, standard 1200x900 PNG binary buffer for WordPress theme screenshot.png.
   * Completely standalone using Node.js built-in zlib with zero external dependencies.
   */
  public static generateScreenshotBuffer(themeName: string): Buffer {
    const width = 1200;
    const height = 900;

    // 1. Create raw RGBA image data (1 byte filter per line + 4 bytes per pixel)
    const rowBytes = 1 + width * 4;
    const rawData = Buffer.alloc(rowBytes * height);

    // Primary palette: Deep Slate / Indigo gradient with cyan header
    for (let y = 0; y < height; y++) {
      const rowOffset = y * rowBytes;
      rawData[rowOffset] = 0; // Filter type 0 (None)

      const isHeader = y < 180;
      const isCard = y > 240 && y < 750;

      for (let x = 0; x < width; x++) {
        const pxOffset = rowOffset + 1 + x * 4;

        if (isHeader) {
          // Elegant dark slate top bar
          rawData[pxOffset] = 15;     // R
          rawData[pxOffset + 1] = 23; // G
          rawData[pxOffset + 2] = 42; // B
          rawData[pxOffset + 3] = 255;// A
        } else if (isCard && x > 150 && x < 1050) {
          // Centered preview canvas
          const ratio = (x - 150) / 900;
          rawData[pxOffset] = Math.floor(30 + ratio * 20);
          rawData[pxOffset + 1] = Math.floor(41 + ratio * 30);
          rawData[pxOffset + 2] = Math.floor(59 + ratio * 50);
          rawData[pxOffset + 3] = 255;
        } else {
          // Background canvas
          rawData[pxOffset] = 10;
          rawData[pxOffset + 1] = 15;
          rawData[pxOffset + 2] = 26;
          rawData[pxOffset + 3] = 255;
        }
      }
    }

    // 2. Compress with DEFLATE (zlib)
    const compressed = zlib.deflateSync(rawData);

    // 3. Assemble PNG Chunks
    const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

    // IHDR Chunk
    const ihdrData = Buffer.alloc(13);
    ihdrData.writeUInt32BE(width, 0);
    ihdrData.writeUInt32BE(height, 4);
    ihdrData[8] = 8; // Bit depth: 8
    ihdrData[9] = 6; // Color type: RGBA (6)
    ihdrData[10] = 0;// Compression method: 0
    ihdrData[11] = 0;// Filter method: 0
    ihdrData[12] = 0;// Interlace method: 0
    const ihdrChunk = this.createChunk('IHDR', ihdrData);

    // IDAT Chunk
    const idatChunk = this.createChunk('IDAT', compressed);

    // IEND Chunk
    const iendChunk = this.createChunk('IEND', Buffer.alloc(0));

    return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  }

  private static createChunk(type: string, data: Buffer): Buffer {
    const len = data.length;
    const chunk = Buffer.alloc(len + 12);
    chunk.writeUInt32BE(len, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);

    // Calculate CRC32 over type + data
    const crc = this.crc32(chunk.subarray(4, len + 8));
    chunk.writeUInt32BE(crc, len + 8);
    return chunk;
  }

  private static crcTable: number[] | null = null;
  private static makeCrcTable(): number[] {
    const table: number[] = [];
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) {
        c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
      }
      table[n] = c >>> 0;
    }
    return table;
  }

  private static crc32(buf: Buffer): number {
    if (!this.crcTable) this.crcTable = this.makeCrcTable();
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = this.crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }
}
