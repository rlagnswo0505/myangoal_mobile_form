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
import skTransferPage1 from '@/assets/templates/sk 명의변경_1.jpg';
import skTransferPage2 from '@/assets/templates/sk 명의변경_2.jpg';
import skTransferPage3 from '@/assets/templates/sk 명의변경_3.jpg';
import skTransferPage4 from '@/assets/templates/sk 명의변경_4.jpg';
import skTransferPage5 from '@/assets/templates/sk 명의변경_5.jpg';
import skTransferPage6 from '@/assets/templates/sk 명의변경_6.jpg';
import skTransferPage7 from '@/assets/templates/sk 명의변경_7.jpg';
import skTransferPage8 from '@/assets/templates/sk 명의변경_8.jpg';

// 템플릿 이미지 (1페이지: 이동전화 명의변경계약서 본문, 2페이지: 단말/분할상환 승계, 3~8페이지: 약관 및 동의서)
const PAGE_IMAGES: string[] = [skTransferPage1, skTransferPage2, skTransferPage3, skTransferPage4, skTransferPage5, skTransferPage6, skTransferPage7, skTransferPage8];

// 주소 기본값
const BASE_ADDRESS = '인천광역시 부평구 광장로 16 부평민자역사 1층 10~12호';

// 판매점 정보 (고정)
const DEALER_INFO = { storeName: '미얀골', sellerName: '김재윤', sellerPhone: '010-4427-7675' };

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 명의를 주는 분 (기존 명의자)
  { id: 'phoneNumber', page: 1, top: 134, left: 228, width: 212, height: 24, fontSize: 12 },
  { id: 'prevName', page: 1, top: 133, left: 498, width: 208, height: 24, fontSize: 12 },
  { id: 'prevBirthDate', page: 1, top: 157, left: 273, width: 169, height: 26, fontSize: 12 },
  // 명의를 받는 분 (신규 명의자)
  { id: 'newName', page: 1, top: 182, left: 196, width: 169, height: 27, fontSize: 12 },
  { id: 'newBirthDate', page: 1, top: 183, left: 515, width: 126, height: 25, fontSize: 12 },
  { id: 'newAddress', page: 1, top: 208, left: 166, width: 375, height: 23, fontSize: 11 },
  { id: 'newContactPhone', page: 1, top: 208, left: 577, width: 129, height: 25, fontSize: 12 },
  // 요금납부방법 (은행/카드, 계좌/카드번호, 유효기간, 예금주명, 예금주 생년월일)
  { id: 'bankOrCard', page: 1, top: 231, left: 283, width: 80, height: 26, fontSize: 12 },
  { id: 'accountOrCardNumber', page: 1, top: 231, left: 415, width: 182, height: 25, fontSize: 12 },
  { id: 'cardExpiry', page: 1, top: 233, left: 641, width: 50, height: 24, fontSize: 12 },
  { id: 'accountHolderName', page: 1, top: 256, left: 275, width: 92, height: 24, fontSize: 12 },
  { id: 'accountHolderBirthDate', page: 1, top: 256, left: 497, width: 189, height: 25, fontSize: 12 },
  // 계약일자, 판매점 접수 정보
  { id: 'signDate', page: 1, top: 847, left: 568, width: 154, height: 23, fontSize: 14 },
  { id: 'dealerName', page: 1, top: 875, left: 146, width: 151, height: 19, fontSize: 12 },
  { id: 'sellerName', page: 1, top: 875, left: 328, width: 70, height: 18, fontSize: 12 },
  { id: 'sellerPhone', page: 1, top: 891, left: 146, width: 199, height: 23, fontSize: 12 },
  // 2페이지 - 명의를 받는 고객 정보 (동일 정보 반복 표기)
  { id: 'newName2', page: 2, top: 94, left: 205, width: 143, height: 24, fontSize: 12 },
  { id: 'newBirthDate2', page: 2, top: 94, left: 499, width: 208, height: 22, fontSize: 12 },
  { id: 'newAddress2', page: 2, top: 115, left: 142, width: 563, height: 25, fontSize: 11 },
];

interface FormData {
  phoneNumber: string;
  prevName: string;
  prevBirthDate: string;
  newName: string;
  newBirthDate: string;
  newAddress: string;
  newContactPhone: string;
  paymentMethod: '계좌' | '카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  accountHolderBirthDate: string;
  signDate: string;
}

