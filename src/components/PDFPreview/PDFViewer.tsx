import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Loader2, AlertCircle } from 'lucide-react';

// PDF.js worker 설정 - 버전 맞춤
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

export interface FieldPosition {
  id: string;
  page: number;
  top: number;
  left: number;
  fontSize?: number;
  width?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
}

export interface FieldValue {
  [key: string]: string;
}

interface PDFViewerProps {
  pdfUrl: string;
  fieldPositions: FieldPosition[];
  fieldValues: FieldValue;
  scale?: number;
}

export default function PDFViewer({ pdfUrl, fieldPositions, fieldValues, scale = 1.0 }: PDFViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pageImages, setPageImages] = useState<string[]>([]);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('PDF 로드 시도:', pdfUrl);
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        console.log('PDF 로드 성공, 페이지 수:', pdf.numPages);

        const images: string[] = [];
        const dimensions: { width: number; height: number }[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          images.push(canvas.toDataURL('image/png'));
          dimensions.push({ width: viewport.width, height: viewport.height });
        }

        setPageImages(images);
        setPageDimensions(dimensions);
        setLoading(false);
      } catch (err) {
        console.error('PDF 로딩 오류:', err);
        setError('PDF를 로드할 수 없습니다.');
        setLoading(false);
      }
    };

    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">PDF 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center p-6 bg-white rounded-lg shadow-sm border">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive font-medium">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">PDF 파일 경로를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-6 p-6">
      {pageImages.map((image, index) => {
        const pageNumber = index + 1;
        const dimension = pageDimensions[index];
        const pageFields = fieldPositions.filter((f) => f.page === pageNumber);

        return (
          <div
            key={pageNumber}
            className="pdf-page relative bg-white shadow-xl rounded-sm border"
            style={{
              width: dimension ? dimension.width * scale : 'auto',
              height: dimension ? dimension.height * scale : 'auto',
            }}
          >
            <img src={image} alt={`Page ${pageNumber}`} className="w-full h-full" style={{ display: 'block' }} />

            {/* 오버레이 필드 */}
            {pageFields.map((field) => (
              <div
                key={field.id}
                className="pdf-field absolute pointer-events-none"
                style={{
                  top: `${field.top * scale * 1.5}px`,
                  left: `${field.left * scale * 1.5}px`,
                  fontSize: `${(field.fontSize || 12) * scale * 1.5}px`,
                  width: field.width ? `${field.width * scale * 1.5}px` : 'auto',
                  letterSpacing: field.letterSpacing ? `${field.letterSpacing}px` : 'normal',
                  textAlign: field.textAlign || 'left',
                  whiteSpace: 'nowrap',
                  color: '#000',
                  fontFamily: "'Malgun Gothic', 'Nanum Gothic', sans-serif",
                  fontWeight: 500,
                }}
              >
                {fieldValues[field.id] || ''}
              </div>
            ))}

            {/* 페이지 번호 */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
              {pageNumber} / {pageImages.length}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 인쇄용 컴포넌트
interface PDFPrintViewProps {
  pdfUrl: string;
  fieldPositions: FieldPosition[];
  fieldValues: FieldValue;
}

export function PDFPrintView({ pdfUrl, fieldPositions, fieldValues }: PDFPrintViewProps) {
  const [pageImages, setPageImages] = useState<string[]>([]);

  useEffect(() => {
    const loadPDF = async () => {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const images: string[] = [];

        // 인쇄용은 더 높은 해상도
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 2.0 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({
            canvasContext: context,
            viewport: viewport,
            canvas: canvas,
          }).promise;

          images.push(canvas.toDataURL('image/png'));
        }

        setPageImages(images);
      } catch (err) {
        console.error('PDF 로딩 오류:', err);
      }
    };

    if (pdfUrl) {
      loadPDF();
    }
  }, [pdfUrl]);

  return (
    <div className="print-only hidden print:block">
      {pageImages.map((image, index) => {
        const pageNumber = index + 1;
        const pageFields = fieldPositions.filter((f) => f.page === pageNumber);

        return (
          <div
            key={pageNumber}
            className="pdf-page"
            style={{
              width: '210mm',
              height: '297mm',
              position: 'relative',
              pageBreakAfter: 'always',
              overflow: 'hidden',
            }}
          >
            <img
              src={image}
              alt={`Page ${pageNumber}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />

            {pageFields.map((field) => (
              <div
                key={field.id}
                style={{
                  position: 'absolute',
                  top: `${field.top * 2.0}px`,
                  left: `${field.left * 2.0}px`,
                  fontSize: `${field.fontSize || 12}pt`,
                  width: field.width ? `${field.width * 2.0}px` : 'auto',
                  letterSpacing: field.letterSpacing ? `${field.letterSpacing}px` : 'normal',
                  textAlign: field.textAlign || 'left',
                  whiteSpace: 'nowrap',
                  color: '#000',
                  fontFamily: "'Malgun Gothic', 'Nanum Gothic', sans-serif",
                }}
              >
                {fieldValues[field.id] || ''}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
