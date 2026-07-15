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
import skContractPage1 from '@/assets/templates/SK 신규계약서_1.jpg';
import skContractPage2 from '@/assets/templates/SK 신규계약서_2.jpg';
import skContractPage3 from '@/assets/templates/SK 신규계약서_3.jpg';
import skContractPage4 from '@/assets/templates/SK 신규계약서_4.jpg';
import skContractPage5 from '@/assets/templates/SK 신규계약서_5.jpg';
import skContractPage6 from '@/assets/templates/SK 신규계약서_6.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [skContractPage1, skContractPage2, skContractPage3, skContractPage4, skContractPage5, skContractPage6];

// 요금제 옵션 (월정액 / 할인액 / 월납부액)
const PLAN_OPTIONS = [
  { value: 'easy_s', label: 'Easy S', monthlyFee: 39000, discount: 9750, monthlyPayment: 29250 },
  { value: 'easy_m', label: 'Easy M', monthlyFee: 49000, discount: 12250, monthlyPayment: 36750 },
  { value: 'easy_l', label: 'Easy L', monthlyFee: 59000, discount: 14750, monthlyPayment: 44250 },
  { value: 'easy_xl', label: 'Easy XL', monthlyFee: 69000, discount: 17250, monthlyPayment: 51750 },
];

const formatWon = (amount: number) => amount.toLocaleString('ko-KR');

// 주소 기본값
const BASE_ADDRESS = '인천광역시 부평구 광장로 16 부평민자역사 1층 10~12호';

// 전통신사 옵션 (번호이동 시 변경 전 통신사)
const CARRIER_OPTIONS = [
  { value: 'kt', label: 'KT' },
  { value: 'lg', label: 'LG U+' },
  { value: 'mvno', label: 'MVNO' },
];

// 전통신사별 체크 위치 (변경전통신사 ○ KT ○ LG U+ ○ MVNO - 임시 좌표, debugMode로 조정 필요)
const CARRIER_CHECK_POSITIONS: Record<string, { top: number; left: number }> = {
  kt: { top: 586, left: 393 },
  lg: { top: 586, left: 430 },
  mvno: { top: 586, left: 480 },
};

// 가입유형(신규/번호이동) 체크 위치 (업무구분 ☐신규 ☐번호이동 - 임시 좌표, debugMode로 조정 필요)
const SUBSCRIPTION_TYPE_POSITIONS: Record<'new' | 'transfer', { top: number; left: number }> = {
  new: { top: 92, left: 74 },
  transfer: { top: 92, left: 106 },
};

