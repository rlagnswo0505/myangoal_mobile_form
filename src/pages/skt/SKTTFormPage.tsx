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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import DateInput from '@/components/Form/DateInput';
import PhoneInput, { formatPhoneWithDash } from '@/components/Form/PhoneInput';
import AddressInput from '@/components/Form/AddressInput';
import sktTFormPage1 from '@/assets/templates/SKT 티폼 양식지_1.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [sktTFormPage1];

// 매장 정보 (고정값, 필요 시 수정 가능)
const STORE_INFO = { storeName: '미얀골', dealerName: '미얀골', sellerName: '김재윤', sellerPhone: '010-4427-7675' };

// 가입유형 체크 위치 (☐신규 ☐번호이동 ☐기기변경 - 임시 좌표, debugMode로 조정 필요)
const SUBSCRIPTION_TYPE_POSITIONS: Record<'new' | 'transfer' | 'change', { top: number; left: number }> = {
  new: { top: 132, left: 156 },
  transfer: { top: 132, left: 280 },
  change: { top: 132, left: 447 },
};

// 고객구분 체크 위치 (☐성인 ☐청소년 ☐개인사업자 ☐법인 ☐외국인 ☐공공기관 - 임시 좌표, debugMode로 조정 필요)
const CUSTOMER_TYPE_POSITIONS: Record<'adult' | 'youth' | 'business' | 'corp' | 'foreigner' | 'public', { top: number; left: number }> = {
  adult: { top: 168, left: 156 },
  youth: { top: 168, left: 235 },
  business: { top: 168, left: 315 },
  corp: { top: 168, left: 455 },
  foreigner: { top: 168, left: 524 },
  public: { top: 168, left: 630 },
};

// 납부방법 체크 위치 (☐은행 ☐카드 ☐지로 - 임시 좌표, debugMode로 조정 필요)
const PAYMENT_METHOD_POSITIONS: Record<'bank' | 'card' | 'giro', { top: number; left: number }> = {
  bank: { top: 330, left: 156 },
  card: { top: 330, left: 269 },
  giro: { top: 330, left: 381 },
};

// 이전통신사 옵션 및 체크 위치 (SKT 서식: KT / LG U+ / MVNO - 임시 좌표, debugMode로 조정 필요)
const CARRIER_OPTIONS = [
  { value: 'kt', label: 'KT' },
  { value: 'lg', label: 'LG U+' },
  { value: 'mvno', label: 'MVNO' },
];
const CARRIER_POSITIONS: Record<string, { top: number; left: number }> = {
  kt: { top: 414, left: 264 },
  lg: { top: 414, left: 380 },
  mvno: { top: 414, left: 496 },
};

// MVNO 통신사명 입력 위치 (MVNO 체크박스 옆)
const MVNO_CARRIER_NAME_POSITION = { top: 402, left: 575, width: 154, height: 21 };

// 인증방법 체크 위치 (☐단말(유심)일련번호 ☐신용카드 ☐은행계좌 ☐지로납부 - 임시 좌표, debugMode로 조정 필요)
const AUTH_METHOD_POSITIONS: Record<'device' | 'card' | 'account' | 'giro', { top: number; left: number }> = {
  device: { top: 440, left: 266 },
  card: { top: 440, left: 428 },
  account: { top: 440, left: 534 },
  giro: { top: 440, left: 633 },
};

// 지원방식 체크 위치 (선택약정 고정 - ☐선택약정 - 임시 좌표, debugMode로 조정 필요)
const SUPPORT_TYPE_POSITION = { top: 496, left: 432 };

