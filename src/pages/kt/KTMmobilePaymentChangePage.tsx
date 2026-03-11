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
import mmobileImage from '@/assets/templates/kt_M모바일_서비스변경신청서.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [mmobileImage];

// 필드 위치 설정 (이미지 추가 후 좌표 조정 필요 - debugMode로 확인)
const FIELD_POSITIONS: FieldPosition[] = [
  // 고객명 (2곳에 표시) - 고객정보 섹션 + 하단
  { id: 'customerName1', page: 1, top: 436, left: 214, width: 190, height: 30, fontSize: 14 },
  { id: 'customerName2', page: 1, top: 660, left: 195, width: 289, height: 30, fontSize: 14 },
  // 생년월일 (2곳에 표시)
  {
    id: 'birthDate1',
    page: 1,
    top: 436,
    left: 559,
    width: 114,
    height: 30,
    fontSize: 14,
  },
  { id: 'birthDate2', page: 1, top: 662, left: 649, width: 83, height: 24, fontSize: 14 },
  // 성별 체크 (남/여)
  { id: 'checkMale', page: 1, top: 440, left: 700, width: 20, height: 20, fontSize: 14 },
  { id: 'checkFemale', page: 1, top: 440, left: 720, width: 20, height: 20, fontSize: 14 },
  // 등록번호
  { id: 'registrationNumber', page: 1, top: 465, left: 215, width: 188, height: 31, fontSize: 14 },
  // 연락처 (전화번호 2곳 중 1)
  { id: 'phoneNumber1', page: 1, top: 468, left: 561, width: 182, height: 27, fontSize: 14 },
  // 신청대상 전화번호 (전화번호 2곳 중 2)
  { id: 'phoneNumber2', page: 1, top: 498, left: 217, width: 186, height: 31, fontSize: 14 },
  // 자동납부 체크 (자동이체/신용카드)
  { id: 'checkAutoTransfer', page: 1, top: 544, left: 296, width: 20, height: 16, fontSize: 14 },
  { id: 'checkCreditCard', page: 1, top: 544, left: 428, width: 20, height: 16, fontSize: 14 },
  // 은행/카드사
  { id: 'bankOrCard', page: 1, top: 571, left: 254, width: 94, height: 23, fontSize: 14 },
  // 계좌/카드 번호
  { id: 'accountOrCardNumber', page: 1, top: 571, left: 403, width: 213, height: 26, fontSize: 14 },
  // 카드 유효기간
  { id: 'cardExpiry', page: 1, top: 575, left: 673, width: 51, height: 19, fontSize: 14 },
  // 신청일자
  {
    id: 'applicationDate',
    page: 1,
    top: 1035,
    left: 120,
    width: 205,
    height: 26,
    fontSize: 14,
  },
];

interface FormData {
  customerName: string;
  birthDate: string;
  gender: '남' | '여';
  registrationNumber: string;
  phoneNumber: string;
  paymentMethod: '자동이체' | '신용카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  applicationDate: string;
}

export default function KTMmobilePaymentChangePage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    birthDate: '',
    gender: '남',
    registrationNumber: '',
    phoneNumber: '',
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
      customerName: '',
      birthDate: '',
      gender: '남',
      registrationNumber: '',
      phoneNumber: '',
      paymentMethod: '자동이체',
      bankOrCard: '삼성카드',
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
      return `${parts[0]}${nbsp.repeat(16)}${parts[1]}${nbsp.repeat(18)}${parts[2]}`;
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

  // 필드 값 매핑
  const fieldValues: FieldValue = {
    customerName1: formData.customerName,
    customerName2: formData.customerName,
    birthDate1: formData.birthDate,
    birthDate2: formData.birthDate,
    checkMale: formData.gender === '남' ? '✓' : '',
    checkFemale: formData.gender === '여' ? '✓' : '',
    registrationNumber: formData.registrationNumber,
    phoneNumber1: formatPhoneWithDash(formData.phoneNumber),
    phoneNumber2: formatPhoneWithDash(formData.phoneNumber),
    checkAutoTransfer: formData.paymentMethod === '자동이체' ? '✓' : '',
    checkCreditCard: formData.paymentMethod === '신용카드' ? '✓' : '',
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '신용카드' ? formatCardExpiry(formData.cardExpiry) : '',
    applicationDate: formatApplicationDate(formData.applicationDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="M모바일 납부변경" subtitle="KT M mobile 서비스변경 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                          <Label>
                            성별 <span className="text-destructive">*</span>
                          </Label>
                          <RadioGroup value={formData.gender} onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as '남' | '여' }))} className="flex gap-6 h-10 items-center">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="남" id="gender-male" />
                              <Label htmlFor="gender-male" className="font-normal cursor-pointer">
                                남
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="여" id="gender-female" />
                              <Label htmlFor="gender-female" className="font-normal cursor-pointer">
                                여
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="registrationNumber">
                            등록번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="registrationNumber" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} placeholder="등록번호 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            전화번호 <span className="text-destructive">*</span>
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
                          자동납부 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.paymentMethod} onValueChange={(value) => handlePaymentMethodChange(value as '자동이체' | '신용카드')} className="flex gap-6">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="자동이체" id="payment-transfer" />
                            <Label htmlFor="payment-transfer" className="font-normal cursor-pointer">
                              자동이체
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="신용카드" id="payment-credit" />
                            <Label htmlFor="payment-credit" className="font-normal cursor-pointer">
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
                          신청일자 <span className="text-destructive">*</span>
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
