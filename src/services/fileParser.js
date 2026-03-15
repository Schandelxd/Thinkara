import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure PDF.js worker - served from public folder
pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

/**
 * Extract text from a PDF file using PDF.js
 */
async function parsePDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const pages = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => item.str).join(' ');
    pages.push(pageText);
  }
  
  return pages.join('\n\n');
}

/**
 * Extract text from a DOCX file using Mammoth
 */
async function parseDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/**
 * Extract text from a PPTX file by parsing its XML contents
 * PPTX files are ZIP archives containing slide XML files
 */
async function parsePPTX(file) {
  const arrayBuffer = await file.arrayBuffer();
  
  // Dynamically load JSZip from CDN for PPTX parsing
  if (!window.JSZip) {
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  const zip = await window.JSZip.loadAsync(arrayBuffer);
  const slideTexts = [];
  
  // PPTX slides are stored in ppt/slides/slide1.xml, slide2.xml, etc.
  const slideFiles = Object.keys(zip.files)
    .filter(name => name.match(/^ppt\/slides\/slide\d+\.xml$/))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)[1]);
      const numB = parseInt(b.match(/slide(\d+)/)[1]);
      return numA - numB;
    });
  
  for (const slidePath of slideFiles) {
    const xmlText = await zip.files[slidePath].async('text');
    // Extract text content from XML tags like <a:t>text</a:t>
    const textMatches = xmlText.match(/<a:t>([^<]*)<\/a:t>/g);
    if (textMatches) {
      const slideContent = textMatches
        .map(match => match.replace(/<\/?a:t>/g, ''))
        .join(' ');
      slideTexts.push(slideContent);
    }
  }
  
  return slideTexts.join('\n\n');
}

/**
 * Parse text from plain text and markdown files
 */
function parseText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Main file parser - routes to the correct parser based on file type
 * Supports: PDF, DOCX, PPTX, TXT, MD
 */
export const parseFileText = async (file) => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;
  
  // Plain text & markdown
  if (fileType === 'text/plain' || fileType === 'text/markdown' || fileName.endsWith('.md') || fileName.endsWith('.txt')) {
    return await parseText(file);
  }
  
  // PDF
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    try {
      const text = await parsePDF(file);
      if (!text.trim()) {
        throw new Error('No extractable text found in PDF (might be scanned/image-based).');
      }
      return text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  }
  
  // Word DOCX
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    try {
      return await parseDOCX(file);
    } catch (error) {
      throw new Error(`DOCX parsing failed: ${error.message}`);
    }
  }
  
  // PowerPoint PPTX
  if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileName.endsWith('.pptx')) {
    try {
      return await parsePPTX(file);
    } catch (error) {
      throw new Error(`PPTX parsing failed: ${error.message}`);
    }
  }
  
  throw new Error("Unsupported file format. Please upload PDF, DOCX, PPTX, TXT, or Markdown files.");
};
