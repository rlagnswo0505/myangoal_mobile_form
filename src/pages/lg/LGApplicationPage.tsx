import { useState, useRef, type ChangeEvent } from 'react';
import ImageViewer, { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';
import { usePreviewScale } from '@/hooks/use-preview-scale';
import PrintModal from '@/components/PrintModal/PrintModal';
import PageHeader from '@/components/Layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DateInput from '@/components/Form/DateInput';
import PhoneInput, { formatPhoneWithDash } from '@/components/Form/PhoneInput';
import AddressInput from '@/components/Form/AddressInput';
import lgAppPage1 from '@/assets/templates/LG빈서식지_1.jpg';
import lgAppPage2 from '@/assets/templates/LG빈서식지_2.jpg';
import lgAppPage3 from '@/assets/templates/LG빈서식지_3.jpg';
import lgAppPage4 from '@/assets/templates/LG빈서식지_4.jpg';
import lgAppPage5 from '@/assets/templates/LG빈서식지_5.jpg';
import lgAppPage6 from '@/assets/templates/LG빈서식지_6.jpg';
import lgAppPage7 from '@/assets/templates/LG빈서식지_7.jpg';
import lgAppPage8 from '@/assets/templates/LG빈서식지_8.jpg';
import lgAppPage9 from '@/assets/templates/LG빈서식지_9.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [lgAppPage1, lgAppPage2, lgAppPage3, lgAppPage4, lgAppPage5, lgAppPage6, lgAppPage7, lgAppPage8, lgAppPage9];

const formatWon = (amount: number) => amount.toLocaleString('ko-KR');

// 프로모션 할인 옵션 생성 (요금제별 선택 가능한 프로모션 할인 단계 - 금액이 클수록 월납부액이 낮아짐)
const buildPromotions = (amounts: number[]) =>
  amounts.map((amount, index) => ({
    value: `promo_${index}`,
    label: amount > 0 ? `-${formatWon(amount)}원` : '프로모션 없음 (0원)',
    amount,
  }));

// 요금제 옵션 (월정액 / 선약할인 / 프로모션 할인) - ESM 2026년 7월 ~ 2차 MNO 온라인 정책(LG 요금제.png, 엔투엘 기준) 기준
// 일반 데이터플랜과 유쓰 데이터플랜은 동일 구간(31/50/80/95/125)에서 기본료·선약할인·프로모션이 같음. 유쓰는 데이터가 더 제공되어 요금제명에 추가 데이터량을 함께 표시
// 월납부액 = 기본료 - 선약할인 - 프로모션 할인 (선택한 프로모션에 따라 달라짐, 서식지의 선택약정할인 문구/총 요금할인은 프로모션과 무관하게 선약할인만 표시)
const PLAN_OPTIONS = [
  { value: 'data_31', label: '데이터플랜31GB', monthlyFee: 61000, discount: 15250, promotions: buildPromotions([26750, 24750, 18000]) },
  { value: 'data_50', label: '데이터플랜50GB', monthlyFee: 63000, discount: 15750, promotions: buildPromotions([22000, 18000]) },
  { value: 'data_80', label: '데이터플랜80GB', monthlyFee: 66000, discount: 16500, promotions: buildPromotions([25000, 22000, 16500]) },
  { value: 'data_95', label: '데이터플랜95GB', monthlyFee: 68000, discount: 17000, promotions: buildPromotions([25000, 22000, 16500]) },
  { value: 'data_125', label: '데이터플랜125GB', monthlyFee: 70000, discount: 17500, promotions: buildPromotions([25000, 22000, 16500, 0]) },
  { value: 'yous_31', label: '유쓰데이터플랜31GB + 10GB', monthlyFee: 61000, discount: 15250, promotions: buildPromotions([26750, 24750, 18000]) },
  { value: 'yous_50', label: '유쓰데이터플랜50GB + 20GB', monthlyFee: 63000, discount: 15750, promotions: buildPromotions([22000, 18000]) },
  { value: 'yous_80', label: '유쓰데이터플랜80GB + 30GB', monthlyFee: 66000, discount: 16500, promotions: buildPromotions([25000, 22000, 16500]) },
  { value: 'yous_95', label: '유쓰데이터플랜95GB + 40GB', monthlyFee: 68000, discount: 17000, promotions: buildPromotions([25000, 22000, 16500]) },
  { value: 'yous_125', label: '유쓰데이터플랜125GB + 60GB', monthlyFee: 70000, discount: 17500, promotions: buildPromotions([25000, 22000, 16500, 0]) },
];

// 주 생활지역 기본값 (매장 소재지 - 주소에서 추출하지 못한 항목은 이 값으로 대체)
const DEFAULT_RESIDENCE_REGION = { sido: '인천광역시', sigungu: '부평구', dong: '부평동' };

// 가입자 주소를 "시/도 · 구/시/군 · 동/읍/면" 3단으로 분해 (지번주소 기준 - "시도 시군구 동 지번" 순서를 가정, 지번주소가 없으면 도로명주소로 최선 추정)
const parseResidenceRegion = (address: string) => {
  const tokens = address.trim().split(/\s+/).filter(Boolean);
  const sido = tokens[0] ?? '';
  const sigungu = tokens[1] && /(시|군|구)$/.test(tokens[1]) ? tokens[1] : '';
  const dong = tokens.slice(2).find((token) => /(동|읍|면|리)$/.test(token)) ?? '';
  return {
    sido: sido || DEFAULT_RESIDENCE_REGION.sido,
    sigungu: sigungu || DEFAULT_RESIDENCE_REGION.sigungu,
    dong: dong || DEFAULT_RESIDENCE_REGION.dong,
  };
};

// 주소 기본값
const BASE_ADDRESS = '인천광역시 부평구 광장로 16 부평민자역사 1층 10~12호';

// 전통신사 옵션 (신청 전 사용하던 통신사) - 우선 신규만 고려, 아직 미사용
// const CARRIER_OPTIONS = [
//   { value: 'skt', label: 'SKT' },
//   { value: 'kt', label: 'KT' },
//   { value: 'mvno', label: '알뜰폰' },
// ];

// 전통신사별 체크 위치 (○ SKT ○ KT ○ MVNO - 임시 좌표, debugMode로 조정 필요)
// const CARRIER_CHECK_POSITIONS: Record<string, { top: number; left: number }> = {
//   skt: { top: 756, left: 509 },
//   kt: { top: 756, left: 548 },
//   mvno: { top: 756, left: 584 },
// };

// 판매업체 옵션 (판매점 상호 / 판매자 / 판매자전화 / 판매자주소)
const VENDOR_OPTIONS = [
  { value: 'entoel', label: '엔투엘 LG', storeName: '엔투엘', sellerName: '이경건', sellerPhone: '1544-4069', sellerAddress: '서울시 마포구 큰우물로75번길 9호' },
  { value: 'esm', label: 'ESM', storeName: '엔투엘', sellerName: '', sellerPhone: '', sellerAddress: '' },
  { value: 'green', label: '그린', storeName: '그린', sellerName: '', sellerPhone: '', sellerAddress: '' },
];

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  { id: 'customerName', page: 1, top: 467, left: 136, width: 314, height: 25, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 468, left: 615, width: 112, height: 24, fontSize: 14 },
  // 외국인등록번호 - 아직 미사용, 필요 시 주석 해제
  // { id: 'foreignerNumber', page: 1, top: 401, left: 523, width: 152, height: 27, fontSize: 14 },
  { id: 'phoneNumber', page: 1, top: 490, left: 434, width: 216, height: 20, fontSize: 14 },
  { id: 'address', page: 1, top: 489, left: 135, width: 274, height: 21, fontSize: 12 },
  { id: 'usimModel', page: 1, top: 667, left: 205, width: 146, height: 18, fontSize: 14 },
  { id: 'usimNumber', page: 1, top: 679, left: 205, width: 186, height: 18, fontSize: 14 },
  // { id: 'mvnoDetail', page: 1, top: 754, left: 608, width: 48, height: 21, fontSize: 12 },
  // 요금제 정보 - 월정액 1곳, 할인액은 "선택약정할인 00000" 형태로 1곳만 표시, 월납부액은 서식지 내 2곳에 표시
  { id: 'planName', page: 1, top: 221, left: 146, width: 103, height: 24, fontSize: 14 },
  { id: 'monthlyFee', page: 1, top: 283, left: 145, width: 113, height: 20, fontSize: 14 },
  { id: 'discount', page: 1, top: 302, left: 107, width: 153, height: 17, fontSize: 14 },
  { id: 'totalDiscount', page: 1, top: 194, left: 486, width: 80, height: 20, fontSize: 14 },
  { id: 'monthlyPayment1', page: 1, top: 268, left: 143, width: 115, height: 19, fontSize: 14 },
  { id: 'monthlyPayment2', page: 1, top: 262, left: 647, width: 93, height: 27, fontSize: 14 },
  { id: 'monthlyFee2', page: 1, top: 219, left: 270, width: 64, height: 26, fontSize: 14 },
  // 그린 판매점 전용 - 요금제명/월정액을 상단 빈공간에 별도 표시 (임시 좌표, 위치는 추후 수동 조정 예정)
  { id: 'topPlanName', page: 1, top: 36, left: 291, width: 190, height: 28, fontSize: 12 },
  { id: 'topAmount', page: 1, top: 70, left: 291, width: 190, height: 28, fontSize: 12 },
  // 가입내역 박스 내 요금제명 (임시 좌표, 위치는 추후 수동 조정 예정)
  { id: 'planName3', page: 1, top: 647, left: 147, width: 258, height: 23, fontSize: 14 },
  // 납부방법 - 계좌/카드 정보
  { id: 'bankOrCard', page: 1, top: 565, left: 226, width: 92, height: 24, fontSize: 14 },
  { id: 'accountOrCardNumber', page: 1, top: 564, left: 338, width: 236, height: 26, fontSize: 14 },
  { id: 'cardExpiry', page: 1, top: 568, left: 648, width: 69, height: 22, fontSize: 14 },
  // 예금주명 / 예금주 생년월일 (예금주명은 고객명을 그대로 표시 - 임시 좌표, debugMode로 조정 필요)
  { id: 'accountHolderName', page: 1, top: 539, left: 211, width: 325, height: 27, fontSize: 14 },
  { id: 'accountHolderBirthDate', page: 1, top: 539, left: 615, width: 112, height: 27, fontSize: 14 },
  { id: 'signDate', page: 1, top: 1017, left: 54, width: 100, height: 30, fontSize: 16 },
  // 판매점 정보 - 1페이지에 2곳, 6페이지에 1곳 표시 (임시 좌표, debugMode로 조정 필요)
  { id: 'dealerName1', page: 1, top: 339, left: 78, width: 84, height: 15, fontSize: 14 },
  { id: 'sellerName1', page: 1, top: 340, left: 177, width: 47, height: 15, fontSize: 14 },
  { id: 'sellerPhone1', page: 1, top: 339, left: 260, width: 89, height: 17, fontSize: 14 },
  { id: 'sellerAddress', page: 1, top: 338, left: 373, width: 120, height: 18, fontSize: 10 },
  { id: 'dealerName2', page: 1, top: 1014, left: 195, width: 121, height: 21, fontSize: 14 },
  { id: 'sellerName2', page: 1, top: 1030, left: 185, width: 69, height: 18, fontSize: 14 },
  { id: 'sellerPhone2', page: 1, top: 1029, left: 289, width: 104, height: 19, fontSize: 14 },
  { id: 'dealerName3', page: 6, top: 1004, left: 117, width: 133, height: 23, fontSize: 14 },
  { id: 'sellerName3', page: 6, top: 1006, left: 602, width: 115, height: 23, fontSize: 14 },
  { id: 'sellerPhone3', page: 6, top: 1003, left: 347, width: 167, height: 26, fontSize: 14 },
  // 6페이지 - 가입자명 / 생년월일 / 휴대폰 번호 (임시 좌표, debugMode로 조정 필요)
  { id: 'customerName', page: 6, top: 143, left: 173, width: 168, height: 31, fontSize: 14 },
  { id: 'birthDate', page: 6, top: 144, left: 405, width: 142, height: 29, fontSize: 14 },
  { id: 'phoneNumber', page: 6, top: 145, left: 600, width: 134, height: 29, fontSize: 14 },
  { id: 'signDate2', page: 6, top: 984, left: 110, width: 223, height: 25, fontSize: 16 },
  // 주 생활지역 (시/도, 구/시/군, 동/읍/면) - 가입자 주소에서 자동 추출, 임시 좌표
  { id: 'residenceSido', page: 1, top: 389, left: 85, width: 135, height: 22, fontSize: 12 },
  { id: 'residenceSigungu', page: 1, top: 411, left: 85, width: 135, height: 24, fontSize: 12 },
  { id: 'residenceDong', page: 1, top: 434, left: 85, width: 135, height: 28, fontSize: 12 },
  // 7페이지 - 요금제 / 요금제요금 / 할인 / 최종요금 / 판매직원 / 가입자전화 / 가입일자 (임시 좌표, debugMode로 조정 필요)
  { id: 'planName2', page: 7, top: 171, left: 411, width: 107, height: 26, fontSize: 14 },
  { id: 'monthlyFee3', page: 7, top: 193, left: 432, width: 93, height: 27, fontSize: 14 },
  { id: 'discount2', page: 7, top: 244, left: 433, width: 68, height: 26, fontSize: 14 },
  { id: 'monthlyPayment3', page: 7, top: 427, left: 436, width: 87, height: 36, fontSize: 14 },
  { id: 'monthlyPayment4', page: 7, top: 421, left: 672, width: 69, height: 29, fontSize: 14 },
  { id: 'sellerName4', page: 7, top: 991, left: 114, width: 61, height: 24, fontSize: 14 },
  { id: 'phoneNumber', page: 7, top: 972, left: 514, width: 190, height: 24, fontSize: 14 },
  { id: 'signDate3', page: 7, top: 993, left: 552, width: 134, height: 29, fontSize: 14 },
];