export default function SKTransferPage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  // 명의를 받는 분 정보가 주는 분과 동일한 경우가 대부분이라 기본값을 동일로 설정
  const [sameAsPrev, setSameAsPrev] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    phoneNumber: '',
    prevName: '',
    prevBirthDate: '',
    newName: '',
    newBirthDate: '',
    newAddress: BASE_ADDRESS,
    newContactPhone: '',
    paymentMethod: '계좌',
    bankOrCard: '',
    accountOrCardNumber: '',
    cardExpiry: '',
    accountHolderBirthDate: '',
    signDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'prevName' || name === 'newName' ? value.toUpperCase() : value;
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
      phoneNumber: '',
      prevName: '',
      prevBirthDate: '',
      newName: '',
      newBirthDate: '',
      newAddress: BASE_ADDRESS,
      newContactPhone: '',
      paymentMethod: '계좌',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      accountHolderBirthDate: '',
      signDate: todayFormatted,
    });
    setSameAsPrev(true);
  };

  // 카드 유효기간 포맷팅 (2512 -> 25   12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = ' ';
      return `${yy}${nbsp.repeat(6)}${mm}`;
    }
    return expiry;
  };

  // 계약일자 포맷팅 (2026.07.15 -> 2026    07    15)
  const formatSignDate = (date: string, spacing = 6) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(spacing)}${parts[1]}${nbsp.repeat(spacing)}${parts[2]}`;
    }
    return date;
  };

  // 명의를 받는 분 정보가 주는 분과 동일하면 주는 분 정보를 그대로 사용
  const effectiveNewName = sameAsPrev ? formData.prevName : formData.newName;
  const effectiveNewBirthDate = sameAsPrev ? formData.prevBirthDate : formData.newBirthDate;

  // 예금주명/생년월일 미입력 시 신규 명의자 정보를 기본값으로 사용
  const accountHolderBirthDateValue = formData.accountHolderBirthDate || effectiveNewBirthDate;

  const fieldPositions: FieldPosition[] = [...BASE_FIELD_POSITIONS];

  const fieldValues: FieldValue = {
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    prevName: formData.prevName,
    prevBirthDate: formData.prevBirthDate,
    newName: effectiveNewName,
    newName2: effectiveNewName,
    newBirthDate: effectiveNewBirthDate,
    newBirthDate2: effectiveNewBirthDate,
    newAddress: formData.newAddress,
    newAddress2: formData.newAddress,
    newContactPhone: formatPhoneWithDash(formData.newContactPhone),
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    accountHolderName: effectiveNewName,
    accountHolderBirthDate: accountHolderBirthDateValue,
    dealerName: DEALER_INFO.storeName,
    sellerName: DEALER_INFO.sellerName,
    sellerPhone: DEALER_INFO.sellerPhone,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="SK 명의변경서" subtitle="SK텔레콤 이동전화 명의변경계약서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 명의를 주는 분 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">명의를 주는 분 (기존 명의자)</p>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          명의변경할 전화번호 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prevName">
                            이름 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="prevName" name="prevName" value={formData.prevName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prevBirthDate">
                            법정생년월일 (6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="prevBirthDate" format="6" value={formData.prevBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, prevBirthDate: value }))} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 명의를 받는 분 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">명의를 받는 분 (신규 명의자)</p>
                      <RadioGroup value={sameAsPrev ? 'same' : 'diff'} onValueChange={(value) => setSameAsPrev(value === 'same')} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="same" id="same-as-prev" />
                          <Label htmlFor="same-as-prev" className="font-normal cursor-pointer">
                            주는 분과 동일
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="diff" id="diff-from-prev" />
                          <Label htmlFor="diff-from-prev" className="font-normal cursor-pointer">
                            다름
                          </Label>
                        </div>
                      </RadioGroup>
                      {sameAsPrev ? (
                        <div className="rounded-md border bg-white p-3 text-sm space-y-1">
                          <p>
                            이름: <span className="font-medium">{formData.prevName || '-'}</span>
                          </p>
                          <p>
                            법정생년월일: <span className="font-medium">{formData.prevBirthDate || '-'}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newName">
                              이름 <span className="text-destructive">*</span>
                            </Label>
                            <Input id="newName" name="newName" value={formData.newName} onChange={handleChange} placeholder="홍길동" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newBirthDate">
                              법정생년월일 (6자리) <span className="text-destructive">*</span>
                            </Label>
                            <DateInput id="newBirthDate" format="6" value={formData.newBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, newBirthDate: value }))} />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="newAddress">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <AddressInput id="newAddress" value={formData.newAddress} onChange={(value) => setFormData((prev) => ({ ...prev, newAddress: value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newContactPhone">
                          연락처 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="newContactPhone" value={formData.newContactPhone} onChange={(value) => setFormData((prev) => ({ ...prev, newContactPhone: value }))} />
                      </div>
                    </div>

                    <Separator />

                    {/* 요금납부방법 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금납부방법</p>
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
                        <p className="text-xs text-muted-foreground">미입력 시 신규 명의자 생년월일과 동일하게 표시됩니다</p>
                      </div>
                    </div>

                    <Separator />

                    {/* 계약날짜 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signDate">
                          계약일자 <span className="text-destructive">*</span>
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
