## Especificacao

Remove Tesseract as the receipt extraction strategy.

## Entregavel

- Removed `tesseract.js` dependency
- Removed OCR-specific backend module
- Removed OCR-specific response naming from active code
- Updated docs to describe OpenAI extraction

## Definicao de pronto

- Backend no longer imports or runs Tesseract
- Upload/extraction code no longer returns `ocrStatus`
- Tesseract generated files are not part of normal workflow

## Teste

- Run install/typecheck
- Search for Tesseract and OCR references that should no longer exist in active code
