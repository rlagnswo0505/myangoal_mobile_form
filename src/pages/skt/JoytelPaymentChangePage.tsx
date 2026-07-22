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
import PhoneInput, { formatPhoneWithDash, formatPhoneForDisplay } from '@/components/Form/PhoneInput';
import joytelPaymentChangeImage from '@/assets/templates/조이텔 변경신청서_1.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [joytelPaymentChangeImage];

// 통신망 선택 위치 (SKT / LG U+)
const NETWORK_POSITIONS = {
  SKT: { top: 102, left: 652 },
  'LGU+': { top: 102, left: 688 },
};

// 서비스유형 선택 위치 (선불 / 후불)
const SERVICE_TYPE_POSITIONS = {
  선불: { top: 114, left: 652 },
  후불: { top: 114, left: 688 },
};

// 필드 위치 설정 (이미지 추가 후 좌표 조정 필요 - debugMode로 확인)
const FIELD_POSITIONS: FieldPosition[] = [
  // 이동전화번호 (010 제외 8자리, 넓은 간격으로 표시)
  { id: 'mobileNumberDisplay', page: 1, top: 145, left: 635, width: 130, height: 29, fontSize: 12 },
  // 고객정보
  { id: 'customerName', page: 1, top: 221, left: 155, width: 233, height: 30, fontSize: 12 },
  { id: 'birthDate1', page: 1, top: 221, left: 497, width: 273, height: 30, fontSize: 12 },
  { id: 'registrationNumber', page: 1, top: 252, left: 156, width: 233, height: 34, fontSize: 12 },
  { id: 'contactNumber', page: 1, top: 252, left: 499, width: 269, height: 33, fontSize: 12 },
  // 선불/후불 - 자동이체변경
  { id: 'depositorName', page: 1, top: 591, left: 164, width: 226, height: 28, fontSize: 12 },
  { id: 'bankOrCard', page: 1, top: 589, left: 511, width: 122, height: 30, fontSize: 12 },
  { id: 'cardExpiry', page: 1, top: 594, left: 690, width: 50, height: 22, fontSize: 12 },
  { id: 'depositorBirthDate', page: 1, top: 617, left: 162, width: 225, height: 29, fontSize: 12 },
  { id: 'accountOrCardNumber', page: 1, top: 620, left: 512, width: 243, height: 27, fontSize: 12 },
  // 신청일자
  { id: 'applicationDate', page: 1, top: 977, left: 520, width: 148, height: 31, fontSize: 12 },
];

interface FormData {
  networkType: 'SKT' | 'LGU+';
  serviceType: '선불' | '후불';
  phoneNumber: string;
  customerName: string;
  birthDate: string;
  registrationNumber: string;
  depositorName: string;
  depositorBirthDate: string;
  paymentMethod: '자동이체' | '신용카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  applicationDate: string;
}

export default function JoytelPaymentChangePage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    networkType: 'SKT',
    serviceType: '후불',
    phoneNumber: '',
    customerName: '',
    birthDate: '',
    registrationNumber: '',
    depositorName: '',
    depositorBirthDate: '',
    paymentMethod: '자동이체',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
    applicationDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 이름 입력 시 예금주도 함께 입력 (이후 개별 수정 가능)
  const handleCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, customerName: value, depositorName: value }));
  };

  // 생년월일 입력 시 예금주 생년월일도 함께 입력 (이후 개별 수정 가능)
  const handleBirthDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, birthDate: value, depositorBirthDate: value }));
  };

  const handlePaymentMethodChange = (value: '자동이체' | '신용카드') => {
    setFormData((prev) => ({
      ...prev,
      paymentMethod: value,
      cardExpiry: value === '자동이체' ? '' : prev.cardExpiry,
    }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      networkType: 'SKT',
      serviceType: '후불',
      phoneNumber: '',
      customerName: '',
      birthDate: '',
      registrationNumber: '',
      depositorName: '',
      depositorBirthDate: '',
      paymentMethod: '자동이체',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      applicationDate: todayFormatted,
    });
  };

  // 신청날짜 포맷팅 (2025.12.02 -> 2025    12    02)
  const formatApplicationDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(14)}${parts[1]}${nbsp.repeat(12)}${parts[2]}`;
    }
    return date;
  };

  // 카드 유효기간 포맷팅 (2512 -> 25    12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = ' ';
      return `${yy}${nbsp.repeat(4)}${mm}`;
    }
    return expiry;
  };

  // 통신망/서비스유형 체크 위치
  const networkPos = NETWORK_POSITIONS[formData.networkType];
  const serviceTypePos = SERVICE_TYPE_POSITIONS[formData.serviceType];

  const fieldPositions: FieldPosition[] = [...FIELD_POSITIONS, { id: 'networkCheck', page: 1, top: networkPos.top, left: networkPos.left, fontSize: 12 }, { id: 'serviceTypeCheck', page: 1, top: serviceTypePos.top, left: serviceTypePos.left, fontSize: 12 }];

  // 필드 값 매핑
  const fieldValues: FieldValue = {
    networkCheck: '✓',
    serviceTypeCheck: '✓',
    mobileNumberDisplay: formatPhoneForDisplay(formData.phoneNumber),
    customerName: formData.customerName,
    birthDate1: formData.birthDate,
    registrationNumber: formData.registrationNumber,
    contactNumber: formatPhoneWithDash(formData.phoneNumber),
    depositorName: formData.depositorName,
    depositorBirthDate: formData.depositorBirthDate,
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '신용카드' ? formatCardExpiry(formData.cardExpiry) : '',
    applicationDate: formatApplicationDate(formData.applicationDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="조이텔 납부변경" subtitle="JOYTEL 서비스 변경 신청서 (납부변경)" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 통신망 / 서비스유형 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>
                          통신망 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.networkType} onValueChange={(value) => setFormData((prev) => ({ ...prev, networkType: value as 'SKT' | 'LGU+' }))} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SKT" id="network-skt" />
                            <Label htmlFor="network-skt" className="font-normal cursor-pointer">
                              SKT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LGU+" id="network-lgu" />
                            <Label htmlFor="network-lgu" className="font-normal cursor-pointer">
                              LG U+
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                      <div className="space-y-2">
                        <Label>
                          서비스유형 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.serviceType} onValueChange={(value) => setFormData((prev) => ({ ...prev, serviceType: value as '선불' | '후불' }))} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="선불" id="service-prepaid" />
                            <Label htmlFor="service-prepaid" className="font-normal cursor-pointer">
                              선불
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="후불" id="service-postpaid" />
                            <Label htmlFor="service-postpaid" className="font-normal cursor-pointer">
                              후불
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>

                    <Separator />

                    {/* 고객 기본정보 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          이름(법인명) <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleCustomerNameChange} placeholder="홍길동" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">
                          법정생년월일 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={handleBirthDateChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="registrationNumber">
                          여권/외국인등록번호 (법인/사업자등록번호) <span className="text-destructive">*</span>
                        </Label>
                        <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="등록번호 입력" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          이동전화번호 / 연락받을 번호 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                      </div>
                    </div>

                    <Separator />

                    {/* 자동이체변경 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">자동이체변경</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="depositorName">
                            예금주 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="depositorName" name="depositorName" value={formData.depositorName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="depositorBirthDate">
                            법정생년월일 <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="depositorBirthDate" format="6" value={formData.depositorBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, depositorBirthDate: value }))} />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>
                          납부방법 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handlePaymentMethodChange(value as '자동이체' | '신용카드')} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="자동이체" id="payment-transfer" />
                            <Label htmlFor="payment-transfer" className="font-normal cursor-pointer">
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
