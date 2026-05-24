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
import helloPaymentChangeImage from '@/assets/templates/LG헬로 납부변경_1.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [helloPaymentChangeImage];

// 필드 위치 설정
const FIELD_POSITIONS: FieldPosition[] = [
  // 고객명 (2곳에 표시)
  { id: 'customerName1', page: 1, top: 188, left: 202, width: 199, height: 27, fontSize: 14 },
  { id: 'customerName2', page: 1, top: 372, left: 200, width: 114, height: 25, fontSize: 14 },
  // 생년월일 (2곳에 표시)
  { id: 'birthDate1', page: 1, top: 188, left: 528, width: 189, height: 28, fontSize: 14 },
  { id: 'birthDate2', page: 1, top: 373, left: 527, width: 202, height: 21, fontSize: 14 },
  // 휴대폰 번호 (2곳에 표시)
  { id: 'phoneNumber1', page: 1, top: 214, left: 202, width: 196, height: 23, fontSize: 14 },
  { id: 'phoneNumber2', page: 1, top: 216, left: 529, width: 191, height: 22, fontSize: 14 },
  // 납부방법 체크 표시 (자동이체/신용카드 위아래 배치)
  { id: 'checkAutoPayment', page: 1, top: 328, left: 207, width: 12, height: 12, fontSize: 14 },
  {
    id: 'checkCreditCard',
    page: 1,
    top: 328,
    left: 298,
    width: 13,
    height: 12,
    fontSize: 14,
  },
  // 은행/카드사
  { id: 'bankOrCard', page: 1, top: 345, left: 202, width: 87, height: 27, fontSize: 14 },
  // 계좌번호/카드번호
  { id: 'accountOrCardNumber', page: 1, top: 346, left: 302, width: 267, height: 27, fontSize: 14 },
  // 유효기간 (카드)
  { id: 'cardExpiry', page: 1, top: 347, left: 654, width: 64, height: 22, fontSize: 14 },
  // 신청날짜
  { id: 'applicationDate', page: 1, top: 855, left: 186, width: 172, height: 24, fontSize: 14 },
];

interface FormData {
  customerName: string;
  birthDate: string;
  phoneNumber: string;
  paymentMethod: '자동이체' | '신용카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  applicationDate: string;
}

export default function LGHelloPaymentChangePage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    birthDate: '',
    phoneNumber: '',
    paymentMethod: '자동이체',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
    applicationDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'customerName' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePaymentMethodChange = (value: '자동이체' | '신용카드') => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
      // 납부방법 변경 시 관련 필드 초기화
      cardExpiry: value === '자동이체' ? '' : prev.cardExpiry,
    }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      birthDate: '',
      phoneNumber: '',
      paymentMethod: '자동이체',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      applicationDate: todayFormatted,
    });
  };

  // 신청날짜 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatApplicationDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(14)}${parts[1]}${nbsp.repeat(14)}${parts[2]}`;
    }
    return date;
  };

  // 카드 유효기간 포맷팅 (2512 -> 25        12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = '\u00A0';
      return `${yy}${nbsp.repeat(6)}${mm}`;
    }
    return expiry;
  };

  // 필드 값 매핑 (고객명, 생년월일, 휴대폰번호는 각각 2곳에 표시)
  const fieldValues: FieldValue = {
    customerName1: formData.customerName,
    customerName2: formData.customerName,
    birthDate1: formData.birthDate,
    birthDate2: formData.birthDate,
    phoneNumber1: formatPhoneWithDash(formData.phoneNumber),
    phoneNumber2: formatPhoneWithDash(formData.phoneNumber),
    checkAutoPayment: formData.paymentMethod === '자동이체' ? '✓' : '',
    checkCreditCard: formData.paymentMethod === '신용카드' ? '✓' : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '신용카드' ? formatCardExpiry(formData.cardExpiry) : '',
    applicationDate: formatApplicationDate(formData.applicationDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="헬로 납부변경" subtitle="LG Hello Vision 서비스 변경" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">납부변경 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 고객 기본정보 */}
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
                            생년월일 <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            휴대폰 번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 납부방법 선택 */}
                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>
                          납부방법 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handlePaymentMethodChange(value as '자동이체' | '신용카드')} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="자동이체" id="payment-auto" />
                            <Label htmlFor="payment-auto" className="font-normal cursor-pointer">
                              자동이체
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="신용카드" id="payment-card" />
                            <Label htmlFor="payment-card" className="font-normal cursor-pointer">
                              신용카드
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <Separator />

                    {/* 결제 정보 */}
                    <div className="space-y-4">
                      <div className={`grid gap-4 ${formData.paymentMethod === '신용카드' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                        <div className="space-y-2">
                          <Label htmlFor="bankOrCard">
                            {formData.paymentMethod === '자동이체' ? '은행명' : '카드사'} <span className="text-destructive">*</span>
                          </Label>
                          <Input id="bankOrCard" name="bankOrCard" value={formData.bankOrCard} onChange={handleChange} placeholder={formData.paymentMethod === '자동이체' ? '국민은행' : '삼성카드'} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountOrCardNumber">
                            {formData.paymentMethod === '자동이체' ? '계좌번호' : '카드번호'} <span className="text-destructive">*</span>
                          </Label>
                          <Input id="accountOrCardNumber" name="accountOrCardNumber" value={formData.accountOrCardNumber} onChange={handleChange} placeholder={formData.paymentMethod === '자동이체' ? '123-456-789012' : '1234-5678-9012-3456'} />
                        </div>
                        {/* 카드인 경우에만 유효기간 표시 */}
                        {formData.paymentMethod === '신용카드' && (
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
                        <Label htmlFor="applicationDate">
                          신청날짜 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="applicationDate" value={formData.applicationDate} onChange={(value) => setFormData((prev) => ({ ...prev, applicationDate: value }))} />
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
                {PAGE_IMAGES.length > 0 ? (
                  <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>템플릿 이미지를 추가해주세요</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 인쇄 모달 */}
      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} />
    </>
  );
}
