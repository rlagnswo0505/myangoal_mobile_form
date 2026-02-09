import { useState, useEffect, useCallback, type RefObject } from 'react';

// A4 크기 (96dpi 기준)
const A4_WIDTH = 794;

interface UsePreviewScaleOptions {
  minScale?: number;
  maxScale?: number;
  padding?: number;
}

/**
 * 미리보기 영역의 크기에 맞춰 자동으로 스케일을 계산하는 훅
 * @param containerRef - 미리보기 컨테이너의 ref
 * @param options - 스케일 옵션 (최소/최대 스케일, 패딩)
 * @returns 계산된 스케일 값
 */
export function usePreviewScale(containerRef: RefObject<HTMLElement | null>, options: UsePreviewScaleOptions = {}) {
  const { minScale = 0.5, maxScale = 1, padding = 32 } = options;
  const [scale, setScale] = useState(1);

  const calculateScale = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const availableWidth = containerWidth - padding * 2;

    // A4 너비에 맞춰 스케일 계산
    let newScale = availableWidth / A4_WIDTH;

    // 최소/최대 스케일 제한
    newScale = Math.max(minScale, Math.min(maxScale, newScale));

    setScale(newScale);
  }, [containerRef, minScale, maxScale, padding]);

  useEffect(() => {
    calculateScale();

    // ResizeObserver로 컨테이너 크기 변화 감지
    const resizeObserver = new ResizeObserver(() => {
      calculateScale();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // 윈도우 리사이즈 이벤트도 감지
    window.addEventListener('resize', calculateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', calculateScale);
    };
  }, [calculateScale, containerRef]);

  return scale;
}
