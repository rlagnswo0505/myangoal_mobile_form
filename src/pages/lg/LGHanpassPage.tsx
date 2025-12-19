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
import PhoneInput, { formatPhoneForDisplay, formatPhoneWithDash } from '@/components/Form/PhoneInput';
import hanpassImage from '@/assets/templates/LG 한패스 선불.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [hanpassImage];

// 신청유형별 체크 위치 (좌표 확인 모드로 조정 필요)
const TYPE_POSITIONS = {
  prepaid: { top: 120, left: 130 },
  transfer: { top: 120, left: 272 },
};

// 명의변경 시 추가 필드 위치 (좌표 확인 모드로 조정 필요)
const TRANSFER_ADDITIONAL_POSITIONS: FieldPosition[] = [
  // 가입확정 뒷 4자리 (띄워서 표기)
  { id: 'phoneNumber2', page: 1, top: 110, left: 634, width: 139, height: 29, fontSize: 16 },
  // XXX-XXXX-XXXX 표기
  { id: 'phoneNumber3', page: 1, top: 623, left: 208, width: 240, height: 26, fontSize: 16 },
  // XXX-XXXX-XXXX 표기
  { id: 'phoneNumber4', page: 1, top: 649, left: 208, width: 240, height: 26, fontSize: 16 },
];

// 선불 시 추가 필드 위치 (좌표 확인 모드로 조정 필요)
const PREPAID_ADDITIONAL_POSITIONS: FieldPosition[] = [
  // 희망번호 뒷 네자리 1순위
  { id: 'wishNumber1', page: 1, top: 297, left: 237, width: 76, height: 24, fontSize: 14 },
  // 희망번호 뒷 네자리 2순위
  { id: 'wishNumber2', page: 1, top: 298, left: 334, width: 76, height: 24, fontSize: 14 },
  // USIM 모델명
  { id: 'usimModel', page: 1, top: 369, left: 216, width: 93, height: 24, fontSize: 14 },
  // USIM 일련번호
  { id: 'usimNumber', page: 1, top: 369, left: 318, width: 137, height: 26, fontSize: 14 },
];

// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 1. 외국인등록/여권번호
  { id: 'foreignerNumber', page: 1, top: 197, left: 258, width: 179, height: 33, fontSize: 16 },
  // 2. 신청일자
  { id: 'signDate', page: 1, top: 1044, left: 492, width: 137, height: 30, fontSize: 16 },
];

interface FormData {
  applicationType: 'prepaid' | 'transfer';
  phoneNumber: string;
  foreignerNumber: string;
  wishNumber1: string;
  wishNumber2: string;
  usimModel: string;
  usimNumber: string;
  signDate: string;
}

export default function LGHanpassPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    applicationType: 'prepaid',
    phoneNumber: '',
    foreignerNumber: '',
    wishNumber1: '',
    wishNumber2: '',
    usimModel: '',
    usimNumber: '',
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
      foreignerNumber: '',
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
      return `${parts[0]}${nbsp.repeat(9)}${parts[1]}${nbsp.repeat(7)}${parts[2]}`;
    }
    return date;
  };

  // 신청유형에 따라 체크 위치 동적 생성
  const typePos = TYPE_POSITIONS[formData.applicationType];

  const fieldPositions: FieldPosition[] = [
    // 신청유형 체크 표시 (✓)
    { id: 'typeCheck', page: 1, top: typePos.top, left: typePos.left, fontSize: 14 },
    ...BASE_FIELD_POSITIONS,
    // 선불 시 추가 필드
    ...(formData.applicationType === 'prepaid' ? PREPAID_ADDITIONAL_POSITIONS : []),
    // 명의변경 시 추가 필드
    ...(formData.applicationType === 'transfer' ? TRANSFER_ADDITIONAL_POSITIONS : []),
  ];

  const fieldValues: FieldValue = {
    typeCheck: '✓',
    foreignerNumber: formData.foreignerNumber,
    // 선불 시 필드
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    usimModel: formData.usimModel,
    usimNumber: formData.usimNumber,
    // 명의변경 시 전화번호 필드
    phoneNumber2: formatPhoneForDisplay(formData.phoneNumber), // 뒷 4자리 띄워서 표기
    phoneNumber3: formatPhoneWithDash(formData.phoneNumber), // XXX-XXXX-XXXX
    phoneNumber4: formatPhoneWithDash(formData.phoneNumber), // XXX-XXXX-XXXX
    signDate: formatSignDate(formData.signDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="한패스 선불-명변" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} />

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

                    {/* 공통: 외국인등록/여권번호 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="foreignerNumber">
                          외국인등록/여권번호 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="foreignerNumber" name="foreignerNumber" value={formData.foreignerNumber} onChange={handleChange} placeholder="외국인등록번호 또는 여권번호" />
                      </div>
                    </div>

                    {/* 선불 시에만 표시 */}
                    {formData.applicationType === 'prepaid' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">선불 정보</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="wishNumber1">희망번호 뒷 네자리 (1순위)</Label>
                              <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="wishNumber2">희망번호 뒷 네자리 (2순위)</Label>
                              <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                            </div>
                          </div>
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
                              <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="일련번호" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 명의변경 시에만 표시 */}
                    {formData.applicationType === 'transfer' && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">전화번호</p>
                          <div className="space-y-2">
                            <Label htmlFor="phoneNumber">
                              전화번호 <span className="text-destructive">*</span>
                            </Label>
                            <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                            <p className="text-xs text-muted-foreground">* 3곳에 표시됩니다 (가입확정 뒷4자리, XXX-XXXX-XXXX 2곳)</p>
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
          <div className="flex-0.7 border-r bg-muted/30 min-w-[770px]">
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
