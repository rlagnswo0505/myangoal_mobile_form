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

// 전통신사 옵션 (신규계약 전 사용하던 통신사)
const CARRIER_OPTIONS = [
  { value: 'kt', label: 'KT' },
  { value: 'lg', label: 'LG U+' },
  { value: 'mvno', label: '알뜰폰' },
];

// 전통신사별 체크 위치 (○ KT ○ LG U+ ○ MVNO - 임시 좌표, debugMode로 조정 필요)
const CARRIER_CHECK_POSITIONS: Record<string, { top: number; left: number }> = {
  kt: { top: 833, left: 499 },
  lg: { top: 833, left: 549 },
  mvno: { top: 833, left: 599 },
};

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  { id: 'customerName', page: 1, top: 403, left: 167, width: 192, height: 24, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 532, left: 541, width: 180, height: 27, fontSize: 14 },
  { id: 'foreignerNumber', page: 1, top: 401, left: 523, width: 152, height: 27, fontSize: 14 },
  { id: 'phoneNumber', page: 1, top: 428, left: 583, width: 165, height: 25, fontSize: 14 },
  { id: 'address', page: 1, top: 428, left: 168, width: 369, height: 25, fontSize: 12 },
  { id: 'usimNumber', page: 1, top: 645, left: 166, width: 184, height: 25, fontSize: 14 },
  { id: 'mvnoDetail', page: 1, top: 828, left: 651, width: 93, height: 25, fontSize: 12 },
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
  { id: 'signDate', page: 1, top: 962, left: 562, width: 174, height: 30, fontSize: 16 },
];

interface FormData {
  customerName: string;
  birthDate: string;
  foreignerNumber: string;
  phoneNumber: string;
  address: string;
  usimNumber: string;
  plan: string;
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
    customerName: '',
    birthDate: '',
    foreignerNumber: '',
    phoneNumber: '',
    address: '',
    usimNumber: '',
    plan: '',
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
      customerName: '',
      birthDate: '',
      foreignerNumber: '',
      phoneNumber: '',
      address: '',
      usimNumber: '',
      plan: '',
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
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(8)}${parts[1]}${nbsp.repeat(8)}${parts[2]}`;
    }
    return date;
  };

  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === formData.plan);
  const carrierCheckLabel = CARRIER_OPTIONS.find((c) => c.value === formData.prevCarrier)?.label;

  // 선택된 전통신사에 따라 체크 위치를 동적으로 생성
  const carrierCheckPos = formData.prevCarrier ? CARRIER_CHECK_POSITIONS[formData.prevCarrier] : null;

  const fieldPositions: FieldPosition[] = [...BASE_FIELD_POSITIONS, ...(carrierCheckPos ? [{ id: 'carrierCheck', page: 1, top: carrierCheckPos.top, left: carrierCheckPos.left, fontSize: 14 }] : [])];

  const fieldValues: FieldValue = {
    customerName: formData.customerName,
    birthDate: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    address: formData.address,
    usimNumber: formData.usimNumber,
    planName: selectedPlan?.label || '',
    monthlyFee: selectedPlan ? formatWon(selectedPlan.monthlyFee) : '',
    discount1: selectedPlan ? `-${formatWon(selectedPlan.discount)}` : '',
    discount2: selectedPlan ? `-${formatWon(selectedPlan.discount)}` : '',
    monthlyPayment1: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
    monthlyPayment2: selectedPlan ? formatWon(selectedPlan.monthlyPayment) : '',
    carrierCheck: carrierCheckLabel ? '✓' : '',
    mvnoDetail: formData.prevCarrier === 'mvno' ? formData.mvnoDetail : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    accountHolderName: formData.customerName,
    accountHolderPhone: formatPhoneWithDash(formData.phoneNumber),
    signDate: formatSignDate(formData.signDate),
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

                    <Separator />

                    {/* 전통신사 */}
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
