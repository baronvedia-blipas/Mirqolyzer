import { createWorker } from "tesseract.js";

let worker: Awaited<ReturnType<typeof createWorker>> | null = null;

async function getWorker() {
  if (!worker) {
    worker = await createWorker("eng+spa");
  }
  return worker;
}

export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  const w = await getWorker();
  const { data: { text } } = await w.recognize(imageBuffer);
  return text;
}
