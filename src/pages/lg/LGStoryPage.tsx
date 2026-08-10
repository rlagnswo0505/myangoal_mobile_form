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
import storyImage from '@/assets/templates/이야기 최신.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [storyImage];

// 통신망별 체크 위치 (좌표 확인 모드로 조정 필요)
const NETWORK_POSITIONS = {
  SKT: { top: 95, left: 118 },
  LG: { top: 95, left: 174 },
  KT: { top: 95, left: 236 },
};

// 통신사별 요금제 옵션 (기타 포함 4개) - 서식지 요금제 표에 인쇄된 순서와 동일
const PLAN_OPTIONS: Record<'SKT' | 'LG' | 'KT', string[]> = {
  SKT: ['Band 데이터 안심 300MB', 'Band 데이터 15G+', 'Band 데이터 퍼펙트'],
  LG: ['이야기 선불정액 300MB', '선불정액383(10.3GB)', '이야기 선불정액 15GB+'],
  KT: ['이야기K 선불정액 300MB', '이야기 선불 15G+', '이야기 K 선불정액 10G+'],
};

// 통신사/요금제별 체크 위치 (좌표 확인 모드로 조정 필요)
const PLAN_CHECK_POSITIONS: Record<'SKT' | 'LG' | 'KT', Record<'plan1' | 'plan2' | 'plan3' | 'etc', { top: number; left: number }>> = {
  SKT: {
    plan1: { top: 444, left: 279 },
    plan2: { top: 444, left: 399 },
    plan3: { top: 444, left: 491 },
    etc: { top: 444, left: 589 },
  },
  LG: {
    plan1: { top: 460, left: 278 },
    plan2: { top: 460, left: 391 },
    plan3: { top: 460, left: 496 },
    etc: { top: 460, left: 607 },
  },
  KT: {
    plan1: { top: 478, left: 279 },
    plan2: { top: 478, left: 396 },
    plan3: { top: 478, left: 484 },
    etc: { top: 478, left: 596 },
  },
};

// 통신사별 '기타' 요금제 직접입력 텍스트 위치 (좌표 확인 모드로 조정 필요)
const PLAN_ETC_TEXT_POSITIONS: Record<'SKT' | 'LG' | 'KT', { top: number; left: number; width: number; height: number }> = {
  SKT: { top: 440, left: 620, width: 121, height: 18 },
  LG: { top: 459, left: 641, width: 100, height: 17 },
  KT: { top: 477, left: 629, width: 112, height: 15 },
};

// 부가서비스 위치 (좌표 확인 모드로 조정 필요)
const ADD_SERVICE_POSITION = { top: 466, left: 113, width: 115, height: 31 };

// A4 용지 크기 (96dpi 기준: 794 x 1123 px)
// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 1. 가입고객정보
  { id: 'name', page: 1, top: 336, left: 226, width: 215, height: 32, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 336, left: 575, width: 181, height: 34, fontSize: 14 },
  { id: 'passportNumber', page: 1, top: 369, left: 575, width: 179, height: 32, fontSize: 14 },
  // 2. USIM 정보 (모델명 + 일련번호 2줄)
  { id: 'usimInfo', page: 1, top: 523, left: 284, width: 141, height: 37, fontSize: 14 },
  // 3. 주소 (손글씨체, 기울임, 투명도 0.8)
  { id: 'address', page: 1, top: 400, left: 227, width: 529, height: 35, fontSize: 17, fontFamily: "'Caveat', 'Nanum Pen Script', cursive", fontStyle: 'italic', opacity: 0.8 },
  // 4. 선호번호 (주소 아래 나란히, 랜덤 선택 시 체크 표시 - 임시 좌표, debugMode로 조정 필요)
  { id: 'randomCheck', page: 1, top: 128, left: 236, width: 20, height: 20, fontSize: 14 },
  { id: 'wishNumber1', page: 1, top: 127, left: 470, width: 75, height: 25, fontSize: 14 },
  { id: 'wishNumber2', page: 1, top: 127, left: 560, width: 75, height: 25, fontSize: 14 },
  { id: 'wishNumber3', page: 1, top: 127, left: 660, width: 75, height: 25, fontSize: 14 },
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
const BASE_ADDRESS = '인천 부평구 경원대로 1344번길 34';

interface FormData {
  networkType: 'SKT' | 'LG' | 'KT';
  plan: 'plan1' | 'plan2' | 'plan3' | 'etc';
  planEtcText: string;
  addService: string;
  name: string;
  birthDate: string;
  passportNumber: string;
  usimModel: string;
  usimNumber: string;
  wishType: 'random' | 'manual';
  wishNumber1: string;
  wishNumber2: string;
  wishNumber3: string;
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

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    networkType: 'LG',
    plan: 'plan1',
    planEtcText: '',
    addService: '3개월 무료충전',
    name: '',
    birthDate: '',
    passportNumber: '',
    usimModel: '',
    usimNumber: '',
    wishType: 'random',
    wishNumber1: '',
    wishNumber2: '',
    wishNumber3: '',
    address: `${BASE_ADDRESS}, ${getNextRoom()}`,
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
    // 호수 인덱스 증가
    const savedIndex = localStorage.getItem(STORAGE_KEY);
    const currentIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
    const nextIndex = (currentIndex + 1) % ROOM_ORDER.length;
    localStorage.setItem(STORAGE_KEY, nextIndex.toString());

