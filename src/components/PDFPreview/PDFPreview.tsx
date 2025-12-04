export interface PDFField {
  id: string;
  value: string;
  style: {
    top: number;
    left: number;
    fontSize?: number;
    width?: number;
  };
  page: number;
}

export interface PDFPage {
  pageNumber: number;
  imageUrl: string;
}

interface PDFPreviewProps {
  pages: PDFPage[];
  fields: PDFField[];
  scale?: number;
}

export default function PDFPreview({ pages, fields, scale = 0.7 }: PDFPreviewProps) {
  const a4Width = 210; // mm
  const a4Height = 297; // mm
  const pixelWidth = a4Width * 3.78 * scale; // mm to px (약 96 DPI 기준)
  const pixelHeight = a4Height * 3.78 * scale;

  return (
    <div className="flex flex-col gap-4">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className="pdf-page relative bg-white shadow-lg border border-gray-300 overflow-hidden"
          style={{
            width: `${pixelWidth}px`,
            height: `${pixelHeight}px`,
          }}
        >
          {/* PDF 배경 이미지 */}
          {page.imageUrl ? (
            <img src={page.imageUrl} alt={`Page ${page.pageNumber}`} className="absolute inset-0 w-full h-full object-contain" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400">
              <div className="text-center">
                <p className="text-lg">PDF 템플릿 이미지</p>
                <p className="text-sm">({page.pageNumber} 페이지)</p>
              </div>
            </div>
          )}

          {/* 오버레이 필드 */}
          {fields
            .filter((field) => field.page === page.pageNumber)
            .map((field) => (
              <div
                key={field.id}
                className="pdf-field absolute pointer-events-none"
                style={{
                  top: `${field.style.top * scale}px`,
                  left: `${field.style.left * scale}px`,
                  fontSize: `${(field.style.fontSize || 12) * scale}px`,
                  width: field.style.width ? `${field.style.width * scale}px` : 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {field.value}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}

// 인쇄용 컴포넌트
interface PDFPrintViewProps {
  pages: PDFPage[];
  fields: PDFField[];
}

export function PDFPrintView({ pages, fields }: PDFPrintViewProps) {
  return (
    <div className="print-only hidden print:block">
      {pages.map((page) => (
        <div
          key={page.pageNumber}
          className="pdf-page"
          style={{
            width: '210mm',
            height: '297mm',
            position: 'relative',
            pageBreakAfter: 'always',
          }}
        >
          {page.imageUrl && (
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          )}

          {fields
            .filter((field) => field.page === page.pageNumber)
            .map((field) => (
              <div
                key={field.id}
                className="pdf-field"
                style={{
                  position: 'absolute',
                  top: `${field.style.top}px`,
                  left: `${field.style.left}px`,
                  fontSize: `${field.style.fontSize || 12}pt`,
                  width: field.style.width ? `${field.style.width}px` : 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {field.value}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
