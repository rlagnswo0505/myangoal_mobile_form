import { useRef, useEffect, useState } from 'react';
import { X, Printer, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  fieldPositions: FieldPosition[];
  fieldValues: FieldValue;
}

export default function PrintModal({ isOpen, onClose, images, fieldPositions, fieldValues }: PrintModalProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !iframeRef.current) {
      setLoading(true); // 모달이 닫히면 로딩 상태 초기화
      return;
    }

    const iframe = iframeRef.current;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    // 각 페이지의 HTML 생성
    // A4 크기 기준 (96dpi: 794 x 1123 px -> 210 x 297 mm)
    const pxToMm = (px: number) => (px / 794) * 210;

    const pagesHTML = images
      .map((imgUrl, index) => {
        const pageNumber = index + 1;
        const pageFields = fieldPositions.filter((f) => f.page === pageNumber);

        const fieldsHTML = pageFields
          .map((field) => {
            const value = fieldValues[field.id] || '';
            const topMm = pxToMm(field.top);
            const leftMm = pxToMm(field.left);
            const fontSizeMm = pxToMm(field.fontSize || 12);
            const widthMm = field.width ? pxToMm(field.width) : null;
            const heightMm = field.height ? pxToMm(field.height) : null;
            return `
            <div style="
              position: absolute;
              top: ${topMm}mm;
              left: ${leftMm}mm;
              font-size: ${fontSizeMm}mm;
              white-space: pre-wrap;
              word-break: keep-all;
              line-height: 1.1;
              color: #000;
              font-family: ${field.fontFamily || "'Malgun Gothic', 'Nanum Gothic', sans-serif"};
              font-style: ${field.fontStyle || 'normal'};
              font-weight: 500;
              opacity: ${field.opacity ?? 1};
              ${widthMm ? `width: ${widthMm}mm;` : ''}
              ${heightMm ? `height: ${heightMm}mm; display: flex; align-items: center;` : ''}
              ${field.letterSpacing ? `letter-spacing: ${field.letterSpacing}px;` : ''}
              ${field.textAlign ? `text-align: ${field.textAlign};` : ''}
            "><span style="width: 100%; ${field.textAlign ? `text-align: ${field.textAlign};` : ''}">${value}</span></div>
          `;
          })
          .join('');

        return `
        <div class="page" style="
          width: 210mm;
          height: 297mm;
          position: relative;
          page-break-after: always;
          overflow: hidden;
          background: white;
        ">
          <img src="${imgUrl}" style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: contain;
          " />
          ${fieldsHTML}
        </div>
      `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>인쇄 미리보기</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600&family=Nanum+Pen+Script&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #525659;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 20px;
            gap: 20px;
          }
          .page {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          }
          @media print {
            body {
              background: white;
              padding: 0;
              gap: 0;
            }
            .page {
              box-shadow: none;
              margin: 0;
            }
          }
          @page {
            size: A4;
            margin: 0;
          }
        </style>
      </head>
      <body>
        ${pagesHTML}
      </body>
      </html>
    `;

    doc.open();
    doc.write(html);
    doc.close();

    // 이미지 로드 대기
    const checkImagesLoaded = () => {
      const imgs = doc.querySelectorAll('img');
      const allLoaded = Array.from(imgs).every((img) => img.complete);
      if (allLoaded) {
        setLoading(false);
      } else {
        setTimeout(checkImagesLoaded, 100);
      }
    };

    // 약간의 딜레이 후 체크
    setTimeout(checkImagesLoaded, 100);
  }, [isOpen, images, fieldPositions, fieldValues]);

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-[90vw] h-[90vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-semibold">인쇄 미리보기</h2>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} disabled={loading}>
              <Printer className="w-4 h-4 mr-2" />
              인쇄
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            </div>
          )}
          <iframe ref={iframeRef} className="w-full h-full border-0" title="인쇄 미리보기" />
        </div>
      </div>
    </div>
  );
}
