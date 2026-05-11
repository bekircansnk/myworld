export function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function createWavBlob(pcmData: Uint8Array, sampleRate: number): Blob {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcmData.length;
  const chunkSize = 36 + dataSize;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, chunkSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const pcmArray = new Uint8Array(buffer, 44);
  pcmArray.set(pcmData);

  return new Blob([buffer], { type: 'audio/wav' });
}

export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  
  const isWav = bytes.length > 4 && 
                bytes[0] === 0x52 && 
                bytes[1] === 0x49 && 
                bytes[2] === 0x46 && 
                bytes[3] === 0x46;
                
  if (isWav) {
    let offset = 12;
    while (offset < bytes.length - 8) {
      const chunkId = String.fromCharCode(bytes[offset], bytes[offset+1], bytes[offset+2], bytes[offset+3]);
      const chunkSize = bytes[offset+4] | (bytes[offset+5] << 8) | (bytes[offset+6] << 16) | (bytes[offset+7] << 24);
      offset += 8;
      if (chunkId === 'data') {
        return bytes.slice(offset, offset + chunkSize);
      }
      offset += chunkSize;
    }
    return bytes.slice(44);
  }
  return bytes;
}

export function splitByLength(text: string, length: number): string[] {
  const chunks = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + length));
    i += length;
  }
  return chunks;
}

export function chunkText(text: string, maxLength: number = 400): string[] {
  const regex = /[^.!?\n]+[.!?\n]+/g;
  const matches = text.match(regex);
  
  if (!matches) {
    return splitByLength(text, maxLength);
  }

  const chunks: string[] = [];
  let currentChunk = '';

  for (const match of matches) {
    const sentence = match.trim();
    if (!sentence) continue;

    if (sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk);
        currentChunk = '';
      }
      chunks.push(...splitByLength(sentence, maxLength));
    } else if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = sentence;
    } else {
      currentChunk = currentChunk ? `${currentChunk} ${sentence}` : sentence;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}
