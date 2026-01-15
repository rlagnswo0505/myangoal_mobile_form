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
import DateInput from '@/components/Form/DateInput';

// PDF 이미지 import
import joytelImage1 from '@/assets/templates/조이텔 선불-명변_1.jpg';
import joytelImage2 from '@/assets/templates/조이텔 선불-명변_2.jpg';

// 전체 페이지 이미지
const PAGE_IMAGES: string[] = [joytelImage1, joytelImage2];

// 신규가입/명의변경 체크 위치
const APPLICATION_TYPE_POSITIONS = {
  new: {
    top: 87,
    left: 108,
  }, // 신규가입
  transfer: { top: 87, left: 254 }, // 명의변경
};

// 필드 위치 설정 (A4 픽셀 좌표 기준) - debugMode로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // === 1페이지 공통 필드 ===
  // 이름
  { id: 'name', page: 1, top: 142, left: 221, width: 216, height: 31, fontSize: 14 },
  // 생년월일 (6자리)
  { id: 'birthDate', page: 1, top: 142, left: 550, width: 61, height: 25, fontSize: 14 },
  // 여권번호
  { id: 'passportNumber', page: 1, top: 142, left: 616, width: 135, height: 25, fontSize: 14 },
  // 신청일자
  { id: 'signDate', page: 1, top: 1020, left: 568, width: 140, height: 32, fontSize: 14 },

  // === 1페이지 신규가입 전용 ===
  // 요금제
  { id: 'plan', page: 1, top: 293, left: 211, width: 263, height: 20, fontSize: 12 },
  // 희망번호 뒷 4자리 - 1번
  { id: 'wishNumber1', page: 1, top: 270, left: 235, width: 106, height: 22, fontSize: 14 },
  // 희망번호 뒷 4자리 - 2번
  { id: 'wishNumber2', page: 1, top: 270, left: 356, width: 106, height: 22, fontSize: 14 },
  // USIM 모델
  { id: 'usimModel', page: 1, top: 336, left: 210, width: 82, height: 28, fontSize: 12 },
  // USIM 일련번호
  { id: 'usimSerial', page: 1, top: 336, left: 301, width: 175, height: 28, fontSize: 12 },

  // === 1페이지 명의변경 전용 ===
  // 핸드폰번호 (8자리: XXXX-XXXX)
  { id: 'phoneNumber8', page: 1, top: 81, left: 620, width: 110, height: 31, fontSize: 14 },

  // === 2페이지 명의변경 전용 ===
  // 핸드폰번호 11자리 - 1번
  { id: 'phoneNumber11_1', page: 2, top: 38, left: 207, width: 242, height: 28, fontSize: 14 },
  // 핸드폰번호 11자리 - 2번
  { id: 'phoneNumber11_2', page: 2, top: 65, left: 207, width: 242, height: 28, fontSize: 14 },
  // 생년월일 (2페이지)
  { id: 'birthDate2', page: 2, top: 39, left: 544, width: 191, height: 24, fontSize: 14 },
];

interface FormData {
  applicationType: 'new' | 'transfer';
  // 공통 필드
  name: string;
  birthDate: string;
  passportNumber: string;
  signDate: string;
  // 신규가입 전용
  plan: string;
  wishNumber1: string;
  wishNumber2: string;
  usimModel: string;
  usimSerial: string;
  // 명의변경 전용
  phoneNumber: string; // 전체 번호 (11자리)
}