// USIM 접수방법 체크 위치 (☐즉납 ☐후납 ☐기존유심 - 임시 좌표, debugMode로 조정 필요)
const USIM_TYPE_POSITIONS: Record<'now' | 'later' | 'existing', { top: number; left: number }> = {
  now: { top: 843, left: 577 },
  later: { top: 843, left: 617 },
  existing: { top: 843, left: 660 },
};

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 매장 정보 (상단 우측)
  { id: 'activationDate', page: 1, top: 35, left: 571, width: 129, height: 16, fontSize: 11 },
  { id: 'storeName', page: 1, top: 57, left: 571, width: 129, height: 16, fontSize: 11 },
  { id: 'dealerName', page: 1, top: 77, left: 571, width: 129, height: 16, fontSize: 11 },
  // 고객정보
  { id: 'customerName', page: 1, top: 202, left: 185, width: 132, height: 18, fontSize: 12 },
  { id: 'residentNumber', page: 1, top: 202, left: 365, width: 170, height: 19, fontSize: 11 },
  { id: 'activationNumber', page: 1, top: 202, left: 584, width: 140, height: 18, fontSize: 12 },
  { id: 'email', page: 1, top: 224, left: 185, width: 348, height: 18, fontSize: 11 },
  { id: 'phoneNumber', page: 1, top: 224, left: 584, width: 140, height: 18, fontSize: 12 },
  { id: 'address', page: 1, top: 248, left: 185, width: 539, height: 18, fontSize: 11 },
  // 납부정보
  { id: 'cardValidYear', page: 1, top: 324, left: 614, width: 36, height: 20, fontSize: 11 },
  { id: 'cardValidMonth', page: 1, top: 324, left: 664, width: 36, height: 20, fontSize: 11 },
  { id: 'bankOrCard', page: 1, top: 347, left: 225, width: 165, height: 21, fontSize: 11 },
  { id: 'accountOrCardNumber', page: 1, top: 342, left: 488, width: 233, height: 26, fontSize: 11 },
  { id: 'accountHolderName', page: 1, top: 370, left: 201, width: 130, height: 22, fontSize: 11 },
  { id: 'accountHolderRelation', page: 1, top: 373, left: 350, width: 27, height: 20, fontSize: 11 },
  { id: 'accountHolderResidentNumber', page: 1, top: 370, left: 450, width: 84, height: 16, fontSize: 11 },
  { id: 'accountHolderPhone', page: 1, top: 370, left: 607, width: 118, height: 16, fontSize: 11 },
  // 번호이동 인증정보
  { id: 'authLast4', page: 1, top: 453, left: 330, width: 93, height: 22, fontSize: 12 },
  // 선택약정 개월
  { id: 'commitmentMonths', page: 1, top: 494, left: 502, width: 33, height: 22, fontSize: 11 },
  // 요금정보
  { id: 'planName', page: 1, top: 558, left: 466, width: 253, height: 16, fontSize: 11 },
  { id: 'monthlyFee', page: 1, top: 577, left: 462, width: 101, height: 24, fontSize: 11 },
  { id: 'planDiscountAmount', page: 1, top: 582, left: 620, width: 99, height: 19, fontSize: 11 },
  { id: 'monthlyPayment', page: 1, top: 760, left: 642, width: 65, height: 23, fontSize: 11 },
  // 부가정보
  { id: 'usimInfo', page: 1, top: 832, left: 274, width: 298, height: 26, fontSize: 11 },
  // 판매자 정보 (하단)
  { id: 'sellerName', page: 1, top: 1022, left: 401, width: 137, height: 25, fontSize: 11 },
  { id: 'sellerPhone', page: 1, top: 1020, left: 577, width: 148, height: 25, fontSize: 11 },
];

interface FormData {
  subscriptionType: 'new' | 'transfer' | 'change';
  customerType: 'adult' | 'youth' | 'business' | 'corp' | 'foreigner' | 'public';
  customerName: string;
  residentNumber: string;
  activationNumber: string;
  email: string;
  phoneNumber: string;
  address: string;
  paymentMethod: 'bank' | 'card' | 'giro';
  cardValidYear: string;
  cardValidMonth: string;
  bankOrCard: string;
  accountOrCardNumber: string;
  accountHolderName: string;
  accountHolderRelation: string;
  accountHolderResidentNumber: string;
  accountHolderPhone: string;
  prevCarrier: string;
  mvnoCarrierName: string;
  authMethod: 'device' | 'card' | 'account' | 'giro';
  authLast4: string;
  commitmentMonths: string;
  planName: string;
  monthlyFee: string;
  usimInfo: string;
  usimType: 'now' | 'later' | 'existing';
  activationDate: string;
}

// 개통일 기본값(오늘 날짜)을 포함한 초기값을 매번 새로 생성
const createInitialFormData = (): FormData => {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  return {
    subscriptionType: 'new',
    customerType: 'foreigner',
    customerName: '',
    residentNumber: '',
    activationNumber: '',
    email: 'rlawogbs0324@naver.com',
    phoneNumber: '',
    address: '',
    paymentMethod: 'bank',
    cardValidYear: '',
    cardValidMonth: '',
    bankOrCard: '',
    accountOrCardNumber: '',
    accountHolderName: '',
    accountHolderRelation: '본인',
    accountHolderResidentNumber: '',
    accountHolderPhone: '',
    prevCarrier: '',
    mvnoCarrierName: '',
    authMethod: 'device',
    authLast4: '',
    commitmentMonths: '12',
    planName: '',
    monthlyFee: '',
    usimInfo: '',
    usimType: 'now',
    activationDate: todayFormatted,
  };
};

