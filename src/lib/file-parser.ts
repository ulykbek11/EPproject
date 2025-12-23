import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Set worker source for PDF.js
// We use the CDN version to avoid complex bundler configuration issues with workers
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export const extractTextFromFile = async (file: File): Promise<string> => {
  const fileType = file.name.split('.').pop()?.toLowerCase();

  try {
    if (fileType === 'pdf') {
      return await extractPdfText(file);
    } else if (fileType === 'docx') {
      return await extractDocxText(file);
    } else if (['txt', 'md', 'json', 'js', 'ts', 'tsx', 'py', 'csv', 'html', 'css'].includes(fileType || '')) {
      return await file.text();
    }
    return ''; // Unsupported type or no text content
  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
};

const extractPdfText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

const extractDocxText = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};
