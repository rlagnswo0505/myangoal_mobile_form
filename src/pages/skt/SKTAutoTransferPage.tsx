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
import sktAutoTransferImage from '@/assets/templates/제로노트_1.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [sktAutoTransferImage];

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const FIELD_POSITIONS: FieldPosition[] = [
  // 신청정보 - 이동전화번호/WiBro ID, 이름(법인명)
  { id: 'phoneNumber', page: 1, top: 109, left: 192, width: 239, height: 30, fontSize: 16 },
  { id: 'customerName', page: 1, top: 109, left: 498, width: 237, height: 28, fontSize: 16 },
  // 본인확인 인증방법 - 외국인등록번호/여권번호
  { id: 'registrationNumber', page: 1, top: 137, left: 660, width: 113, height: 29, fontSize: 12 },
  // 자동이체 신청 - 은행(카드사) / 계좌(카드)번호 / 카드유효기간
  { id: 'bankOrCard', page: 1, top: 512, left: 260, width: 94, height: 22, fontSize: 12 },
  { id: 'accountOrCardNumber', page: 1, top: 514, left: 424, width: 206, height: 22, fontSize: 12 },
  { id: 'cardExpiry', page: 1, top: 514, left: 674, width: 55, height: 22, fontSize: 12 },
  // 자동이체 신청 - 예금주명 / 법정생년월일 / 이동전화번호 (예금주/카드주/결제자)
  { id: 'depositorName', page: 1, top: 536, left: 260, width: 69, height: 20, fontSize: 12 },
  { id: 'depositorBirthDate', page: 1, top: 535, left: 481, width: 54, height: 21, fontSize: 12 },
  { id: 'depositorPhoneNumber', page: 1, top: 535, left: 648, width: 85, height: 19, fontSize: 12 },
  // 자동이체 동의 - 신청고객 서명란 (이름)
  { id: 'customerName2', page: 1, top: 553, left: 553, width: 118, height: 25, fontSize: 16 },
  // 하단 작성일 / 신청고객(대리인) 서명란 (이름)
  { id: 'applicationDate', page: 1, top: 980, left: 233, width: 154, height: 36, fontSize: 14 },
  { id: 'customerName3', page: 1, top: 953, left: 512, width: 160, height: 35, fontSize: 16 },
];

interface FormData {
  phoneNumber: string;
  customerName: string;
  registrationNumber: string;
  depositorName: string;
  depositorBirthDate: string;
  depositorPhoneNumber: string;
  paymentMethod: '계좌' | '카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  applicationDate: string;
}

export default function SKTAutoTransferPage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    customerName: '',
    registrationNumber: '',
    depositorName: '',
    depositorBirthDate: '',
    depositorPhoneNumber: '',
    paymentMethod: '계좌',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
    applicationDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이름 입력 시 예금주명도 함께 입력 (이후 개별 수정 가능)
  const handleCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, customerName: value, depositorName: value }));
  };

  const handlePhoneNumberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phoneNumber: value, depositorPhoneNumber: value }));
  };

  // 외국인등록번호 입력 시 앞 6자리를 생년월일 기본값으로 함께 입력 (이후 개별 수정 가능)
  const handleRegistrationNumberChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const birthDigits = value.replace(/\D/g, '').slice(0, 6);
    setFormData((prev) => ({ ...prev, registrationNumber: value, depositorBirthDate: birthDigits }));
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
      phoneNumber: '',
      customerName: '',
      registrationNumber: '',
      depositorName: '',
      depositorBirthDate: '',
      depositorPhoneNumber: '',
      paymentMethod: '계좌',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      applicationDate: todayFormatted,
    });
  };

  // 카드 유효기간 포맷팅 (2512 -> 25  12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = ' ';
      return `${yy}${nbsp.repeat(4)}${mm}`;
    }
    return expiry;
  };

  // 작성일 포맷팅 (2026.07.15 -> 2026    07    15, "년 월 일" 서식 위치에 맞춰 . 제거 후 공백으로 정렬)
  const formatApplicationDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(12)}${parts[1]}${nbsp.repeat(14)}${parts[2]}`;
    }
    return date;
  };

  const fieldPositions: FieldPosition[] = FIELD_POSITIONS;

  const fieldValues: FieldValue = {
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    customerName: formData.customerName,
    customerName2: formData.customerName,
    customerName3: formData.customerName,
    registrationNumber: formData.registrationNumber,
    depositorName: formData.depositorName,
    depositorBirthDate: formData.depositorBirthDate,
    depositorPhoneNumber: formatPhoneWithDash(formData.depositorPhoneNumber),
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    applicationDate: formatApplicationDate(formData.applicationDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="SKT 자동이체" subtitle="T 자동이체 변경 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">자동이체 변경 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 신청정보 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          이동전화번호 / WiBro ID <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={handlePhoneNumberChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          이름(법인명) <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleCustomerNameChange} placeholder="홍길동" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">외국인등록번호 / 여권번호</Label>
                        <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleRegistrationNumberChange} placeholder="외국인등록번호 입력" />
                      </div>
                    </div>

                    <Separator />

                    {/* 자동이체 신청 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">자동이체 신청</p>
                      <div className="space-y-3">
                        <Label>
                          납부방법 <span className="text-destructive">*</span>
                        </Label>
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
                      </div>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="depositorName">
                            예금주명(카드주명/결제자명) <span className="text-destructive">*</span>
                          </Label>
                          <Input id="depositorName" name="depositorName" value={formData.depositorName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="depositorBirthDate">
                            생년월일 (외국인등록번호 앞 6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="depositorBirthDate" format="6" value={formData.depositorBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, depositorBirthDate: value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="depositorPhoneNumber">이동전화번호(예금주/카드주/결제자)</Label>
                        <PhoneInput id="depositorPhoneNumber" value={formData.depositorPhoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, depositorPhoneNumber: value }))} />
                      </div>
                    </div>

                    <Separator />

                    {/* 작성일 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="applicationDate">
                          작성일 <span className="text-destructive">*</span>
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
                  <ImageViewer images={PAGE_IMAGES} fieldPositions={fieldPositions} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
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
      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={fieldPositions} fieldValues={fieldValues} />
    </>
  );
}
