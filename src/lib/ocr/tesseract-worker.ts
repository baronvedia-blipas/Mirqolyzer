export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  // Dynamic import with webpackIgnore comment prevents Turbopack from
  // bundling tesseract.js (which breaks its __dirname-based worker path)
  const { createWorker } = await import(/* webpackIgnore: true */ "tesseract.js");
  const worker = await createWorker("eng+spa");
  const { data: { text } } = await worker.recognize(imageBuffer);
  await worker.terminate();
  return text;
}
