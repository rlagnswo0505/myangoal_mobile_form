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
import infoChangePage1 from '@/assets/templates/엘지 고객정보 변경신청서 신형_1.jpg';
import infoChangePage2 from '@/assets/templates/엘지 고객정보 변경신청서 신형_2.jpg';
import infoChangePage3 from '@/assets/templates/엘지 고객정보 변경신청서 신형_3.jpg';
import infoChangePage4 from '@/assets/templates/엘지 고객정보 변경신청서 신형_4.jpg';
import infoChangePage5 from '@/assets/templates/엘지 고객정보 변경신청서 신형_5.jpg';

// 템플릿 이미지 (1페이지: 고객정보 변경신청서 본문, 2~5페이지: 개인정보 및 개인위치정보 활용동의서)
const PAGE_IMAGES: string[] = [infoChangePage1, infoChangePage2, infoChangePage3, infoChangePage4, infoChangePage5];

// 판매업체 옵션 (판매점 상호 / 판매자 / 판매자전화)
const VENDOR_OPTIONS = [
  { value: 'entoel', label: '엔투엘 LG', storeName: '엔투엘', sellerName: '이경건', sellerPhone: '1544-4069' },
  { value: 'esm', label: 'ESM', storeName: '엔투엘', sellerName: '', sellerPhone: '' },
  { value: 'green', label: '그린', storeName: '그린', sellerName: '', sellerPhone: '' },
];

// 주소 기본값
const BASE_ADDRESS = '인천광역시 부평구 광장로 16 부평민자역사 1층 10~12호';

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 가입자정보(기존명의자정보) - 명의변경할 전화번호 및 기존 명의자
  { id: 'prevName', page: 1, top: 128, left: 163, width: 167, height: 29, fontSize: 12 },
  { id: 'prevBirthDate', page: 1, top: 129, left: 396, width: 142, height: 28, fontSize: 12 },
  { id: 'phoneNumber', page: 1, top: 129, left: 590, width: 136, height: 28, fontSize: 12 },
  // 신규 명의자 정보
  { id: 'newName', page: 1, top: 269, left: 252, width: 118, height: 12, fontSize: 12 },
  { id: 'newBirthDate', page: 1, top: 268, left: 455, width: 93, height: 13, fontSize: 12 },
  { id: 'phoneNumber2', page: 1, top: 268, left: 615, width: 111, height: 14, fontSize: 12 },
  { id: 'newAddress', page: 1, top: 281, left: 255, width: 471, height: 15, fontSize: 11 },
  // 요금 납부방법 변경 - 예금주명/생년월일, 은행명/계좌번호, 유효기간
  { id: 'accountHolderName', page: 1, top: 614, left: 290, width: 132, height: 16, fontSize: 12 },
  { id: 'accountHolderBirthDate', page: 1, top: 615, left: 520, width: 205, height: 16, fontSize: 12 },
  { id: 'bankOrCard', page: 1, top: 629, left: 292, width: 51, height: 16, fontSize: 12 },
  { id: 'accountOrCardNumber', page: 1, top: 629, left: 419, width: 192, height: 16, fontSize: 12 },
  { id: 'cardExpiry', page: 1, top: 631, left: 644, width: 81, height: 16, fontSize: 12 },
  // 서명일자
  { id: 'signDate', page: 1, top: 996, left: 102, width: 138, height: 18, fontSize: 14 },
  // 판매점 정보 (매장명 / 매장연락처 / 직원이름)
  { id: 'dealerName', page: 1, top: 1014, left: 103, width: 143, height: 15, fontSize: 12 },
  { id: 'sellerPhone', page: 1, top: 1013, left: 344, width: 165, height: 16, fontSize: 12 },
  { id: 'sellerName', page: 1, top: 1014, left: 595, width: 115, height: 15, fontSize: 12 },
];

interface FormData {
  prevName: string;
  prevBirthDate: string;
  phoneNumber: string;
  newName: string;
  newBirthDate: string;
  newAddress: string;
  paymentMethod: '계좌' | '카드';
  bankOrCard: string;
  accountOrCardNumber: string;
  cardExpiry: string;
  accountHolderBirthDate: string;
  vendor: string;
  signDate: string;
}

