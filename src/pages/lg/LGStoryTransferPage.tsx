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
import PhoneInput, { formatPhoneForDisplay, formatPhoneWithDash } from '@/components/Form/PhoneInput';
import transferImage from '@/assets/templates/이야기 최신.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [transferImage];

// 통신망별 체크 위치 (좌표 확인 모드로 조정 필요)
const NETWORK_POSITIONS = {
  SKT: { top: 95, left: 118 },
  LG: { top: 95, left: 174 },
  KT: { top: 95, left: 236 },
};

const BASE_ADDRESS = '인천 부평구 광장로 16';

// A4 용지 크기 (96dpi 기준: 794 x 1123 px)
// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 1. 고객명
  { id: 'name', page: 1, top: 275, left: 232, width: 211, height: 30, fontSize: 14 },
  // 2. 고객명 (추가)
  { id: 'name2', page: 1, top: 335, left: 226, width: 217, height: 35, fontSize: 14 },
  // 3. 생년월일
  { id: 'birthDate', page: 1, top: 275, left: 560, width: 113, height: 27, fontSize: 16 },
  // 4. 생년월일 (추가)
  { id: 'birthDate2', page: 1, top: 335, left: 577, width: 180, height: 34, fontSize: 16 },
  // 5. 외국인등록번호
  { id: 'foreignerNumber', page: 1, top: 368, left: 578, width: 179, height: 32, fontSize: 16 },
  // 6. 휴대폰번호
  { id: 'phoneNumber', page: 1, top: 86, left: 588, width: 170, height: 29, fontSize: 14 },
  // 6-1. 휴대폰번호 (010-1234-1234 형식 - 임시 좌표, debugMode로 조정 필요)
  { id: 'phoneNumber2', page: 1, top: 369, left: 227, width: 215, height: 32, fontSize: 14 },
  // 6-2. 주소 (임시 좌표, debugMode로 조정 필요)
  { id: 'address', page: 1, top: 400, left: 227, width: 400, height: 30, fontSize: 12 },
  // 7. 신청날짜
  { id: 'signDate', page: 1, top: 1040, left: 578, height: 30, fontSize: 15 },
];

interface FormData {
  networkType: 'SKT' | 'LG' | 'KT';
  name: string;
  birthDate: string;
  foreignerNumber: string;
  phoneNumber: string;
  address: string;
  signDate: string;
}

export default function LGStoryTransferPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    networkType: 'LG',
    name: '',
    birthDate: '',
    foreignerNumber: '',
    phoneNumber: '',
    address: BASE_ADDRESS,
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
      networkType: 'LG',
      name: '',
      birthDate: '',
      foreignerNumber: '',
      phoneNumber: '',
      address: BASE_ADDRESS,
      signDate: todayFormatted,
    });
  };

  // 서명일자 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(12)}${parts[1]}${nbsp.repeat(12)}${parts[2]}`;
    }
    return date;
  };

  // 통신망 선택에 따라 체크 위치 동적 생성
  const networkPos = NETWORK_POSITIONS[formData.networkType];
  const fieldPositions: FieldPosition[] = [
    // 통신망 체크 표시 (✓)
    { id: 'networkCheck', page: 1, top: networkPos.top, left: networkPos.left, fontSize: 14 },
    ...BASE_FIELD_POSITIONS,
  ];

  const fieldValues: FieldValue = {
    networkCheck: '✓',
    name: formData.name,
    name2: formData.name,
    birthDate: formData.birthDate,
    birthDate2: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    phoneNumber: formatPhoneForDisplay(formData.phoneNumber),
    phoneNumber2: formatPhoneWithDash(formData.phoneNumber),
    address: formData.address,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="이야기 명의변경" subtitle="이동전화 서비스 명의변경 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 통신망 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">통신망 선택</p>
                      <RadioGroup value={formData.networkType} onValueChange={(value) => setFormData((prev) => ({ ...prev, networkType: value as 'SKT' | 'LG' | 'KT' }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="SKT" id="skt" />
                          <Label htmlFor="skt">SKT</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="LG" id="lg" />
                          <Label htmlFor="lg">LG</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="KT" id="kt" />
                          <Label htmlFor="kt">KT</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">
                          휴대폰번호 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="홍길동" />
                      </div>
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
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          주소 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder={BASE_ADDRESS} />
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
