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
import PhoneInput, { formatPhoneForDisplay } from '@/components/Form/PhoneInput';
import insImage from '@/assets/templates/인스 선불-명변.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [insImage];

// 요금제 옵션
const PLAN_OPTIONS = [
  { value: '19800', label: '19,800 인스 유심 올프리 7GB+', name: '인스 유심 올프리 7GB+' },
  { value: '29600', label: '29,600 인스 유심 스트롱 15GB+', name: '인스 유심 스트롱 15GB+' },
  { value: '39000', label: '39,000 인스 유심 스트롱 11GB+', name: '인스 유심 스트롱 11GB+' },
  { value: '45900', label: '45,900 인스 유심 스트롱 100GB+', name: '인스 유심 스트롱 100GB+' },
];

// 신청유형별 체크 위치 (좌표 확인 모드로 조정 필요)
const TYPE_POSITIONS = {
  prepaid: { top: 12, left: 444 },
  transfer: { top: 12, left: 564 },
};

// A4 용지 크기 (96dpi 기준: 794 x 1123 px)
// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 1. 개통번호
  { id: 'phoneNumber', page: 1, top: 66, left: 180, width: 210, height: 36, fontSize: 16 },
  // 2. 이름
  { id: 'name', page: 1, top: 114, left: 145, width: 259, height: 30, fontSize: 16 },
  // 3. 생년월일
  { id: 'birthDate', page: 1, top: 114, left: 500, width: 155, height: 26, fontSize: 16 },
  // 4. 외국인등록번호
  { id: 'foreignerNumber', page: 1, top: 140, left: 500, width: 200, height: 30, fontSize: 16 },
  // 5. 요금제
  { id: 'plan', page: 1, top: 295, left: 147, width: 255, height: 30, fontSize: 14 },
  // 6. 유심모델
  { id: 'usimModel', page: 1, top: 296, left: 539, width: 85, height: 26, fontSize: 16 },
  // 7. 유심번호
  { id: 'usimNumber', page: 1, top: 296, left: 660, width: 85, height: 26, fontSize: 14 },
  // 8. 희망번호 뒷자리-1
  { id: 'wishNumber1', page: 1, top: 325, left: 189, width: 100, height: 25, fontSize: 14 },
  // 9. 희망번호 뒷자리-2
  { id: 'wishNumber2', page: 1, top: 350, left: 189, width: 100, height: 25, fontSize: 14 },
  // 10. 신청날짜
  { id: 'signDate', page: 1, top: 1037, left: 140, width: 274, height: 38, fontSize: 16 },
];

interface FormData {
  applicationType: 'prepaid' | 'transfer';
  phoneNumber: string;
  name: string;
  birthDate: string;
  foreignerNumber: string;
  plan: string;
  usimModel: string;
  usimNumber: string;
  wishNumber1: string;
  wishNumber2: string;
  signDate: string;
}

export default function LGInsPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    applicationType: 'prepaid',
    phoneNumber: '',
    name: '',
    birthDate: '',
    foreignerNumber: '',
    plan: '',
    usimModel: '',
    usimNumber: '',
    wishNumber1: '',
    wishNumber2: '',
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
      applicationType: 'prepaid',
      phoneNumber: '',
      name: '',
      birthDate: '',
      foreignerNumber: '',
      plan: '',
      usimModel: '',
      usimNumber: '',
      wishNumber1: '',
      wishNumber2: '',
      signDate: todayFormatted,
    });
  };

  // 서명일자 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(11)}${parts[1]}${nbsp.repeat(13)}${parts[2]}`;
    }
    return date;
  };

  // 신청유형에 따라 체크 위치 동적 생성
  const typePos = TYPE_POSITIONS[formData.applicationType];
  const fieldPositions: FieldPosition[] = [
    // 신청유형 체크 표시 (✓)
    { id: 'typeCheck', page: 1, top: typePos.top, left: typePos.left, fontSize: 14 },
    ...BASE_FIELD_POSITIONS,
  ];

  // 요금제 라벨 찾기
  const selectedPlan = PLAN_OPTIONS.find((p) => p.value === formData.plan);

  const fieldValues: FieldValue = {
    typeCheck: '✓',
    phoneNumber: formatPhoneForDisplay(formData.phoneNumber),
    name: formData.name,
    birthDate: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    plan: selectedPlan?.name || '',
    usimModel: formData.usimModel,
    usimNumber: formData.usimNumber,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="인스 선불-명변" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="w-[500px] border-r bg-muted/30">
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
                      <RadioGroup value={formData.applicationType} onValueChange={(value) => setFormData((prev) => ({ ...prev, applicationType: value as 'prepaid' | 'transfer' }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="prepaid" id="prepaid" />
                          <Label htmlFor="prepaid">선불</Label>
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
                          <Label htmlFor="phoneNumber">
                            개통번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            이름 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
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
                    </div>

                    <Separator />

                    {/* 요금제 */}
                    <div className="space-y-4 ">
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
                    <div className=" space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">USIM 정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usimModel">
                            유심모델 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimModel" name="usimModel" value={formData.usimModel} onChange={handleChange} placeholder="모델명" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usimNumber">
                            유심번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="0000 0000" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 희망번호 */}
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