    setFormData({
      networkType: 'LG',
      plan: 'plan1',
      planEtcText: '',
      addService: '3개월 무료충전',
      name: '',
      birthDate: '',
      passportNumber: '',
      usimModel: '',
      usimNumber: '',
      wishType: 'random',
      wishNumber1: '',
      wishNumber2: '',
      wishNumber3: '',
      address: `${BASE_ADDRESS}, ${ROOM_ORDER[nextIndex]}`,
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

  // 통신망 선택에 따라 체크 위치 동적 생성
  const networkPos = NETWORK_POSITIONS[formData.networkType];
  const planCheckPos = PLAN_CHECK_POSITIONS[formData.networkType][formData.plan];
  const planEtcTextPos = PLAN_ETC_TEXT_POSITIONS[formData.networkType];
  const fieldPositions: FieldPosition[] = [
    // 통신망 체크 표시 (✓)
    { id: 'networkCheck', page: 1, top: networkPos.top, left: networkPos.left, fontSize: 14 },
    // 요금제 체크 표시 (✓)
    { id: 'planCheck', page: 1, top: planCheckPos.top, left: planCheckPos.left, fontSize: 14 },
    // 요금제 '기타' 직접입력
    { id: 'planEtcText', page: 1, ...planEtcTextPos, fontSize: 12 },
    // 부가서비스
    { id: 'addService', page: 1, ...ADD_SERVICE_POSITION, fontSize: 14 },
    ...BASE_FIELD_POSITIONS,
  ];

  // LG는 생년월일과 여권번호가 따로 분리, USIM은 모델명+일련번호 2줄
  const fieldValues: FieldValue = {
    networkCheck: '✓',
    planCheck: '✓',
    planEtcText: formData.plan === 'etc' ? formData.planEtcText : '',
    addService: formData.addService,
    name: formData.name,
    birthDate: formData.birthDate,
    passportNumber: formData.passportNumber,
    usimInfo: `${formData.usimModel}\n${formData.usimNumber}`,
    address: formData.address,
    randomCheck: formData.wishType === 'random' ? '✓' : '',
    wishNumber1: formData.wishType === 'manual' ? formData.wishNumber1 : '',
    wishNumber2: formData.wishType === 'manual' ? formData.wishNumber2 : '',
    wishNumber3: formData.wishType === 'manual' ? formData.wishNumber3 : '',
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="선불 LG 이야기" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                    {/* 통신망 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">통신망 선택</p>
                      <RadioGroup value={formData.networkType} onValueChange={(value) => setFormData((prev) => ({ ...prev, networkType: value as 'SKT' | 'LG' | 'KT', plan: 'plan1', planEtcText: '' }))} className="flex gap-4">
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

                    {/* 요금제 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금제 선택</p>
                      <RadioGroup value={formData.plan} onValueChange={(value) => setFormData((prev) => ({ ...prev, plan: value as 'plan1' | 'plan2' | 'plan3' | 'etc' }))} className="flex flex-col gap-2">
                        {PLAN_OPTIONS[formData.networkType].map((label, idx) => {
                          const key = `plan${idx + 1}` as 'plan1' | 'plan2' | 'plan3';
                          return (
                            <div key={key} className="flex items-center space-x-2">
                              <RadioGroupItem value={key} id={key} />
                              <Label htmlFor={key} className="font-normal cursor-pointer">
                                {label}
                              </Label>
                            </div>
                          );
                        })}
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="etc" id="plan-etc" />
                          <Label htmlFor="plan-etc" className="font-normal cursor-pointer">
                            기타
                          </Label>
                          {formData.plan === 'etc' && <Input value={formData.planEtcText} onChange={(e) => setFormData((prev) => ({ ...prev, planEtcText: e.target.value }))} placeholder="요금제명 직접입력" className="h-8 flex-1" />}
                        </div>
                      </RadioGroup>
                      <div className="space-y-2">
                        <Label htmlFor="addService">부가서비스</Label>
                        <Input id="addService" name="addService" value={formData.addService} onChange={handleChange} placeholder="3개월 무료충전" />
                      </div>
                    </div>

                    <Separator />

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
                      <p className="text-sm font-medium text-muted-foreground">희망번호</p>
                      <RadioGroup value={formData.wishType} onValueChange={(value) => setFormData((prev) => ({ ...prev, wishType: value as 'random' | 'manual' }))} className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="random" id="wish-random" />
                          <Label htmlFor="wish-random" className="font-normal cursor-pointer">
                            랜덤
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="manual" id="wish-manual" />
                          <Label htmlFor="wish-manual" className="font-normal cursor-pointer">
                            직접입력
                          </Label>
                        </div>
                      </RadioGroup>
                      {formData.wishType === 'manual' && (
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="wishNumber1">선호번호 1</Label>
                            <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wishNumber2">선호번호 2</Label>
                            <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wishNumber3">선호번호 3</Label>
                            <Input id="wishNumber3" name="wishNumber3" value={formData.wishNumber3} onChange={handleChange} placeholder="9012" maxLength={4} />
                          </div>
                        </div>
                      )}
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
