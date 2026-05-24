import { useState, useRef, type ChangeEvent } from 'react';
import ImageViewer, { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';
import { usePreviewScale } from '@/hooks/use-preview-scale';
import PrintModal from '@/components/PrintModal/PrintModal';
import PageHeader from '@/components/Layout/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import DateInput from '@/components/Form/DateInput';
import asiaImage from '@/assets/templates/asia_mobile_img.jpg';

// PDF를 이미지로 변환한 파일
const PAGE_IMAGES = [asiaImage];

// A4 용지 크기 (96dpi 기준: 794 x 1123 px)
// 필드 위치 설정 (A4 픽셀 좌표 기준)
const FIELD_POSITIONS: FieldPosition[] = [
  // 1. 가입고객정보
  { id: 'name', page: 1, top: 128, left: 208, width: 210, height: 45, fontSize: 18 },
  { id: 'birthAndPassport', page: 1, top: 128, left: 588, width: 190, height: 45, fontSize: 14 },
  // 2. USIM 정보
  { id: 'usimNumber', page: 1, top: 312, left: 208, width: 210, height: 45, fontSize: 14 },
  // 3. 선호번호
  { id: 'wishNumber1', page: 1, top: 280, left: 240, width: 70, height: 34, fontSize: 14 },
  { id: 'wishNumber2', page: 1, top: 280, left: 340, width: 70, height: 34, fontSize: 14 },
  // 4. 서명일자
  {
    id: 'signDate',
    page: 1,
    top: 1052,
    left: 600,
    height: 30,
    fontSize: 14,
  },
];

interface FormData {
  name: string;
  birthDate: string;
  passportNumber: string;
  usimNumber: string;
  wishNumber1: string;
  wishNumber2: string;
  signDate: string;
}

interface BulkRecord {
  usimNumber: string;
  birthDate: string;
  passportNumber: string;
}

export default function KTAsiaPage() {
  // 오늘 날짜 (YYYY.MM.DD 형식)
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [hideNameOnPrint, setHideNameOnPrint] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [bulkRecords, setBulkRecords] = useState<BulkRecord[]>([]);
  const [bulkError, setBulkError] = useState('');
  const [useBatchPreview, setUseBatchPreview] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    birthDate: '',
    passportNumber: '',
    usimNumber: '',
    wishNumber1: '',
    wishNumber2: '',
    signDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'name' || name === 'passportNumber' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePrint = () => {
    setUseBatchPreview(false);
    setShowPrintModal(true);
  };

  const parseBulkInput = () => {
    const lines = bulkInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length === 0) {
      setBulkRecords([]);
      setBulkError('대량 출력용 데이터를 먼저 붙여넣어 주세요.');
      return;
    }

    const records: BulkRecord[] = [];

    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      const match = line.match(/^(.*)\s+(\d{6})\s+([A-Za-z0-9]+)$/);

      if (!match) {
        setBulkError(`${i + 1}번째 줄 형식이 올바르지 않습니다. (유심 생년월일 여권번호)`);
        setBulkRecords([]);
        return;
      }

      const usimNumber = match[1].trim().toUpperCase();
      const birthDate = match[2];
      const passportNumber = match[3].toUpperCase();

      const usimDigitsLength = usimNumber.replace(/\s+/g, '').length;
      if (usimDigitsLength < 10) {
        setBulkError(`${i + 1}번째 줄 유심번호가 너무 짧습니다.`);
        setBulkRecords([]);
        return;
      }

      records.push({ usimNumber, birthDate, passportNumber });
    }

    setBulkError('');
    setBulkRecords(records);
  };

  const loadFirstBulkRecord = () => {
    if (bulkRecords.length === 0) {
      return;
    }

    const first = bulkRecords[0];
    setFormData((prev) => ({
      ...prev,
      usimNumber: first.usimNumber,
      birthDate: first.birthDate,
      passportNumber: first.passportNumber,
    }));
  };

  const handleBatchPrint = () => {
    if (bulkRecords.length === 0) {
      setBulkError('대량 출력할 데이터가 없습니다. 먼저 분석 버튼을 눌러 주세요.');
      return;
    }

    setUseBatchPreview(true);
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      birthDate: '',
      passportNumber: '',
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
      return `${parts[0]}${nbsp.repeat(7)}${parts[1]}${nbsp.repeat(7)}${parts[2]}`;
    }
    return date;
  };

  const fieldValues: FieldValue = {
    name: hideNameOnPrint ? '' : formData.name,
    birthAndPassport: `${formData.birthDate}\n${formData.passportNumber}`,
    usimNumber: formData.usimNumber,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    signDate: formatSignDate(formData.signDate),
  };

  const batchFieldValues: FieldValue[] = bulkRecords.map((record) => ({
    name: hideNameOnPrint ? '' : formData.name,
    birthAndPassport: `${record.birthDate}\n${record.passportNumber}`,
    usimNumber: record.usimNumber,
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    signDate: formatSignDate(formData.signDate),
  }));

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="선불 KT 아시아" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

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
                        <div className="flex items-center justify-between">
                          <Label htmlFor="name">
                            이름 (법인명) <span className="text-destructive">*</span>
                          </Label>
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={hideNameOnPrint} onChange={(e) => setHideNameOnPrint(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                            <span className="text-muted-foreground">출력 제외</span>
                          </label>
                        </div>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="'웰'은 비우기 (손글씨)" />
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
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="usimNumber">
                          USIM 일련번호 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="usimNumber" name="usimNumber" value={formData.usimNumber} onChange={handleChange} placeholder="89820000000000000000" />
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

                    {/* 대량 출력 */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">대량 출력</p>
                        <span className="text-xs text-muted-foreground">형식: 유심번호 생년월일(6자리) 여권번호</span>
                      </div>
                      <textarea
                        value={bulkInput}
                        onChange={(e) => setBulkInput(e.target.value)}
                        placeholder="예) 8982 3004 2500 9466 415F 070420 MK572633"
                        className="w-full min-h-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={parseBulkInput}>
                          붙여넣기 분석
                        </Button>
                        <Button type="button" variant="outline" onClick={loadFirstBulkRecord} disabled={bulkRecords.length === 0}>
                          1건 폼에 반영
                        </Button>
                        <Button type="button" onClick={handleBatchPrint} disabled={bulkRecords.length === 0}>
                          대량 출력 미리보기
                        </Button>
                      </div>
                      {bulkError && <p className="text-xs text-destructive">{bulkError}</p>}
                      {!bulkError && bulkRecords.length > 0 && <p className="text-xs text-muted-foreground">총 {bulkRecords.length}건 준비됨 (인쇄 버튼 1회로 전체 출력)</p>}
                    </div>

                    <Separator />

                    {/* 서명일자 */}
                    <div className="space-y-4">
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
                <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* 인쇄 모달 */}
      <PrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        images={PAGE_IMAGES}
        fieldPositions={FIELD_POSITIONS}
        fieldValues={fieldValues}
        batchFieldValues={useBatchPreview ? batchFieldValues : undefined}
      />
    </>
  );
}