// 판매점 정보 (고정)
const DEALER_INFO = { storeName: '미얀골', sellerName: '김재윤', sellerPhone: '010-4427-7675' };

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  { id: 'customerName', page: 1, top: 403, left: 167, width: 192, height: 24, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 532, left: 541, width: 180, height: 27, fontSize: 14 },
  { id: 'foreignerNumber', page: 1, top: 401, left: 523, width: 152, height: 27, fontSize: 14 },
  { id: 'phoneNumber', page: 1, top: 428, left: 583, width: 165, height: 25, fontSize: 14 },
  { id: 'address', page: 1, top: 428, left: 168, width: 369, height: 25, fontSize: 12 },
  { id: 'usimNumber', page: 1, top: 645, left: 166, width: 184, height: 25, fontSize: 14 },
  // 번호이동정보 - 이동할 전화번호 / 알뜰폰 상세 (임시 좌표, debugMode로 조정 필요)
  { id: 'portNumber', page: 1, top: 586, left: 143, width: 110, height: 20, fontSize: 12 },
  { id: 'mvnoDetail', page: 1, top: 586, left: 520, width: 42, height: 20, fontSize: 11 },
  // 요금제 정보 - 월정액 1곳, 할인액/월납부액은 서식지 내 2곳에 표시
  { id: 'planName', page: 1, top: 224, left: 137, width: 136, height: 28, fontSize: 14 },
  { id: 'monthlyFee', page: 1, top: 249, left: 207, width: 110, height: 26, fontSize: 14 },
  { id: 'discount1', page: 1, top: 276, left: 207, width: 105, height: 27, fontSize: 14 },
  { id: 'discount2', page: 1, top: 305, left: 207, width: 75, height: 25, fontSize: 14 },
  { id: 'monthlyPayment1', page: 1, top: 226, left: 666, width: 82, height: 32, fontSize: 14 },
  { id: 'monthlyPayment2', page: 1, top: 298, left: 666, width: 81, height: 32, fontSize: 14 },
  // 납부방법 - 계좌/카드 정보
  { id: 'bankOrCard', page: 1, top: 506, left: 244, width: 132, height: 26, fontSize: 14 },
  { id: 'accountOrCardNumber', page: 1, top: 507, left: 433, width: 198, height: 25, fontSize: 14 },
  { id: 'cardExpiry', page: 1, top: 505, left: 674, width: 60, height: 27, fontSize: 14 },
  // 예금주명 / 예금주 전화번호 (신규 입력 필드 없이 고객명·전화번호를 그대로 표시 - 임시 좌표, debugMode로 조정 필요)
  { id: 'accountHolderName', page: 1, top: 532, left: 244, width: 132, height: 24, fontSize: 14 },
  { id: 'accountHolderPhone', page: 1, top: 562, left: 244, width: 230, height: 24, fontSize: 14 },
  { id: 'signDate', page: 1, top: 962, left: 590, width: 174, height: 30, fontSize: 16 },
  // 판매점 정보 - 임시 좌표, debugMode로 조정 필요
  { id: 'dealerName', page: 1, top: 1009, left: 188, width: 110, height: 21, fontSize: 14 },
  { id: 'sellerName', page: 1, top: 1019, left: 296, width: 76, height: 21, fontSize: 14 },
  { id: 'sellerPhone', page: 1, top: 1030, left: 189, width: 106, height: 20, fontSize: 14 },
  { id: 'agencyName', page: 1, top: 992, left: 188, width: 108, height: 18, fontSize: 14 },
  // 6페이지 - 대리점 / 매장명 / 판매자명 (임시 좌표, debugMode로 조정 필요)
  { id: 'agencyName2', page: 6, top: 946, left: 150, width: 243, height: 27, fontSize: 14 },
  { id: 'dealerName2', page: 6, top: 946, left: 503, width: 159, height: 24, fontSize: 14 },
  { id: 'sellerName2', page: 6, top: 972, left: 197, width: 55, height: 24, fontSize: 14 },
  // 6페이지 - 가입일자 / 월요금 / 할인요금 / 납부요금 (임시 좌표, debugMode로 조정 필요)
  { id: 'signDate2', page: 6, top: 1024, left: 180, width: 219, height: 25, fontSize: 14 },
  { id: 'planName2', page: 6, top: 282, left: 49, width: 120, height: 31, fontSize: 14 },
  { id: 'monthlyFee2', page: 6, top: 282, left: 200, width: 88, height: 30, fontSize: 14 },
  { id: 'discount3', page: 6, top: 284, left: 494, width: 72, height: 25, fontSize: 14 },
  { id: 'monthlyPayment3', page: 6, top: 281, left: 623, width: 97, height: 30, fontSize: 14 },
  { id: 'monthlyPayment4', page: 6, top: 350, left: 623, width: 97, height: 30, fontSize: 14 },
  { id: 'phoneNumber2', page: 6, top: 998, left: 167, width: 182, height: 26, fontSize: 14 },
];

interface FormData {
  subscriptionType: 'new' | 'transfer';
  customerName: string;
  birthDate: string;
  foreignerNumber: string;
  phoneNumber: string;
  address: string;
  usimNumber: string;
  plan: string;
  portNumber: string;
  prevCarrier: string;
  mvnoDetail: string;
  paymentMethod: '계좌' | '카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  signDate: string;
}