export default function SKTTFormPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(createInitialFormData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 고객명 입력 시 예금주명도 함께 입력
  const handleCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, customerName: value, accountHolderName: value }));
  };

  // 개통번호 입력 시 연락처, 예금주연락처도 함께 입력
  const handleActivationNumberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, activationNumber: value, phoneNumber: value, accountHolderPhone: value }));
  };

  // 주민번호 입력 시 앞 6자리를 납부정보 주민번호(앞)에도 함께 입력
  const handleResidentNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const digitsOnly = value.replace(/[^0-9]/g, '');
    setFormData((prev) => ({ ...prev, residentNumber: value, accountHolderResidentNumber: digitsOnly.slice(0, 6) }));
  };

  // 연락처 입력 시 납부정보 연락처에도 함께 입력
  const handlePhoneNumberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value, accountHolderPhone: value }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
  };

  const isTransfer = formData.subscriptionType === 'transfer';

  const subscriptionTypePos = SUBSCRIPTION_TYPE_POSITIONS[formData.subscriptionType];
  const customerTypePos = CUSTOMER_TYPE_POSITIONS[formData.customerType];
  const paymentMethodPos = PAYMENT_METHOD_POSITIONS[formData.paymentMethod];
  const carrierPos = isTransfer && formData.prevCarrier ? CARRIER_POSITIONS[formData.prevCarrier] : null;
  const authMethodPos = isTransfer ? AUTH_METHOD_POSITIONS[formData.authMethod] : null;
  const usimTypePos = USIM_TYPE_POSITIONS[formData.usimType];

  // 약정할인 = 월정액의 25%, 월요금 = 월정액 - 약정할인 (직접 입력하지 않고 자동 계산)
  const monthlyFeeNumber = Number(formData.monthlyFee.replace(/[^0-9]/g, '')) || 0;
  const planDiscountAmountNumber = monthlyFeeNumber ? Math.round(monthlyFeeNumber * 0.25) : 0;
  const planDiscountAmountValue = monthlyFeeNumber ? String(planDiscountAmountNumber) : '';
  const monthlyPaymentValue = monthlyFeeNumber ? String(monthlyFeeNumber - planDiscountAmountNumber) : '';

  const fieldPositions: FieldPosition[] = [
    ...BASE_FIELD_POSITIONS,
    { id: 'subscriptionTypeCheck', page: 1, top: subscriptionTypePos.top, left: subscriptionTypePos.left, fontSize: 12 },
    { id: 'customerTypeCheck', page: 1, top: customerTypePos.top, left: customerTypePos.left, fontSize: 12 },
    { id: 'paymentMethodCheck', page: 1, top: paymentMethodPos.top, left: paymentMethodPos.left, fontSize: 12 },
    ...(carrierPos ? [{ id: 'carrierCheck', page: 1, top: carrierPos.top, left: carrierPos.left, fontSize: 12 }] : []),
    ...(isTransfer && formData.prevCarrier === 'mvno'
      ? [{ id: 'mvnoCarrierName', page: 1, top: MVNO_CARRIER_NAME_POSITION.top, left: MVNO_CARRIER_NAME_POSITION.left, width: MVNO_CARRIER_NAME_POSITION.width, height: MVNO_CARRIER_NAME_POSITION.height, fontSize: 11 }]
      : []),
    ...(authMethodPos ? [{ id: 'authMethodCheck', page: 1, top: authMethodPos.top, left: authMethodPos.left, fontSize: 12 }] : []),
    { id: 'supportTypeCheck', page: 1, top: SUPPORT_TYPE_POSITION.top, left: SUPPORT_TYPE_POSITION.left, fontSize: 12 },
    { id: 'usimTypeCheck', page: 1, top: usimTypePos.top, left: usimTypePos.left, fontSize: 12 },
  ];

  const fieldValues: FieldValue = {
    activationDate: formData.activationDate,
    storeName: STORE_INFO.storeName,
    dealerName: STORE_INFO.dealerName,
    subscriptionTypeCheck: '✓',
    customerTypeCheck: '✓',
    customerName: formData.customerName,
    residentNumber: formData.residentNumber,
    activationNumber: formData.activationNumber,
    email: formData.email,
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    address: formData.address,
    paymentMethodCheck: '✓',
    cardValidYear: formData.paymentMethod === 'card' ? formData.cardValidYear : '',
    cardValidMonth: formData.paymentMethod === 'card' ? formData.cardValidMonth : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    accountHolderName: formData.accountHolderName,
    accountHolderRelation: formData.accountHolderRelation,
    accountHolderResidentNumber: formData.accountHolderResidentNumber,
    accountHolderPhone: formatPhoneWithDash(formData.accountHolderPhone),
    carrierCheck: carrierPos ? '✓' : '',
    mvnoCarrierName: isTransfer && formData.prevCarrier === 'mvno' ? formData.mvnoCarrierName : '',
    authMethodCheck: authMethodPos ? '✓' : '',
    authLast4: isTransfer ? formData.authLast4 : '',
    supportTypeCheck: '✓',
    commitmentMonths: formData.commitmentMonths,
    planName: formData.planName,
    monthlyFee: formData.monthlyFee,
    planDiscountAmount: planDiscountAmountValue,
    monthlyPayment: monthlyPaymentValue,
    usimInfo: formData.usimInfo,
    usimTypeCheck: '✓',
    sellerName: STORE_INFO.sellerName,
    sellerPhone: STORE_INFO.sellerPhone,
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="SKT 티폼 사전기입서식" subtitle="SKT T-Form 사전기입서식" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 가입유형 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">가입유형</p>
                      <RadioGroup value={formData.subscriptionType} onValueChange={(value) => setFormData((prev) => ({ ...prev, subscriptionType: value as FormData['subscriptionType'] }))} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="subscription-new" />
                          <Label htmlFor="subscription-new" className="font-normal cursor-pointer">
                            신규
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="transfer" id="subscription-transfer" />
                          <Label htmlFor="subscription-transfer" className="font-normal cursor-pointer">
                            번호이동
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="change" id="subscription-change" />
                          <Label htmlFor="subscription-change" className="font-normal cursor-pointer">
                            기기변경
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 고객구분 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객구분</p>
                      <RadioGroup value={formData.customerType} onValueChange={(value) => setFormData((prev) => ({ ...prev, customerType: value as FormData['customerType'] }))} className="flex flex-wrap gap-4">
                        {[
                          { value: 'adult', label: '성인' },
                          { value: 'youth', label: '청소년' },
                          { value: 'business', label: '개인사업자' },
                          { value: 'corp', label: '법인' },
                          { value: 'foreigner', label: '외국인' },
                          { value: 'public', label: '공공기관' },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`customer-${option.value}`} />
                            <Label htmlFor={`customer-${option.value}`} className="font-normal cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="customerName">고객명</Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleCustomerNameChange} placeholder="홍길동" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="residentNumber">주민번호</Label>
                          <Input id="residentNumber" name="residentNumber" value={formData.residentNumber} onChange={handleResidentNumberChange} placeholder="000000-0000000" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="activationNumber">개통번호</Label>
                          <PhoneInput id="activationNumber" value={formData.activationNumber} onChange={handleActivationNumberChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">이메일</Label>
                          <Input id="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@email.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">연락처</Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={handlePhoneNumberChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <AddressInput id="address" value={formData.address} onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} />
                      </div>
                    </div>

                    <Separator />

                    {/* 납부정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">납부정보</p>
                      <RadioGroup value={formData.paymentMethod} onValueChange={(value) => setFormData((prev) => ({ ...prev, paymentMethod: value as FormData['paymentMethod'] }))} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="bank" id="payment-bank" />
                          <Label htmlFor="payment-bank" className="font-normal cursor-pointer">
                            은행
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="card" id="payment-card" />
                          <Label htmlFor="payment-card" className="font-normal cursor-pointer">
                            카드
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="giro" id="payment-giro" />
                          <Label htmlFor="payment-giro" className="font-normal cursor-pointer">
                            지로
                          </Label>
                        </div>
                      </RadioGroup>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankOrCard">{formData.paymentMethod === 'card' ? '카드사' : '은행명'}</Label>
                          <Input id="bankOrCard" name="bankOrCard" value={formData.bankOrCard} onChange={handleChange} placeholder={formData.paymentMethod === 'card' ? '삼성카드' : '국민은행'} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountOrCardNumber">{formData.paymentMethod === 'card' ? '카드번호' : '계좌번호'}</Label>
                          <Input id="accountOrCardNumber" name="accountOrCardNumber" value={formData.accountOrCardNumber} onChange={handleChange} placeholder={formData.paymentMethod === 'card' ? '1234-5678-9012-3456' : '123-456-789012'} />
                        </div>
                      </div>
                      {formData.paymentMethod === 'card' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cardValidYear">유효기간(년)</Label>
                            <Input id="cardValidYear" name="cardValidYear" value={formData.cardValidYear} onChange={handleChange} placeholder="26" maxLength={2} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cardValidMonth">유효기간(월)</Label>
                            <Input id="cardValidMonth" name="cardValidMonth" value={formData.cardValidMonth} onChange={handleChange} placeholder="12" maxLength={2} />
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderName">예금주명</Label>
                          <Input id="accountHolderName" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderRelation">관계</Label>
                          <Input id="accountHolderRelation" name="accountHolderRelation" value={formData.accountHolderRelation} onChange={handleChange} placeholder="본인" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderResidentNumber">주민번호(앞)</Label>
                          <DateInput id="accountHolderResidentNumber" format="6" value={formData.accountHolderResidentNumber} onChange={(value) => setFormData((prev) => ({ ...prev, accountHolderResidentNumber: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderPhone">연락처</Label>
                          <PhoneInput id="accountHolderPhone" value={formData.accountHolderPhone} onChange={(value) => setFormData((prev) => ({ ...prev, accountHolderPhone: value }))} />
                        </div>
                      </div>
                    </div>

                    {isTransfer && (
                      <>
                        <Separator />
                        {/* 번호이동 인증정보 */}
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">번호이동 인증정보</p>
                          <div className="space-y-2">
                            <Label>이전통신사</Label>
                            <RadioGroup
                              value={formData.prevCarrier}
                              onValueChange={(value) => setFormData((prev) => ({ ...prev, prevCarrier: value, mvnoCarrierName: value === 'mvno' ? prev.mvnoCarrierName : '' }))}
                              className="flex flex-wrap gap-4"
                            >
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
                                <Label htmlFor="mvnoCarrierName">MVNO 통신사명</Label>
                                <Input id="mvnoCarrierName" name="mvnoCarrierName" value={formData.mvnoCarrierName} onChange={handleChange} placeholder="예: 프리티, 아이즈모바일 등" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label>인증방법</Label>
                            <RadioGroup value={formData.authMethod} onValueChange={(value) => setFormData((prev) => ({ ...prev, authMethod: value as FormData['authMethod'] }))} className="flex flex-wrap gap-4">
                              {[
                                { value: 'device', label: '단말(유심)일련번호' },
                                { value: 'card', label: '신용카드' },
                                { value: 'account', label: '은행계좌' },
                                { value: 'giro', label: '지로납부' },
                              ].map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`auth-${option.value}`} />
                                  <Label htmlFor={`auth-${option.value}`} className="font-normal cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="authLast4">인증 뒤 4자리</Label>
                            <Input id="authLast4" name="authLast4" value={formData.authLast4} onChange={handleChange} placeholder="0000" maxLength={4} />
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* 지원방식 - 선택약정 고정 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">지원방식 (선택약정 고정)</p>
                      <div className="space-y-2">
                        <Label htmlFor="commitmentMonths">선택약정 개월</Label>
                        <Input id="commitmentMonths" name="commitmentMonths" value={formData.commitmentMonths} onChange={handleChange} placeholder="24" maxLength={2} />
                      </div>
                    </div>

                    <Separator />

                    {/* 요금정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="planName">요금제명</Label>
                        <Input id="planName" name="planName" value={formData.planName} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="monthlyFee">월정액(원)</Label>
                        <Input id="monthlyFee" name="monthlyFee" value={formData.monthlyFee} onChange={handleChange} />
                        <p className="text-xs text-muted-foreground">약정할인(25%): {planDiscountAmountValue ? `${planDiscountAmountValue}원` : '-'}</p>
                        <p className="text-xs text-muted-foreground">월요금(월정액 - 약정할인): {monthlyPaymentValue ? `${monthlyPaymentValue}원` : '-'}</p>
                      </div>
                    </div>

                    <Separator />

                    {/* 부가정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">부가정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="usimInfo">USIM 모델명 및 일련번호</Label>
                        <Input id="usimInfo" name="usimInfo" value={formData.usimInfo} onChange={handleChange} />
                      </div>
                      <RadioGroup value={formData.usimType} onValueChange={(value) => setFormData((prev) => ({ ...prev, usimType: value as FormData['usimType'] }))} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="now" id="usim-now" />
                          <Label htmlFor="usim-now" className="font-normal cursor-pointer">
                            즉납
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="later" id="usim-later" />
                          <Label htmlFor="usim-later" className="font-normal cursor-pointer">
                            후납
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="existing" id="usim-existing" />
                          <Label htmlFor="usim-existing" className="font-normal cursor-pointer">
                            기존유심
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 개통일 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="activationDate">개통일</Label>
                        <DateInput id="activationDate" value={formData.activationDate} onChange={(value) => setFormData((prev) => ({ ...prev, activationDate: value }))} />
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
