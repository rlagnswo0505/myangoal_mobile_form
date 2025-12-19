import { useState, type ChangeEvent } from 'react';
import ImageViewer, { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';
import PrintModal from '@/components/PrintModal/PrintModal';
import PageHeader from '@/components/Layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateInput from '@/components/Form/DateInput';
import PhoneInput, { formatPhoneForDisplay, formatPhoneWithDash } from '@/components/Form/PhoneInput';
import insPostpaidImage from '@/assets/templates/인스 후불.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [insPostpaidImage];

// 요금제 옵션 (LGInsPage와 동일)
const PLAN_OPTIONS = [
  { value: '19800', label: '19,800 인스 유심 올프리 7GB+', name: '인스 유심 올프리 7GB+' },
  { value: '29600', label: '29,600 인스 유심 스트롱 15GB+', name: '인스 유심 스트롱 15GB+' },
  { value: '39000', label: '39,000 인스 유심 스트롱 11GB+', name: '인스 유심 스트롱 11GB+' },
  { value: '45900', label: '45,900 인스 유심 스트롱 100GB+', name: '인스 유심 스트롱 100GB+' },
];

// 변경전 통신사 옵션
const CARRIER_OPTIONS = [
  { value: 'mvno', label: '알뜰폰' },
  { value: 'skt', label: 'SKT' },
  { value: 'kt', label: 'KT' },
  { value: 'lg', label: 'LG U+' },
];

// 신청유형별 체크 위치 (좌표 확인 모드로 조정 필요)
const TYPE_POSITIONS = {
  new: { top: 20, left: 342 },
  transfer: { top: 20, left: 462 },
};

// 명의변경 시 추가 필드 위치 (좌표 확인 모드로 조정 필요)
const TRANSFER_ADDITIONAL_POSITIONS: FieldPosition[] = [
  // 양도인 개통번호
  { id: 'phoneNumber2', page: 1, top: 974, left: 540, width: 204, height: 29, fontSize: 16 },
  // 양수인 개통번호
  { id: 'phoneNumber3', page: 1, top: 242, left: 135, width: 273, height: 25, fontSize: 16 },
];

// 변경전 통신사 체크 위치 (명의변경 시만 표시)
const CARRIER_CHECK_POSITIONS = {
  skt: { top: 246, left: 501 },
  kt: { top: 246, left: 546 },
  lg: { top: 246, left: 584 },
  mvno: { top: 246, left: 632 },
};

// 알뜰폰 상세 입력 위치 (명의변경 시만 표시)
const MVNO_DETAIL_POSITION: FieldPosition = { id: 'mvnoDetail', page: 1, top: 246, left: 672, width: 87, height: 23, fontSize: 12 };

// 신규가입 시 희망번호 필드 위치 (좌표 확인 모드로 조정 필요)
const NEW_WISH_NUMBER_POSITIONS: FieldPosition[] = [
  { id: 'wishNumber1', page: 1, top: 186, left: 180, width: 110, height: 29, fontSize: 14 },
  { id: 'wishNumber2', page: 1, top: 212, left: 180, width: 110, height: 29, fontSize: 14 },
];

// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 1. 개통번호
  {
    id: 'phoneNumber',
    page: 1,
    top: 50,
    left: 490,
    width: 270,
    height: 28,
    fontSize: 16,
  },
  // 2. 이름
  { id: 'name', page: 1, top: 50, left: 136, width: 270, height: 28, fontSize: 16 },
  // 3. 생년월일
  { id: 'birthDate', page: 1, top: 76, left: 136, width: 270, height: 28, fontSize: 16 },
  // 4. 외국인등록번호
  { id: 'foreignerNumber', page: 1, top: 76, left: 490, width: 270, height: 28, fontSize: 16 },
  // 5. 주소
  { id: 'address', page: 1, top: 130, left: 136, width: 620, height: 27, fontSize: 14 },
  // 6. 요금제
  { id: 'plan', page: 1, top: 160, left: 136, width: 272, height: 24, fontSize: 14 },
  // 7. 유심모델
  { id: 'usimModel', page: 1, top: 160, left: 534, width: 85, height: 27, fontSize: 16 },
  // 8. 유심번호
  { id: 'usimNumber', page: 1, top: 160, left: 660, width: 89, height: 24, fontSize: 14 },
  // 9. 예금주
  { id: 'accountHolder', page: 1, top: 314, left: 136, width: 180, height: 28, fontSize: 16 },
  // 10. 예금주 생년월일
  { id: 'accountBirthDate', page: 1, top: 314, left: 484, width: 146, height: 28, fontSize: 16 },
  // 11. 은행
  { id: 'bank', page: 1, top: 340, left: 136, width: 115, height: 30, fontSize: 14 },
  // 12. 계좌번호
  { id: 'accountNumber', page: 1, top: 340, left: 328, width: 300, height: 29, fontSize: 16 },
  // 13. 신청날짜
  { id: 'signDate', page: 1, top: 1039, left: 130, width: 280, height: 38, fontSize: 16 },
];