export default function SKNewContractPage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    subscriptionType: 'new',
    customerName: '',
    birthDate: '',
    foreignerNumber: '',
    phoneNumber: '',
    address: BASE_ADDRESS,
    usimNumber: '',
    plan: '',
    portNumber: '',
    prevCarrier: '',
    mvnoDetail: '',
    paymentMethod: '계좌',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
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
      subscriptionType: 'new',
      customerName: '',
      birthDate: '',
      foreignerNumber: '',
      phoneNumber: '',
      address: BASE_ADDRESS,
      usimNumber: '',
      plan: '',
      portNumber: '',
      prevCarrier: '',
      mvnoDetail: '',
      paymentMethod: '계좌',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      signDate: todayFormatted,
    });
  };

  // 카드 유효기간 포맷팅 (2512 -> 25        12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = ' ';
      return `${yy}${nbsp.repeat(6)}${mm}`;
    }
    return expiry;
  };

  // 신청일자 포맷팅 (2026.07.15 -> 2026    07    15, "년 월 일" 서식 위치에 맞춰 . 제거 후 공백으로 정렬)
  const formatSignDate = (date: string, spacing = 8) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(spacing)}${parts[1]}${nbsp.repeat(spacing)}${parts[2]}`;
    }
    return date;
  };

  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === formData.plan);
  const isTransfer = formData.subscriptionType === 'transfer';
  // 선택된 전통신사에 따라 체크 위치를 동적으로 생성 (번호이동일 때만 표시)
  const carrierCheckPos = isTransfer && formData.prevCarrier ? CARRIER_CHECK_POSITIONS[formData.prevCarrier] : null;
  const subscriptionTypePos = SUBSCRIPTION_TYPE_POSITIONS[formData.subscriptionType];

  const fieldPositions: FieldPosition[] = [
    ...BASE_FIELD_POSITIONS,
    { id: 'subscriptionTypeCheck', page: 1, top: subscriptionTypePos.top, left: subscriptionTypePos.left, fontSize: 12 },
    ...(carrierCheckPos ? [{ id: 'carrierCheck', page: 1, top: carrierCheckPos.top, left: carrierCheckPos.left, fontSize: 12 }] : []),
  ];

  const fieldValues: FieldValue = {
    customerName: formData.customerName,
    birthDate: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    phoneNumber2: formatPhoneWithDash(formData.phoneNumber),
    address: formData.address,
    usimNumber: formData.usimNumber,
    planName: selectedPlan?.label || '',
    monthlyFee: selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    discount1: selectedPlan ? `-${formatWon(selectedPlan.discount)}` : '',
    discount2: selectedPlan ? `-${formatWon(selectedPlan.discount)}` : '',
    monthlyPayment1: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
    monthlyPayment2: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
    subscriptionTypeCheck: '✓',
    portNumber: isTransfer ? formatPhoneWithDash(formData.portNumber) : '',
    carrierCheck: carrierCheckPos ? '✓' : '',
    mvnoDetail: isTransfer && formData.prevCarrier === 'mvno' ? formData.mvnoDetail : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    accountHolderName: formData.customerName,
    accountHolderPhone: formatPhoneWithDash(formData.phoneNumber),
    dealerName: DEALER_INFO.storeName,
    sellerName: DEALER_INFO.sellerName,
    sellerPhone: DEALER_INFO.sellerPhone,
    agencyName: DEALER_INFO.storeName,
    agencyName2: DEALER_INFO.storeName,
    dealerName2: DEALER_INFO.storeName,
    sellerName2: DEALER_INFO.sellerName,
    signDate: formatSignDate(formData.signDate),
    signDate2: formatSignDate(formData.signDate, 18),
    planName2: selectedPlan?.label || '',
    monthlyFee2: selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    discount3: selectedPlan ? `-${formatWon(selectedPlan.discount)}` : '',
    monthlyPayment3: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
    monthlyPayment4: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="SK 신규계약서" subtitle="SK 신규 계약서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                      <RadioGroup value={formData.subscriptionType} onValueChange={(value) => setFormData((prev) => ({ ...prev, subscriptionType: value as 'new' | 'transfer' }))} className="flex gap-6">
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
                      </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="홍길동" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">
                            생년월일 (6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                          <p className="text-xs text-muted-foreground">외국인등록번호 또는 주민등록번호 앞 6자리 사용</p>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreignerNumber">외국인등록번호</Label>
                          <Input id="foreignerNumber" name="foreignerNumber" value={formData.foreignerNumber} onChange={handleChange} placeholder="내국인은 미입력" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            전화번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usimNumber">USIM 번호</Label>
                          <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="0000 0000 0000" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <AddressInput id="address" value={formData.address} onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} />
                      </div>
                    </div>

                    {isTransfer && (
                      <>
                        <Separator />

                        {/* 번호이동정보 */}
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">번호이동정보</p>
                          <div className="space-y-2">
                            <Label htmlFor="portNumber">
                              이동할 전화번호 <span className="text-destructive">*</span>
                            </Label>
                            <PhoneInput id="portNumber" value={formData.portNumber} onChange={(value) => setFormData((prev) => ({ ...prev, portNumber: value }))} />
                          </div>
                          <div className="space-y-2">
                            <Label>
                              변경전통신사 <span className="text-destructive">*</span>
                            </Label>
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
                      </>
                    )}

                    <Separator />

                    {/* 요금제 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금제</p>
                      <div className="space-y-2">
                        <Label htmlFor="plan">
                          요금제 선택 <span className="text-destructive">*</span>
                        </Label>
                        <Select value={formData.plan} onValueChange={(value) => setFormData((prev) => ({ ...prev, plan: value }))}>
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
                        <div className="rounded-md border bg-white p-3 text-sm space-y-1">
                          <p>
                            월정액: <span className="font-medium">{formatWon(selectedPlan.monthlyFee)}원</span>
                          </p>
                          <p>
                            할인액: <span className="font-medium">-{formatWon(selectedPlan.discount)}원</span>
                          </p>
                          <p>
                            월납부액: <span className="font-medium">{formatWon(selectedPlan.monthlyPayment)}원</span>
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
