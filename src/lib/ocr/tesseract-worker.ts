import Tesseract from "tesseract.js";

export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng+spa", {
    logger: () => {}, // suppress logs in production
  });
  return text;
}