interface FormData {
  applicationType: 'new' | 'transfer';
  phoneNumber: string;
  name: string;
  birthDate: string;
  foreignerNumber: string;
  address: string;
  plan: string;
  usimModel: string;
  usimNumber: string;
  wishNumber1: string;
  wishNumber2: string;
  prevCarrier: string;
  mvnoDetail: string;
  accountHolder: string;
  accountBirthDate: string;
  bank: string;
  accountNumber: string;
  signDate: string;
}

export default function LGInsPostpaidPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    applicationType: 'new',
    phoneNumber: '',
    name: '',
    birthDate: '',
    foreignerNumber: '',
    address: '',
    plan: '',
    usimModel: '',
    usimNumber: '',
    wishNumber1: '',
    wishNumber2: '',
    prevCarrier: 'mvno',
    mvnoDetail: '',
    accountHolder: '',
    accountBirthDate: '',
    bank: '',
    accountNumber: '',
    signDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      applicationType: 'new',
      phoneNumber: '',
      name: '',
      birthDate: '',
      foreignerNumber: '',
      address: '',
      plan: '',
      usimModel: '',
      usimNumber: '',
      wishNumber1: '',
      wishNumber2: '',
      prevCarrier: 'mvno',
      mvnoDetail: '',
      accountHolder: '',
      accountBirthDate: '',
      bank: '',
      accountNumber: '',
      signDate: todayFormatted,
    });
  };

  // 서명일자 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(20)}${parts[1]}${nbsp.repeat(20)}${parts[2]}`;
    }
    return date;
  };

  // 신청유형에 따라 체크 위치 동적 생성
  const typePos = TYPE_POSITIONS[formData.applicationType];

  // 명의변경 시 변경전 통신사 체크 위치
  const carrierCheckPos = formData.prevCarrier ? CARRIER_CHECK_POSITIONS[formData.prevCarrier as keyof typeof CARRIER_CHECK_POSITIONS] : null;

  const fieldPositions: FieldPosition[] = [
    // 신청유형 체크 표시 (✓)
    { id: 'typeCheck', page: 1, top: typePos.top, left: typePos.left, fontSize: 14 },
    ...BASE_FIELD_POSITIONS,
    // 신규가입 시 희망번호 필드
    ...(formData.applicationType === 'new' ? NEW_WISH_NUMBER_POSITIONS : []),
    // 명의변경 시 추가 필드
    ...(formData.applicationType === 'transfer' ? TRANSFER_ADDITIONAL_POSITIONS : []),
    // 명의변경 시 변경전 통신사 체크
    ...(formData.applicationType === 'transfer' && carrierCheckPos ? [{ id: 'carrierCheck', page: 1, top: carrierCheckPos.top, left: carrierCheckPos.left, fontSize: 14 }] : []),
    // 명의변경 + 알뜰폰 시 상세 입력란
    ...(formData.applicationType === 'transfer' && formData.prevCarrier === 'mvno' ? [MVNO_DETAIL_POSITION] : []),
  ];

  // 요금제 라벨 찾기
  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === formData.plan);

  const fieldValues: FieldValue = {
    typeCheck: '✓',
    phoneNumber: formatPhoneWithDash(formData.phoneNumber),
    phoneNumber2: formatPhoneForDisplay(formData.phoneNumber),
    phoneNumber3: formatPhoneWithDash(formData.phoneNumber),
    name: formData.name,
    birthDate: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    address: formData.address,
    plan: selectedPlan?.name || '',
    usimModel: formData.usimModel,
    usimNumber: formData.usimNumber,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    carrierCheck: '✓',
    mvnoDetail: formData.mvnoDetail,
    accountHolder: formData.accountHolder,
    accountBirthDate: formData.accountBirthDate,
    bank: formData.bank,
    accountNumber: formData.accountNumber,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="인스 후불" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청서 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 신청유형 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">신청유형</p>
                      <RadioGroup value={formData.applicationType} onValueChange={(value) => setFormData((prev) => ({ ...prev, applicationType: value as 'new' | 'transfer' }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="new" id="new" />
                          <Label htmlFor="new">신규가입</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="transfer" id="transfer" />
                          <Label htmlFor="transfer">명의변경</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            이름 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            전화번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">
                            생년월일 (6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="foreignerNumber">
                            외국인등록번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="foreignerNumber" name="foreignerNumber" value={formData.foreignerNumber} onChange={handleChange} placeholder="1234567890123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="서울시 강남구 테헤란로 123" />
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
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* USIM 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">USIM 정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usimModel">
                            유심 모델명 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimModel" name="usimModel" value={formData.usimModel} onChange={handleChange} placeholder="모델명" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usimNumber">
                            유심 일련번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="0000 0000" />
                        </div>
                      </div>
                    </div>

                    {/* 희망번호 - 신규가입 시에만 표시 */}
                    {formData.applicationType === 'new' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">희망번호 뒷자리</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wishNumber1">1순위</Label>
                              <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="wishNumber2">2순위</Label>
                              <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 변경전 통신사 - 명의변경 시에만 표시 */}
                    {formData.applicationType === 'transfer' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">변경전 통신사</p>
                          <div className="space-y-4">
                            <RadioGroup value={formData.prevCarrier} onValueChange={(value) => setFormData((prev) => ({ ...prev, prevCarrier: value }))} className="flex flex-wrap gap-4">
                              {CARRIER_OPTIONS.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`carrier-${option.value}`} />
                                  <Label htmlFor={`carrier-${option.value}`}>{option.label}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                            {formData.prevCarrier === 'mvno' && (
                              <div className="space-y-2">
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

                    {/* 요금납부 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금납부</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountHolder">
                            예금주 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="accountHolder" name="accountHolder" value={formData.accountHolder} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountBirthDate">
                            예금주 생년월일 (6자리) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="accountBirthDate" format="6" value={formData.accountBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, accountBirthDate: value }))} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank">
                            은행 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="bank" name="bank" value={formData.bank} onChange={handleChange} placeholder="은행명 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">
                            계좌번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="000-000-000000" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청날짜 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">신청날짜</p>
                      <div className="space-y-2">
                        <Label htmlFor="signDate">
                          날짜 <span className="text-destructive">*</span>
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
          <div className="flex-1 bg-muted/50 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="">
                {debugMode && <p className="text-xs text-muted-foreground mb-2">이미지를 클릭하면 좌표가 표시됩니다</p>}
                <ImageViewer images={PAGE_IMAGES} fieldPositions={fieldPositions} fieldValues={fieldValues} scale={0.9} debugMode={debugMode} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 인쇄 모달 */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => {
          setShowPrintModal(false);
          resetForm();
        }}
        images={PAGE_IMAGES}
        fieldPositions={fieldPositions}
        fieldValues={fieldValues}
      />
    </>
  );
}
