import { useEffect, useState } from 'react';
import { Loader2, AlertCircle, MousePointer2 } from 'lucide-react';

export interface FieldPosition {
  id: string;
  page: number;
  top: number;
  left: number;
  fontSize?: number;
  width?: number;
  height?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  opacity?: number;
}

export interface FieldValue {
  [key: string]: string;
}

interface ImageViewerProps {
  images: string[]; // 이미지 URL 배열
  fieldPositions: FieldPosition[];
  fieldValues: FieldValue;
  scale?: number;
  debugMode?: boolean; // 좌표 확인 모드
}

// A4 크기 (96dpi 기준)
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

interface DragArea {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  page: number;
}

export default function ImageViewer({ images, fieldPositions, fieldValues, scale = 1.0, debugMode = false }: ImageViewerProps) {
  const [loadedImages, setLoadedImages] = useState<{ url: string; width: number; height: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedPos, setClickedPos] = useState<{ x: number; y: number; page: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; page: number } | null>(null);
  const [dragArea, setDragArea] = useState<DragArea | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setLoading(true);
        setError(null);

        const loaded = await Promise.all(
          images.map((url) => {
            return new Promise<{ url: string; width: number; height: number }>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                resolve({ url, width: img.width, height: img.height });
              };
              img.onerror = () => {
                reject(new Error(`이미지 로드 실패: ${url}`));
              };
              img.src = url;
            });
          }),
        );

        setLoadedImages(loaded);
        setLoading(false);
      } catch (err) {
        console.error('이미지 로딩 오류:', err);
        setError('이미지를 로드할 수 없습니다.');
        setLoading(false);
      }
    };

    if (images.length > 0) {
      loadImages();
    }
  }, [images]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (!debugMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    setIsDragging(true);
    setDragStart({ x, y, page: pageNumber });
    setDragArea(null);
    setClickedPos(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (!debugMode || !isDragging || !dragStart || dragStart.page !== pageNumber) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    setDragArea({
      startX: dragStart.x,
      startY: dragStart.y,
      endX: x,
      endY: y,
      page: pageNumber,
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>, pageNumber: number) => {
    if (!debugMode || !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);

    // 드래그 거리가 짧으면 클릭으로 처리
    if (dragStart && Math.abs(x - dragStart.x) < 5 && Math.abs(y - dragStart.y) < 5) {
      setClickedPos({ x, y, page: pageNumber });
      setDragArea(null);
      console.log(`📍 클릭 좌표 (Page ${pageNumber}): top: ${y}, left: ${x}`);
    } else if (dragStart) {
      const area = {
        startX: Math.min(dragStart.x, x),
        startY: Math.min(dragStart.y, y),
        endX: Math.max(dragStart.x, x),
        endY: Math.max(dragStart.y, y),
        page: pageNumber,
      };
      setDragArea(area);
      setClickedPos(null);
      console.log(`📦 드래그 영역 (Page ${pageNumber}): top: ${area.startY}, left: ${area.startX}, width: ${area.endX - area.startX}, height: ${area.endY - area.startY}`);
    }

    setIsDragging(false);
    setDragStart(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
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
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* 디버그 모드 좌표 표시 - 클릭 */}
      {debugMode && clickedPos && (
        <div className="fixed bottom-4 left-4 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg text-sm font-mono">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 className="w-4 h-4" />
            <span className="font-semibold">클릭 좌표 (Page {clickedPos.page})</span>
          </div>
          <div className="text-green-400 select-all cursor-pointer" title="클릭해서 복사">
            top: {clickedPos.y}, left: {clickedPos.x}
          </div>
        </div>
      )}

      {/* 디버그 모드 좌표 표시 - 드래그 영역 */}
      {debugMode && dragArea && (
        <div className="fixed bottom-4 right-4 z-50 bg-black text-white px-4 py-3 rounded-lg shadow-lg text-sm font-mono">
          <div className="flex items-center gap-2 mb-2">
            <MousePointer2 className="w-4 h-4" />
            <span className="font-semibold">드래그 영역 (Page {dragArea.page})</span>
          </div>
          <div className="space-y-1">
            <div className="text-green-400 select-all cursor-pointer" title="클릭해서 복사">
              top: {dragArea.startY}, left: {dragArea.startX}, width: {dragArea.endX - dragArea.startX}, height: {dragArea.endY - dragArea.startY}
            </div>
          </div>
        </div>
      )}

      {loadedImages.map((img, index) => {
        const pageNumber = index + 1;
        const pageFields = fieldPositions.filter((f) => f.page === pageNumber);

        return (
          <div
            key={pageNumber}
            className={`pdf-page relative bg-white shadow-xl rounded-sm border ${debugMode ? 'cursor-crosshair select-none' : ''}`}
            style={{
              width: A4_WIDTH * scale,
              height: A4_HEIGHT * scale,
            }}
            onMouseDown={(e) => handleMouseDown(e, pageNumber)}
            onMouseMove={(e) => handleMouseMove(e, pageNumber)}
            onMouseUp={(e) => handleMouseUp(e, pageNumber)}
            onMouseLeave={() => {
              if (isDragging) {
                setIsDragging(false);
                setDragStart(null);
              }
            }}
          >
            <img src={img.url} alt={`Page ${pageNumber}`} className="w-full h-full pointer-events-none" style={{ display: 'block', objectFit: 'fill' }} />

            {/* 드래그 중 선택 영역 표시 */}
            {debugMode && isDragging && dragStart && dragStart.page === pageNumber && dragArea && (
              <div
                className="absolute border-2 border-primary bg-primary/20 pointer-events-none"
                style={{
                  top: Math.min(dragArea.startY, dragArea.endY) * scale,
                  left: Math.min(dragArea.startX, dragArea.endX) * scale,
                  width: Math.abs(dragArea.endX - dragArea.startX) * scale,
                  height: Math.abs(dragArea.endY - dragArea.startY) * scale,
                }}
              />
            )}

            {/* 선택된 드래그 영역 표시 */}
            {debugMode && !isDragging && dragArea && dragArea.page === pageNumber && (
              <div
                className="absolute border-2 border-destructive bg-destructive/20 pointer-events-none"
                style={{
                  top: dragArea.startY * scale,
                  left: dragArea.startX * scale,
                  width: (dragArea.endX - dragArea.startX) * scale,
                  height: (dragArea.endY - dragArea.startY) * scale,
                }}
              />
            )}

            {/* 오버레이 필드 */}
            {pageFields.map((field) => {
              const value = fieldValues[field.id] || '';
              const isImageValue = value.startsWith('data:image/');
              return (
                <div
                  key={field.id}
                  className="pdf-field absolute pointer-events-none flex items-center"
                  style={{
                    top: `${field.top * scale}px`,
                    left: `${field.left * scale}px`,
                    fontSize: `${(field.fontSize || 18) * scale}px`,
                    width: field.width ? `${field.width * scale}px` : 'auto',
                    height: field.height ? `${field.height * scale}px` : 'auto',
                    letterSpacing: field.letterSpacing ? `${field.letterSpacing}px` : 'normal',
                    textAlign: field.textAlign || 'left',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'keep-all',
                    lineHeight: 1.1,
                    color: '#000',
                    fontFamily: field.fontFamily || "'KimjungchulScript', 'Malgun Gothic', sans-serif",
                    fontStyle: field.fontStyle || 'normal',
                    fontWeight: 'normal',
                    opacity: field.opacity ?? 0.8,
                  }}
                >
                  {isImageValue ? <img src={value} alt={field.id} className="w-full h-full object-contain" /> : <span style={{ width: '100%', textAlign: field.textAlign || 'left' }}>{value}</span>}
                </div>
              );
            })}

            {/* 디버그 모드: 필드 위치 표시 */}
            {debugMode &&
              pageFields.map((field) => (
                <div
                  key={`debug-${field.id}`}
                  className="absolute border-2 border-blue-500 bg-blue-500/20 pointer-events-none"
                  style={{
                    top: `${field.top * scale}px`,
                    left: `${field.left * scale}px`,
                    width: field.width ? `${field.width * scale}px` : '100px',
                    height: field.height ? `${field.height * scale}px` : '20px',
                  }}
                >
                  <span className="text-[10px] text-blue-700 font-mono bg-white/80 px-1">{field.id}</span>
                </div>
              ))}

            {/* 페이지 번호 */}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/50 text-white text-xs rounded">
              {pageNumber} / {loadedImages.length}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// 인쇄용 컴포넌트
interface ImagePrintViewProps {
  images: string[];
  fieldPositions: FieldPosition[];
  fieldValues: FieldValue;
  imageWidth?: number; // 원본 이미지 너비
  imageHeight?: number; // 원본 이미지 높이
}

export function ImagePrintView({
  images,
  fieldPositions,
  fieldValues,
  imageWidth = 1240, // 기본 이미지 크기 (조정 필요)
  imageHeight = 1754,
}: ImagePrintViewProps) {
  // A4 크기 (mm를 px로 변환, 96dpi 기준)
  const a4WidthPx = 794; // 210mm
  const a4HeightPx = 1123; // 297mm

  // 이미지 대비 A4 비율 계산
  const scaleX = a4WidthPx / imageWidth;
  const scaleY = a4HeightPx / imageHeight;

  return (
    <div className="print-only hidden print:block">
      {images.map((imgUrl, index) => {
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
              src={imgUrl}
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
                  top: `${field.top * scaleY}px`,
                  left: `${field.left * scaleX}px`,
                  fontSize: `${(field.fontSize || 16) * Math.min(scaleX, scaleY)}pt`,
                  width: field.width ? `${field.width * scaleX}px` : 'auto',
                  letterSpacing: field.letterSpacing ? `${field.letterSpacing * scaleX}px` : 'normal',
                  textAlign: field.textAlign || 'left',
                  whiteSpace: 'nowrap',
                  color: '#000',
                  opacity: field.opacity ?? 1,
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
