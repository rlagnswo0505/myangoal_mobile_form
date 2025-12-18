import { useState, type ChangeEvent } from 'react';
import ImageViewer, { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';
import PrintModal from '@/components/PrintModal/PrintModal';
import PageHeader from '@/components/Layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import DateInput from '@/components/Form/DateInput';
import storyImage from '@/assets/templates/LG 선불 이야기.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [storyImage];

// A4 용지 크기 (96dpi 기준: 794 x 1123 px)
// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const FIELD_POSITIONS: FieldPosition[] = [
  // 1. 가입고객정보
  { id: 'name', page: 1, top: 128, left: 225, width: 218, height: 36, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 128, left: 580, width: 182, height: 34, fontSize: 14 },
  { id: 'passportNumber', page: 1, top: 160, left: 580, width: 182, height: 34, fontSize: 14 },
  // 2. USIM 정보 (모델명 + 일련번호 2줄)
  { id: 'usimInfo', page: 1, top: 343, left: 290, width: 145, height: 41, fontSize: 14 },
  // 3. 주소 (손글씨체, 기울임, 투명도 0.8)
  { id: 'address', page: 1, top: 194, left: 450, width: 82, height: 38, fontSize: 17, fontFamily: "'Caveat', 'Nanum Pen Script', cursive", fontStyle: 'italic', opacity: 0.8 },
  // 4. 선호번호 (주소 아래 나란히)
  { id: 'wishNumber1', page: 1, top: 232, left: 250, width: 80, height: 30, fontSize: 14 },
  { id: 'wishNumber2', page: 1, top: 232, left: 340, width: 80, height: 30, fontSize: 14 },
  // 5. 서명일자
  { id: 'signDate', page: 1, top: 1036, left: 580, height: 39, fontSize: 14 },
];

// 호수 순서 정의 (101~120, 201~220, 301~320, ..., 901~920)
const ROOM_ORDER = [
  ...Array.from({ length: 20 }, (_, i) => `${101 + i}`), // 101 ~ 120
  ...Array.from({ length: 20 }, (_, i) => `${201 + i}`), // 201 ~ 220
  ...Array.from({ length: 20 }, (_, i) => `${301 + i}`), // 301 ~ 320
  ...Array.from({ length: 20 }, (_, i) => `${401 + i}`), // 401 ~ 420
  ...Array.from({ length: 20 }, (_, i) => `${501 + i}`), // 501 ~ 520
  ...Array.from({ length: 20 }, (_, i) => `${601 + i}`), // 601 ~ 620
  ...Array.from({ length: 20 }, (_, i) => `${701 + i}`), // 701 ~ 720
  ...Array.from({ length: 20 }, (_, i) => `${801 + i}`), // 801 ~ 820
  ...Array.from({ length: 20 }, (_, i) => `${901 + i}`), // 901 ~ 920
];

const STORAGE_KEY = 'lg_story_room_index';

interface FormData {
  name: string;
  birthDate: string;
  passportNumber: string;
  usimModel: string;
  usimNumber: string;
  wishNumber1: string;
  wishNumber2: string;
  address: string;
  signDate: string;
}

export default function LGStoryPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  // 스토리지에서 현재 호수 인덱스 가져오기
  const getNextRoom = () => {
    const savedIndex = localStorage.getItem(STORAGE_KEY);
    const currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
    return ROOM_ORDER[currentIndex % ROOM_ORDER.length];
  };

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    passportNumber: '',
    usimModel: '',
    usimNumber: '',
    wishNumber1: '',
    wishNumber2: '',
    address: `, ${getNextRoom()}`,
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
    // 호수 인덱스 증가
    const savedIndex = localStorage.getItem(STORAGE_KEY);
    const currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
    const nextIndex = (currentIndex + 1) % ROOM_ORDER.length;
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());

    setFormData({
      name: '',
      birthDate: '',
      passportNumber: '',
      usimModel: '',
      usimNumber: '',
      wishNumber1: '',
      wishNumber2: '',
      address: `, ${ROOM_ORDER[nextIndex]}`,
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

  // LG는 생년월일과 여권번호가 따로 분리, USIM은 모델명+일련번호 2줄
  const fieldValues: FieldValue = {
    name: formData.name,
    birthDate: formData.birthDate,
    passportNumber: formData.passportNumber,
    usimInfo: `${formData.usimModel}\n${formData.usimNumber}`,
    address: formData.address,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="선불 LG 이야기" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} />

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
                    {/* 가입고객정보 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          이름 (법인명) <span className="text-destructive">*</span>
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
                          <Label htmlFor="passportNumber">여권번호</Label>
                          <Input id="passportNumber" name="passportNumber" value={formData.passportNumber} onChange={handleChange} placeholder="M12345678" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* USIM 정보 */}
                    <div className=" flex gap-4">
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

                    <Separator />

                    {/* 선호번호 */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber1">선호번호 1</Label>
                          <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber2">선호번호 2</Label>
                          <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 주소 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">
                          호수 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder=", 101" />
                      </div>
                    </div>

                    <Separator />

                    {/* 서명일자 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signDate">
                          서명일자 <span className="text-destructive">*</span>
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
                <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={0.9} debugMode={debugMode} />
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
        fieldPositions={FIELD_POSITIONS}
        fieldValues={fieldValues}
      />
    </>
  );
}
