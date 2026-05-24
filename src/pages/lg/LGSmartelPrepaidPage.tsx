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
import smartelImage from '@/assets/templates/LG 스마텔.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [smartelImage];

// 기간 표시 위치 (좌표 확인 모드로 조정 필요)
const PERIOD_POSITION = { top: 304, left: 305 };

// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const FIELD_POSITIONS: FieldPosition[] = [
  // 1. 고객명 (인쇄 시 빈칸)
  // { id: 'name', page: 1, top: 100, left: 200, width: 200, height: 30, fontSize: 14 },
  // 2. 생년월일
  { id: 'birthDate', page: 1, top: 133, left: 592, width: 136, height: 32, fontSize: 14 },
  // 3. 주소
  { id: 'address', page: 1, top: 169, left: 216, width: 512, height: 32, fontSize: 14 },
  // 4. 여권번호
  { id: 'passportNumber', page: 1, top: 238, left: 214, width: 187, height: 30, fontSize: 14 },
  // 5. 희망번호 뒷 네자리 1
  { id: 'wishNumber1', page: 1, top: 372, left: 195, width: 64, height: 24, fontSize: 14 },
  // 6. 희망번호 뒷 네자리 2
  { id: 'wishNumber2', page: 1, top: 372, left: 278, width: 72, height: 24, fontSize: 14 },
  // 7. USIM 모델명
  { id: 'usimModel', page: 1, top: 368, left: 444, width: 72, height: 30, fontSize: 14 },
  // 8. USIM 일련번호
  { id: 'usimNumber', page: 1, top: 366, left: 533, width: 194, height: 34, fontSize: 14 },
  // 9. 신청일자
  { id: 'signDate', page: 1, top: 1029, left: 503, width: 157, height: 26, fontSize: 14 },
];

interface FormData {
  name: string;
  birthDate: string;
  address: string;
  passportNumber: string;
  period: '2month' | '3month';
  wishNumber1: string;
  wishNumber2: string;
  usimModel: string;
  usimNumber: string;
  signDate: string;
}

export default function LGSmartelPrepaidPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    address: '인천광역시 부평구 광장로 16 1층 10호 미얀골',
    passportNumber: '',
    period: '2month',
    wishNumber1: '',
    wishNumber2: '',
    usimModel: '',
    usimNumber: '',
    signDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'name' || name === 'passportNumber' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      address: '',
      passportNumber: '',
      period: '2month',
      wishNumber1: '',
      wishNumber2: '',
      usimModel: '',
      usimNumber: '',
      signDate: todayFormatted,
    });
  };

  // 서명일자 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(12)}${parts[1]}${nbsp.repeat(14)}${parts[2]}`;
    }
    return date;
  };

  // 기간 텍스트 변환
  const getPeriodText = (period: '2month' | '3month') => {
    return period === '2month' ? '2개월' : '3개월';
  };

  const fieldPositions: FieldPosition[] = [
    // 기간 표시 (2개월 또는 3개월)
    { id: 'period', page: 1, top: PERIOD_POSITION.top, left: PERIOD_POSITION.left, fontSize: 14 },
    ...FIELD_POSITIONS,
  ];

  // 고객명은 인쇄 시 빈칸이므로 fieldValues에서 제외
  const fieldValues: FieldValue = {
    period: getPeriodText(formData.period),
    birthDate: formData.birthDate,
    address: formData.address,
    passportNumber: formData.passportNumber,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    usimModel: formData.usimModel,
    usimNumber: formData.usimNumber,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="LG 스마텔 선불" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                  <CardContent className="space-y-4">
                    {/* 고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          고객명 <span className="text-xs text-muted-foreground">(인쇄 시 빈칸)</span>
                        </Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">
                            생년월일 <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="passportNumber">
                            여권번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="M12345678" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="주소를 입력하세요" />
                      </div>
                    </div>

                    <Separator />

                    {/* 기간 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">가입 기간</p>
                      <RadioGroup value={formData.period} onValueChange={(value) => setFormData((prev) => ({ ...prev, period: value as '2month' | '3month' }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="2month" id="2month" />
                          <Label htmlFor="2month">2개월</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="3month" id="3month" />
                          <Label htmlFor="3month">3개월</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 희망번호 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">희망번호</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber1">희망번호 1순위</Label>
                          <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber2">희망번호 2순위</Label>
                          <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* USIM 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">USIM 정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usimModel">
                            USIM 모델명 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimModel" name="usimModel" value={formData.usimModel} onChange={handleChange} placeholder="모델명" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usimNumber">
                            USIM 일련번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="0000 0000" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청일자 */}
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
