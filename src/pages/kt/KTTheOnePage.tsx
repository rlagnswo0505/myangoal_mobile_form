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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DateInput from '@/components/Form/DateInput';
import theoneImage from '@/assets/templates/더원-신규.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES: string[] = [theoneImage];

// 요금제 옵션
const PLAN_OPTIONS = [
  { value: '19800', label: '19,800 TOP 7GB 기본(밀리의서재)', name: 'TOP 7GB 기본(밀리의서재)' },
  { value: '24200', label: '24,200 TOP 10GB 기본(밀리의서재)', name: 'TOP 10GB 기본(밀리의서재)' },
  { value: '26400', label: '26,400 TOP 15GB 기본(밀리의서재)', name: 'TOP 15GB 기본(밀리의서재)' },
  { value: '29700', label: '29,700 TOP 15GB 100분(밀리의서재)', name: 'TOP 15GB 100분(밀리의서재)' },
  { value: '38500', label: '38,500 TOP 11GB 기본(밀리의서재)', name: 'TOP 11GB 기본(밀리의서재)' },
];

// 필드 위치 설정 (A4 픽셀 좌표 기준) - 좌표 확인 모드로 조정 필요
const FIELD_POSITIONS: FieldPosition[] = [
  // 1. 고객명 (위치 1)
  {
    id: 'name1',
    page: 1,
    top: 154,
    left: 183,
    width: 237,
    height: 28,
    fontSize: 16,
  },
  // 2. 고객명 (위치 2)
  { id: 'name2', page: 1, top: 293, left: 258, width: 179, height: 27, fontSize: 16 },
  // 3. 생년월일 (위치 1)
  { id: 'birthDate1', page: 1, top: 154, left: 575, width: 188, height: 28, fontSize: 14 },
  // 4. 생년월일 (위치 2)
  { id: 'birthDate2', page: 1, top: 293, left: 566, width: 197, height: 28, fontSize: 14 },
  // 5. 요금제
  { id: 'plan', page: 1, top: 182, left: 180, width: 239, height: 28, fontSize: 14 },
  // 6. 주소
  { id: 'address', page: 1, top: 208, left: 182, width: 289, height: 30, fontSize: 12 },
  // 7. 유심번호
  { id: 'usimNumber', page: 1, top: 236, left: 183, width: 235, height: 29, fontSize: 14 },
  // 8. 은행명
  { id: 'bank', page: 1, top: 320, left: 264, width: 162, height: 28, fontSize: 14 },
  // 9. 계좌번호
  { id: 'accountNumber', page: 1, top: 321, left: 528, width: 180, height: 28, fontSize: 14 },
  // 10. 신청일자
  { id: 'signDate', page: 1, top: 1022, left: 350, width: 139, height: 18, fontSize: 12 },
  // 11. 선호번호1
  { id: 'wishNumber1', page: 1, top: 264, left: 216, width: 86, height: 28, fontSize: 14 },
  // 12. 선호번호2
  { id: 'wishNumber2', page: 1, top: 264, left: 320, width: 98, height: 28, fontSize: 14 },
];

interface FormData {
  name: string;
  birthDate: string;
  plan: string;
  address: string;
  usimNumber: string;
  bank: string;
  accountNumber: string;
  signDate: string;
  wishNumber1: string;
  wishNumber2: string;
}

export default function KTTheOnePage() {
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
    plan: '',
    address: '인천광역시 부평구 광장로 16 1층 10호 미얀골',
    usimNumber: '',
    bank: '',
    accountNumber: '',
    signDate: todayFormatted,
    wishNumber1: '',
    wishNumber2: '',
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
      name: '',
      birthDate: '',
      plan: '',
      address: '인천광역시 부평구 광장로 16 1층 10호 미얀골',
      usimNumber: '',
      bank: '',
      accountNumber: '',
      signDate: todayFormatted,
      wishNumber1: '',
      wishNumber2: '',
    });
  };

  // 신청일자 포맷팅 (YYYY.MM.DD -> YYYY    MM    DD)
  const formatSignDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(9)}${parts[1]}${nbsp.repeat(10)}${parts[2]}`;
    }
    return date;
  };

  // 선택된 요금제 이름 가져오기
  const getSelectedPlanName = () => {
    const selected = PLAN_OPTIONS.find((p) => p.value === formData.plan);
    return selected ? selected.name : '';
  };

  const fieldValues: FieldValue = {
    name1: formData.name,
    name2: formData.name,
    birthDate1: formData.birthDate,
    birthDate2: formData.birthDate,
    plan: getSelectedPlanName(),
    address: formData.address,
    usimNumber: formData.usimNumber,
    bank: formData.bank,
    accountNumber: formData.accountNumber,
    signDate: formatSignDate(formData.signDate),
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="KT 더원 신규" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="w-[600px] border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청서 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* 가입고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">가입고객정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="고객명 입력" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">
                          생년월일 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber1">선호번호 1</Label>
                          <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="예: 1234" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wishNumber2">선호번호 2</Label>
                          <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="예: 5678" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 요금제 선택 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">요금제 선택</p>
                      <div className="space-y-2">
                        <Label htmlFor="plan">
                          요금제 <span className="text-destructive">*</span>
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

                    {/* 주소 및 유심 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">추가 정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <Input id="address" name="address" value={formData.address} onChange={handleChange} placeholder="주소 입력" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="usimNumber">유심번호</Label>
                        <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="유심번호 입력" />
                      </div>
                    </div>

                    <Separator />

                    {/* 계좌 정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">계좌 정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank">은행명</Label>
                          <Input id="bank" name="bank" value={formData.bank} onChange={handleChange} placeholder="은행명 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountNumber">계좌번호</Label>
                          <Input id="accountNumber" name="accountNumber" value={formData.accountNumber} onChange={handleChange} placeholder="계좌번호 입력" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청일자 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">신청일자</p>
                      <div className="space-y-2">
                        <Label htmlFor="signDate">신청일자</Label>
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
                <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 인쇄 모달 */}
      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} />
    </>
  );
}