interface FormData {
  customerName: string;
  birthDate: string;
  // foreignerNumber: string; // 외국인등록번호 - 아직 미사용
  phoneNumber: string;
  address: string;
  jibunAddress: string;
  usimModel: string;
  usimNumber: string;
  plan: string;
  promotionApplied: '적용' | '미적용';
  promotion: string;
  // prevCarrier: string; // 전통신사 - 우선 신규만 고려, 아직 미사용
  // mvnoDetail: string;
  paymentMethod: '계좌' | '카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  accountHolderBirthDate: string;
  vendor: string;
  signDate: string;
}

export default function LGApplicationPage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    birthDate: '',
    // foreignerNumber: '',
    phoneNumber: '',
    address: BASE_ADDRESS,
    jibunAddress: '',
    usimModel: '',
    usimNumber: '',
    plan: '',
    promotionApplied: '미적용',
    promotion: '',
    // prevCarrier: '',
    // mvnoDetail: '',
    paymentMethod: '계좌',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
    accountHolderBirthDate: '',
    vendor: 'entoel',
    signDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'customerName' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePaymentMethodChange = (value: '계좌' | '카드') => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
      cardExpiry: value === '계좌' ? '' : prev.cardExpiry,
    }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      birthDate: '',
      // foreignerNumber: '',
      phoneNumber: '',
      address: BASE_ADDRESS,
      jibunAddress: '',
      usimModel: '',
      usimNumber: '',
      plan: '',
      promotionApplied: '미적용',
      promotion: '',
      // prevCarrier: '',
      // mvnoDetail: '',
      paymentMethod: '계좌',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      accountHolderBirthDate: '',
      vendor: 'entoel',
      signDate: todayFormatted,
    });
  };

  // 카드 유효기간 포맷팅 (2512 -> 25        12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = ' ';
      return `${yy}${nbsp.repeat(6)}${mm}`;
    }
    return expiry;
  };

  // 신청일자 포맷팅 (2026.07.15 -> 2026    07    15, "년 월 일" 서식 위치에 맞춰 . 제거 후 공백으로 정렬)
  // spacing: 연-월, 월-일 사이 공백 개수 (페이지마다 서식 간격이 달라 조정 가능)
  // yearDigits: 4면 "2026" 그대로, 2면 "20"이 서식에 이미 인쇄되어 있어 뒤 2자리("26")만 표시
  const formatSignDate = (date: string, spacing = 4, yearDigits: 2 | 4 = 4) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      const year = yearDigits === 2 ? parts[0].slice(-2) : parts[0];
      return `${year}${nbsp.repeat(spacing)}${parts[1]}${nbsp.repeat(spacing)}${parts[2]}`;
    }
    return date;
  };

  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === formData.plan);
  const selectedPromotion = selectedPlan?.promotions.find((p) => p.value === formData.promotion);
  // 프로모션 미적용 선택 시(또는 세부 단계 미선택 시) 프로모션 할인 0원으로 간주 (선약할인만 적용된 금액)
  const promotionAmount = formData.promotionApplied === '적용' ? (selectedPromotion?.amount ?? 0) : 0;
  const monthlyPayment = selectedPlan ? selectedPlan.monthlyFee - selectedPlan.discount - promotionAmount : 0;
  // 전통신사 - 우선 신규만 고려, 아직 미사용
  // const carrierCheckLabel = CARRIER_OPTIONS.find((c) => c.value === formData.prevCarrier)?.label;
  const selectedVendor = VENDOR_OPTIONS.find((v) => v.value === formData.vendor) || VENDOR_OPTIONS[0];
  // 그린 판매점은 1페이지 요금제 영역에 금액을 표시하지 않고(유심단독개통으로만 표시), 실제 요금제명/월정액은 상단 빈공간에 별도 표시
  const isGreenVendor = formData.vendor === 'green';

  // 예금주 생년월일 미입력 시 가입자 생년월일을 기본값으로 사용
  const accountHolderBirthDateValue = formData.accountHolderBirthDate || formData.birthDate;

  // 주 생활지역 - 가입자 지번주소에서 자동 추출 (지번주소가 없으면 입력된 주소로 대체)
  const residenceRegion = parseResidenceRegion(formData.jibunAddress || formData.address);

  // 선택된 전통신사에 따라 체크 위치를 동적으로 생성
  // const carrierCheckPos = formData.prevCarrier ? CARRIER_CHECK_POSITIONS[formData.prevCarrier] : null;

  const fieldPositions: FieldPosition[] = [...BASE_FIELD_POSITIONS];

  const fieldValues: FieldValue = {
    customerName: formData.customerName,
    birthDate: formData.birthDate,
    // foreignerNumber: formData.foreignerNumber,
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    address: formData.address,
    residenceSido: residenceRegion.sido,
    residenceSigungu: residenceRegion.sigungu,
    residenceDong: residenceRegion.dong,
    usimModel: formData.usimModel,
    usimNumber: formData.usimNumber,
    // 그린 판매점: 1페이지 요금제 영역은 '유심단독개통'만 표시하고 금액은 비움, 실제 요금제명/월정액은 topPlanName/topAmount로 표시
    planName: isGreenVendor ? (selectedPlan ? '유심단독개통' : '') : selectedPlan?.label || '',
    monthlyFee: isGreenVendor ? '' : selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    monthlyFee2: isGreenVendor ? '' : selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    discount: isGreenVendor ? '' : selectedPlan ? `선택약정할인 ${formatWon(selectedPlan.discount)}` : '',
    totalDiscount: isGreenVendor ? '' : selectedPlan ? formatWon(selectedPlan.discount * 12) : '',
    monthlyPayment1: isGreenVendor ? '' : selectedPlan ? formatWon(monthlyPayment) : '',
    monthlyPayment2: isGreenVendor ? '' : selectedPlan ? formatWon(monthlyPayment) : '',
    topPlanName: isGreenVendor && selectedPlan ? `요금제명 : ${selectedPlan.label}` : '',
    topAmount: isGreenVendor && selectedPlan ? `월요금 : ${formatWon(selectedPlan.monthlyFee)}` : '',
    // 1페이지 "가입내역" 박스 내 요금제명 - 그린 판매점은 '유심단독개통'으로 표시
    planName3: isGreenVendor ? (selectedPlan ? '유심단독개통' : '') : selectedPlan?.label || '',
    // 7페이지(무선서비스 계약 표준안내서) 요금제 영역 - 그린 판매점은 1페이지와 동일하게 '유심단독개통'만 표시하고 금액은 비움
    planName2: isGreenVendor ? (selectedPlan ? '유심단독개통' : '') : selectedPlan?.label || '',
    monthlyFee3: isGreenVendor ? '' : selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    discount2: isGreenVendor ? '' : selectedPlan ? formatWon(selectedPlan.discount) : '',
    monthlyPayment3: isGreenVendor ? '' : selectedPlan ? formatWon(monthlyPayment) : '',
    monthlyPayment4: isGreenVendor ? '' : selectedPlan ? formatWon(monthlyPayment) : '',
    // carrierCheck: carrierCheckLabel ? '✓' : '',
    // mvnoDetail: formData.prevCarrier === 'mvno' ? formData.mvnoDetail : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    accountHolderName: formData.customerName,
    accountHolderBirthDate: accountHolderBirthDateValue,
    dealerName1: selectedVendor.storeName,
    sellerName1: selectedVendor.sellerName,
    sellerPhone1: selectedVendor.sellerPhone,
    sellerAddress: selectedVendor.sellerAddress,
    dealerName2: selectedVendor.storeName,
    sellerName2: selectedVendor.sellerName,
    sellerPhone2: selectedVendor.sellerPhone,
    dealerName3: selectedVendor.storeName,
    sellerName3: selectedVendor.sellerName,
    sellerPhone3: selectedVendor.sellerPhone,
    sellerName4: selectedVendor.sellerName,
    signDate: formatSignDate(formData.signDate),
    signDate2: formatSignDate(formData.signDate, 14),
    // 7페이지는 서식에 연도 "20"이 이미 인쇄되어 있어 뒤 2자리만 표시, 간격은 임시값(debugMode로 조정 필요)
    signDate3: formatSignDate(formData.signDate, 12, 2),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="LG 신청서" subtitle="LG U+ 이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청서 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요 (좌표는 추후 조정 예정)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 판매업체 - 요금제 인쇄 방식이 판매점마다 달라 최상단에 배치 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">판매업체</p>
                      <RadioGroup value={formData.vendor} onValueChange={(value) => setFormData((prev) => ({ ...prev, vendor: value }))} className="flex gap-6">
                        {VENDOR_OPTIONS.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`vendor-${option.value}`} />
                            <Label htmlFor={`vendor-${option.value}`} className="font-normal cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                      <div className="rounded-md border bg-white p-3 text-sm space-y-1">
                        <p>
                          판매점 상호: <span className="font-medium">{selectedVendor.storeName}</span>
                        </p>
                        <p>
                          판매자: <span className="font-medium">{selectedVendor.sellerName || '-'}</span>
                        </p>
                        <p>
                          판매자전화: <span className="font-medium">{selectedVendor.sellerPhone || '-'}</span>
                        </p>
                        <p>
                          판매자 주소: <span className="font-medium">{selectedVendor.sellerAddress || '-'}</span>
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="홍길동" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">
                          생년월일 (6자리) <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                      </div>
                      {/* 외국인등록번호 - 아직 미사용, 필요 시 주석 해제
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="foreignerNumber">외국인등록번호</Label>
                          <Input id="foreignerNumber" name="foreignerNumber" value={formData.foreignerNumber} onChange={handleChange} placeholder="내국인은 미입력" />
                        </div>
                      </div>
                      */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            전화번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usimModel">USIM 모델명</Label>
                          <Input id="usimModel" name="usimModel" value={formData.usimModel} onChange={handleChange} placeholder="모델명 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usimNumber">USIM 일련번호</Label>
                          <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="0000 0000 0000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <AddressInput id="address" value={formData.address} onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} onSelectAddress={({ jibunAddress }) => setFormData((prev) => ({ ...prev, jibunAddress }))} />
                        <p className="text-xs text-muted-foreground">
                          주 생활지역(지번주소 기준 자동 추출): {residenceRegion.sido || '-'} · {residenceRegion.sigungu || '-'} · {residenceRegion.dong || '-'}
                        </p>
                      </div>
                    </div>

                    {/* 전통신사 - 우선 신규만 고려, 아직 미사용
                    <Separator />
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">전통신사</p>
                      <div className="space-y-2">
                        <RadioGroup value={formData.prevCarrier} onValueChange={(value) => setFormData((prev) => ({ ...prev, prevCarrier: value }))} className="flex flex-wrap gap-4">
                          {CARRIER_OPTIONS.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                              <RadioGroupItem value={option.value} id={`carrier-${option.value}`} />
                              <Label htmlFor={`carrier-${option.value}`} className="font-normal cursor-pointer">
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        {formData.prevCarrier === 'mvno' && (
                          <div className="space-y-2 pt-2">
                            <Label htmlFor="mvnoDetail">
                              알뜰폰 통신사명 <span className="text-destructive">*</span>
                            </Label>
                            <Input id="mvnoDetail" name="mvnoDetail" value={formData.mvnoDetail} onChange={handleChange} placeholder="알뜰폰 통신사명 입력" />
                          </div>
                        )}
                      </div>
                    </div>
                    */}

                    <Separator />

                    {/* 요금제 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금제</p>
                      <div className="space-y-2">
                        <Label htmlFor="plan">
                          요금제 선택 <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.plan} onValueChange={(value) => setFormData((prev) => ({ ...prev, plan: value, promotionApplied: '미적용', promotion: '' }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="요금제를 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {PLAN_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} ({formatWon(option.monthlyFee)}원)
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {selectedPlan && (
                        <div className="space-y-2">
                          <Label>프로모션 할인 적용 여부</Label>
                          <RadioGroup value={formData.promotionApplied} onValueChange={(value) => setFormData((prev) => ({ ...prev, promotionApplied: value as '적용' | '미적용', promotion: value === '미적용' ? '' : prev.promotion }))} className="flex gap-6">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="미적용" id="promotion-off" />
                              <Label htmlFor="promotion-off" className="font-normal cursor-pointer">
                                미적용
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="적용" id="promotion-on" />
                              <Label htmlFor="promotion-on" className="font-normal cursor-pointer">
                                적용
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                      {selectedPlan && formData.promotionApplied === '적용' && (
                        <div className="space-y-2">
                          <Label htmlFor="promotion">프로모션 단계</Label>
                          <Select value={formData.promotion} onValueChange={(value) => setFormData((prev) => ({ ...prev, promotion: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="프로모션을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedPlan.promotions.map((promo) => (
                                <SelectItem key={promo.value} value={promo.value}>
                                  {promo.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                      {selectedPlan && (
                        <div className="rounded-md border bg-white p-3 text-sm space-y-1">
                          <p>
                            월정액: <span className="font-medium">{formatWon(selectedPlan.monthlyFee)}원</span>
                          </p>
                          <p>
                            선약할인: <span className="font-medium">-{formatWon(selectedPlan.discount)}원</span>
                          </p>
                          <p>
                            프로모션 할인: <span className="font-medium">-{formatWon(promotionAmount)}원</span>
                          </p>
                          <p>
                            월납부액: <span className="font-medium">{formatWon(monthlyPayment)}원</span>
                          </p>
                          <p>
                            총 요금할인 (선약할인 12개월): <span className="font-medium">-{formatWon(selectedPlan.discount * 12)}원</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    {/* 납부방법 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">납부방법</p>
                      <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handlePaymentMethodChange(value as '계좌' | '카드')} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="계좌" id="payment-account" />
                          <Label htmlFor="payment-account" className="font-normal cursor-pointer">
                            계좌
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="카드" id="payment-card" />
                          <Label htmlFor="payment-card" className="font-normal cursor-pointer">
                            카드
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className={`grid gap-4 ${formData.paymentMethod === '카드' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="bankOrCard">
                            {formData.paymentMethod === '계좌' ? '은행명' : '카드사'} <span className="text-destructive">*</span>
                          </Label>
                          <Input id="bankOrCard" name="bankOrCard" value={formData.bankOrCard} onChange={handleChange} placeholder={formData.paymentMethod === '계좌' ? '국민은행' : '삼성카드'} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountOrCardNumber">
                            {formData.paymentMethod === '계좌' ? '계좌번호' : '카드번호'} <span className="text-destructive">*</span>
                          </Label>
                          <Input id="accountOrCardNumber" name="accountOrCardNumber" value={formData.accountOrCardNumber} onChange={handleChange} placeholder={formData.paymentMethod === '계좌' ? '123-456-789012' : '1234-5678-9012-3456'} />
                        </div>
                        {formData.paymentMethod === '카드' && (
                          <div className="space-y-2">
                            <Label htmlFor="cardExpiry">
                              유효기간 (YYMM) <span className="text-destructive">*</span>
                            </Label>
                            <Input id="cardExpiry" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} placeholder="2512" maxLength={4} />
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountHolderBirthDate">예금주 생년월일 (6자리)</Label>
                        <DateInput id="accountHolderBirthDate" format="6" value={accountHolderBirthDateValue} onChange={(value) => setFormData((prev) => ({ ...prev, accountHolderBirthDate: value }))} />
                        <p className="text-xs text-muted-foreground">미입력 시 가입자 생년월일과 동일하게 표시됩니다</p>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청날짜 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signDate">
                          신청일자 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="signDate" value={formData.signDate} onChange={(value) => setFormData((prev) => ({ ...prev, signDate: value }))} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          {/* 우측: 서식지 미리보기 */}
          <div ref={previewRef} className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="">
                {debugMode && <p className="text-xs text-muted-foreground mb-2">이미지를 클릭하면 좌표가 표시됩니다</p>}
                <ImageViewer images={PAGE_IMAGES} fieldPositions={fieldPositions} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 인쇄 모달 */}
      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={fieldPositions} fieldValues={fieldValues} />
    </>
  );
}
