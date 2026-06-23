import { zipSync, strToU8 } from 'fflate';

export function createZip(files: Record<string, Uint8Array | string>): Uint8Array {
  const input: Record<string, Uint8Array> = {};

  for (const [name, data] of Object.entries(files)) {
    input[name] = typeof data === 'string' ? strToU8(data) : data;
  }

  return zipSync(input);
}