export default function JoytelPrepaidPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    applicationType: 'new',
    name: '',
    birthDate: '',
    passportNumber: '',
    signDate: todayFormatted,
    plan: 'band 안심 데이터 (300MB)',
    wishNumber1: '',
    wishNumber2: '',
    usimModel: '',
    usimSerial: '',
    phoneNumber: '',
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
      name: '',
      birthDate: '',
      passportNumber: '',
      signDate: todayFormatted,
      plan: 'band 안심 데이터',
      wishNumber1: '',
      wishNumber2: '',
      usimModel: '',
      usimSerial: '',
      phoneNumber: '',
    });
  };

  // 서명일자 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(6)}${parts[1]}${nbsp.repeat(6)}${parts[2]}`;
    }
    return date;
  };

  // 핸드폰번호 8자리 포맷 (XXXX-XXXX)
  const formatPhone8 = (phone: string): string => {
    const numbers = phone.replace(/[^0-9]/g, '');
    const remaining = numbers.slice(3); // 010 제외
    if (remaining.length <= 4) {
      return remaining;
    }
    return `${remaining.slice(0, 4)}-${remaining.slice(4)}`;
  };

  // 핸드폰번호 11자리 포맷 (XXX-XXXX-XXXX)
  const formatPhone11 = (phone: string): string => {
    const numbers = phone.replace(/[^0-9]/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    }
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  // 핸드폰번호 입력 핸들러
  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    input = input.replace(/[^0-9-]/g, '');
    const numbers = input.replace(/-/g, '');
    const limited = numbers.slice(0, 11);

    let formatted = '';
    if (limited.length <= 3) {
      formatted = limited;
    } else if (limited.length <= 7) {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }

    setFormData((prev) => ({ ...prev, phoneNumber: formatted }));
  };

  // 희망번호 입력 핸들러 (4자리 숫자만)
  const handleWishNumberChange = (field: 'wishNumber1' | 'wishNumber2') => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // 신청 유형에 따라 표시할 이미지 결정
  const displayImages = formData.applicationType === 'new' ? [PAGE_IMAGES[0]] : PAGE_IMAGES;

  // 신청 유형 체크 위치
  const appTypePos = APPLICATION_TYPE_POSITIONS[formData.applicationType];

  // 필드 위치 필터링 (신청 유형에 따라)
  const getFilteredPositions = (): FieldPosition[] => {
    const positions: FieldPosition[] = [
      // 신청 유형 체크 표시
      { id: 'appTypeCheck', page: 1, top: appTypePos.top, left: appTypePos.left, fontSize: 14 },
    ];

    if (formData.applicationType === 'new') {
      // 신규가입: 1페이지만, 신규가입 전용 필드 포함
      const newFields = ['name', 'birthDate', 'passportNumber', 'signDate', 'plan', 'wishNumber1', 'wishNumber2', 'usimModel', 'usimSerial'];
      positions.push(...BASE_FIELD_POSITIONS.filter((f) => f.page === 1 && newFields.includes(f.id)));
    } else {
      // 명의변경: 2페이지, 명의변경 전용 필드 포함
      const transferFields = ['name', 'birthDate', 'passportNumber', 'signDate', 'phoneNumber8', 'phoneNumber11_1', 'phoneNumber11_2', 'birthDate2'];
      positions.push(...BASE_FIELD_POSITIONS.filter((f) => transferFields.includes(f.id)));
    }

    return positions;
  };

  const fieldPositions = getFilteredPositions();

  // 필드 값 매핑
  const getFieldValues = (): FieldValue => {
    const values: FieldValue = {
      appTypeCheck: '✓',
      name: formData.name,
      birthDate: formData.birthDate,
      passportNumber: formData.passportNumber,
      signDate: formatSignDate(formData.signDate),
    };

    if (formData.applicationType === 'new') {
      values.plan = formData.plan;
      values.wishNumber1 = formData.wishNumber1;
      values.wishNumber2 = formData.wishNumber2;
      values.usimModel = formData.usimModel;
      values.usimSerial = formData.usimSerial;
    } else {
      values.phoneNumber8 = formatPhone8(formData.phoneNumber);
      values.phoneNumber11_1 = formatPhone11(formData.phoneNumber);
      values.phoneNumber11_2 = formatPhone11(formData.phoneNumber);
      values.birthDate2 = formData.birthDate;
    }

    return values;
  };

  const fieldValues = getFieldValues();

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="조이텔 선불-명변" subtitle="조이텔 선불 가입신청서 / 명의변경" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} />

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
                    {/* 신청 유형 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">신청 유형</p>
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

                    {/* 명의변경 전용: 핸드폰번호 */}
                    {formData.applicationType === 'transfer' && (
                      <>
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">핸드폰 정보</p>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">
                              핸드폰 번호 <span className="text-destructive">*</span>
                            </Label>
                            <Input id="phoneNumber" value={formData.phoneNumber} onChange={handlePhoneChange} placeholder="010-1234-5678" maxLength={13} />
                            <p className="text-xs text-muted-foreground">
                              1페이지: {formatPhone8(formData.phoneNumber) || 'XXXX-XXXX'} / 2페이지: {formatPhone11(formData.phoneNumber) || 'XXX-XXXX-XXXX'}
                            </p>
                          </div>
                        </div>
                        <Separator />
                      </>
                    )}

                    {/* 공통: 고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          이름 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">
                          생년월일 (6자리) <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                        {formData.applicationType === 'transfer' && <p className="text-xs text-muted-foreground">※ 명의변경 시 1페이지와 2페이지 모두에 표시됩니다.</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="passportNumber">
                          여권번호 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="M12345678" />
                      </div>
                    </div>

                    {/* 신규가입 전용 필드 */}
                    {formData.applicationType === 'new' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">가입 정보</p>
                          <div className="space-y-2">
                            <Label htmlFor="plan">요금제</Label>
                            <Input id="plan" name="plan" value={formData.plan} readOnly className="bg-muted" />
                          </div>
                          <div className="space-y-2">
                            <Label>희망번호 뒷 4자리</Label>
                            <div className="flex gap-2">
                              <Input id="wishNumber1" value={formData.wishNumber1} onChange={handleWishNumberChange('wishNumber1')} placeholder="1234" maxLength={4} className="flex-1" />
                              <Input id="wishNumber2" value={formData.wishNumber2} onChange={handleWishNumberChange('wishNumber2')} placeholder="5678" maxLength={4} className="flex-1" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="usimModel">USIM 모델</Label>
                            <Input id="usimModel" name="usimModel" value={formData.usimModel} onChange={handleChange} placeholder="USIM 모델명 입력" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="usimSerial">USIM 일련번호</Label>
                            <Input id="usimSerial" name="usimSerial" value={formData.usimSerial} onChange={handleChange} placeholder="USIM 일련번호 입력" />
                          </div>
                        </div>
                      </>
                    )}

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
          <div className="flex-1 border-r bg-muted/30 min-w-[770px]">
            <ScrollArea className="h-full">
              <div className="">
                {debugMode && <p className="text-xs text-muted-foreground mb-2">이미지를 클릭하면 좌표가 표시됩니다</p>}
                <ImageViewer images={displayImages} fieldPositions={fieldPositions} fieldValues={fieldValues} scale={1} debugMode={debugMode} />
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
        images={displayImages}
        fieldPositions={fieldPositions}
        fieldValues={fieldValues}
      />
    </>
  );
}