export default function LGInfoChangePage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  // 신규 명의자 정보가 기존 명의자와 동일한 경우가 대부분이라 기본값을 동일로 설정
  const [sameAsPrev, setSameAsPrev] = useState(true);

  const [formData, setFormData] = useState<FormData>({
    prevName: '',
    prevBirthDate: '',
    phoneNumber: '',
    newName: '',
    newBirthDate: '',
    newAddress: BASE_ADDRESS,
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
      prevName: '',
      prevBirthDate: '',
      phoneNumber: '',
      newName: '',
      newBirthDate: '',
      newAddress: BASE_ADDRESS,
      paymentMethod: '계좌',
      bankOrCard: '',
      accountOrCardNumber: '',
      cardExpiry: '',
      accountHolderBirthDate: '',
      vendor: 'entoel',
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

  // 신청일자 포맷팅 (2026.07.15 -> 2026    07    15)
  const formatSignDate = (date: string, spacing = 6) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = ' ';
      return `${parts[0]}${nbsp.repeat(spacing)}${parts[1]}${nbsp.repeat(spacing)}${parts[2]}`;
    }
    return date;
  };

  const selectedVendor = VENDOR_OPTIONS.find((v) => v.value === formData.vendor) || VENDOR_OPTIONS[0];

  // 신규 명의자 정보가 기존 명의자와 동일하면 기존 명의자 정보를 그대로 사용
  const effectiveNewName = sameAsPrev ? formData.prevName : formData.newName;
  const effectiveNewBirthDate = sameAsPrev ? formData.prevBirthDate : formData.newBirthDate;

  // 예금주명/생년월일 미입력 시 신규 명의자 정보를 기본값으로 사용
  const accountHolderBirthDateValue = formData.accountHolderBirthDate || effectiveNewBirthDate;

  const fieldPositions: FieldPosition[] = [...BASE_FIELD_POSITIONS];

  const fieldValues: FieldValue = {
    prevName: formData.prevName,
    prevBirthDate: formData.prevBirthDate,
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    phoneNumber2: formatPhoneWithDash(formData.phoneNumber),
    newName: effectiveNewName,
    newBirthDate: effectiveNewBirthDate,
    newAddress: formData.newAddress,
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardExpiry: formData.paymentMethod === '카드' ? formatCardExpiry(formData.cardExpiry) : '',
    accountHolderName: effectiveNewName,
    accountHolderBirthDate: accountHolderBirthDateValue,
    dealerName: selectedVendor.storeName,
    sellerName: selectedVendor.sellerName,
    sellerPhone: selectedVendor.sellerPhone,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="LG 변경신청서" subtitle="LG U+ 고객정보 변경신청서 (명의변경)" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 기존 명의자 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">기존 명의자 정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          명의변경할 휴대폰번호 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="prevName">
                            기존 가입자명 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="prevName" name="prevName" value={formData.prevName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prevBirthDate">
                            생년월일 (6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="prevBirthDate" format="6" value={formData.prevBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, prevBirthDate: value }))} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신규 명의자 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">신규 명의자 정보</p>
                      <RadioGroup value={sameAsPrev ? 'same' : 'diff'} onValueChange={(value) => setSameAsPrev(value === 'same')} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="same" id="same-as-prev" />
                          <Label htmlFor="same-as-prev" className="font-normal cursor-pointer">
                            기존 명의자와 동일
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
                            고객명: <span className="font-medium">{formData.prevName || '-'}</span>
                          </p>
                          <p>
                            생년월일: <span className="font-medium">{formData.prevBirthDate || '-'}</span>
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newName">
                              신규 고객명 <span className="text-destructive">*</span>
                            </Label>
                            <Input id="newName" name="newName" value={formData.newName} onChange={handleChange} placeholder="홍길동" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newBirthDate">
                              생년월일 (6자리) <span className="text-destructive">*</span>
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
                    </div>

                    <Separator />

                    {/* 요금 납부방법 변경 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금 납부방법 변경</p>
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

                    {/* 판매업체 */}
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
