// 서식지 인쇄본 위에 손으로 그린 듯한 타원(동그라미) 표시용 SVG 데이터 URI
// ImageViewer/PrintModal은 필드 값이 'data:image/'로 시작하면 이미지로 렌더링한다
export const OVAL_MARK_IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 44"><ellipse cx="60" cy="22" rx="55" ry="18" fill="none" stroke="#000" stroke-width="4"/></svg>',
)}`;
