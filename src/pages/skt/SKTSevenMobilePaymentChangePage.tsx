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
import DateInput from '@/components/Form/DateInput';
import PhoneInput from '@/components/Form/PhoneInput';
import sevenMobileImage from '@/assets/templates/세븐모바일 납부변경.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [sevenMobileImage];

// 필드 위치 설정 (debugMode로 좌표 조정)
const FIELD_POSITIONS: FieldPosition[] = [
  // 고객명 (2곳에 표시)
  { id: 'customerName1', page: 1, top: 133, left: 263, width: 204, height: 24, fontSize: 14 },
  { id: 'customerName2', page: 1, top: 575, left: 546, width: 207, height: 23, fontSize: 14 },
  // 휴대폰번호
  { id: 'phoneNumber', page: 1, top: 131, left: 613, width: 140, height: 24, fontSize: 14 },
  // 생년월일 (2곳에 표시)
  { id: 'birthDate1', page: 1, top: 155, left: 270, width: 196, height: 24, fontSize: 14 },
  { id: 'birthDate2', page: 1, top: 618, left: 404, width: 227, height: 24, fontSize: 14 },
  // 카드사
  { id: 'cardCompany', page: 1, top: 575, left: 331, width: 137, height: 24, fontSize: 14 },
  // 카드번호
  { id: 'cardNumber', page: 1, top: 597, left: 324, width: 264, height: 21, fontSize: 14 },
  // 카드 유효기간
  { id: 'cardExpiry', page: 1, top: 596, left: 666, width: 60, height: 22, fontSize: 14 },
  // 신청일자
  { id: 'applicationDate', page: 1, top: 959, left: 230, width: 201, height: 24, fontSize: 14 },
];

interface FormData {
  customerName: string;
  birthDate: string;
  phoneNumber: string;
  cardCompany: string;
  cardNumber: string;
  cardExpiry: string;
  applicationDate: string;
}

/** YYMMDD → Y Y Y Y M M D D 변환 (50 이상이면 19XX, 미만이면 20XX) */
function convertToFullYear(yymmdd: string): string {
  if (yymmdd.length !== 6) return yymmdd;
  const yy = parseInt(yymmdd.slice(0, 2), 10);
  const prefix = yy >= 50 ? '19' : '20';
  const full = `${prefix}${yymmdd}`;
  const nbsp = '\u00A0';
  return full.split('').join(nbsp.repeat(5));
}

export default function SKTSevenMobilePaymentChangePage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    birthDate: '',
    phoneNumber: '',
    cardCompany: '삼성카드',
    cardNumber: '',
    cardExpiry: '',
    applicationDate: todayFormatted,
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const nextValue = name === 'customerName' ? value.toUpperCase() : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      birthDate: '',
      phoneNumber: '',
      cardCompany: '삼성카드',
      cardNumber: '',
      cardExpiry: '',
      applicationDate: todayFormatted,
    });
  };

  // 신청날짜 포맷팅 (2025.12.02 -> 2025        12        02)
  const formatApplicationDate = (date: string) => {
    const parts = date.split('.');
    if (parts.length === 3) {
      const nbsp = '\u00A0';
      return `${parts[0]}${nbsp.repeat(16)}${parts[1]}${nbsp.repeat(18)}${parts[2]}`;
    }
    return date;
  };

  // 카드 유효기간 포맷팅 (2512 -> 25        12)
  const formatCardExpiry = (expiry: string) => {
    if (expiry.length === 4) {
      const yy = expiry.slice(0, 2);
      const mm = expiry.slice(2, 4);
      const nbsp = '\u00A0';
      return `${yy}${nbsp.repeat(6)}${mm}`;
    }
    return expiry;
  };

  // 생년월일: YYMMDD 입력 → YYYYMMDD로 변환해서 표시
  const birthDateDisplay = convertToFullYear(formData.birthDate);

  // 필드 값 매핑
  const fieldValues: FieldValue = {
    customerName1: formData.customerName,
    customerName2: formData.customerName,
    phoneNumber: formData.phoneNumber,
    birthDate1: birthDateDisplay,
    birthDate2: birthDateDisplay,
    cardCompany: formData.cardCompany,
    cardNumber: formData.cardNumber,
    cardExpiry: formatCardExpiry(formData.cardExpiry),
    applicationDate: formatApplicationDate(formData.applicationDate),
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="세븐모바일 납부변경" subtitle="SKT 세븐모바일 납부변경 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">납부변경 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 고객 기본정보 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="홍길동" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phoneNumber">
                            휴대폰번호 <span className="text-destructive">*</span>
                          </Label>
                          <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">
                            생년월일 (YYMMDD) <span className="text-destructive">*</span>
                          </Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                          {formData.birthDate.length === 6 && <p className="text-xs text-muted-foreground">→ {birthDateDisplay}</p>}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 카드 정보 */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardCompany">
                            카드사 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="cardCompany" name="cardCompany" value={formData.cardCompany} onChange={handleChange} placeholder="삼성카드" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardNumber">
                            카드번호 <span className="text-destructive">*</span>
                          </Label>
                          <Input id="cardNumber" name="cardNumber" value={formData.cardNumber} onChange={handleChange} placeholder="1234-5678-9012-3456" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardExpiry">
                            유효기간 (YYMM) <span className="text-destructive">*</span>
                          </Label>
                          <Input id="cardExpiry" name="cardExpiry" value={formData.cardExpiry} onChange={handleChange} placeholder="2512" maxLength={4} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청날짜 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="applicationDate">
                          신청일자 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="applicationDate" value={formData.applicationDate} onChange={(value) => setFormData((prev) => ({ ...prev, applicationDate: value }))} />
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
                {PAGE_IMAGES.length > 0 ? (
                  <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <p>템플릿 이미지를 추가해주세요</p>
                  </div>
                )}
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
