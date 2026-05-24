import { useRef, useState } from 'react';
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
import PhoneInput, { formatPhoneWithDash } from '@/components/Form/PhoneInput';
import limitedTransferImage from '@/assets/templates/제한기간이내 번호이동 신청서.jpg';

const PAGE_IMAGES: string[] = [limitedTransferImage];

type CarrierType = 'SKT' | 'KT' | 'LGU+' | '기타';

const FIELD_POSITIONS: FieldPosition[] = [
  { id: 'currentPhoneNumber', page: 1, top: 356, left: 352, width: 293, height: 32, fontSize: 14 },

  { id: 'currentCarrierSKT', page: 1, top: 392, left: 361, width: 11, height: 11, fontSize: 14 },
  { id: 'currentCarrierKT', page: 1, top: 392, left: 490, width: 11, height: 11, fontSize: 14 },
  { id: 'currentCarrierLGU', page: 1, top: 391, left: 621, width: 11, height: 11, fontSize: 14 },
  { id: 'currentCarrierOtherCheck', page: 1, top: 409, left: 360, width: 11, height: 11, fontSize: 14 },
  { id: 'currentCarrierOtherText', page: 1, top: 408, left: 514, width: 125, height: 14, fontSize: 13 },

  { id: 'desiredCarrierSKT', page: 1, top: 426, left: 361, width: 11, height: 11, fontSize: 14 },
  { id: 'desiredCarrierKT', page: 1, top: 426, left: 490, width: 11, height: 11, fontSize: 14 },
  { id: 'desiredCarrierLGU', page: 1, top: 426, left: 621, width: 11, height: 11, fontSize: 14 },
  { id: 'desiredCarrierOtherCheck', page: 1, top: 444, left: 360, width: 11, height: 11, fontSize: 14 },
  { id: 'desiredCarrierOtherText', page: 1, top: 442, left: 511, width: 125, height: 15, fontSize: 13 },

  { id: 'customerName', page: 1, top: 458, left: 358, width: 270, height: 30, fontSize: 14 },
  { id: 'birthDate', page: 1, top: 487, left: 360, width: 270, height: 30, fontSize: 14 },

  { id: 'dateYY', page: 1, top: 735, left: 339, width: 14, height: 15, fontSize: 14 },
  { id: 'dateMM', page: 1, top: 735, left: 380, width: 20, height: 15, fontSize: 14 },
  { id: 'dateDD', page: 1, top: 735, left: 430, width: 20, height: 15, fontSize: 14 },
];

interface FormData {
  currentPhoneNumber: string;
  currentCarrier: CarrierType;
  currentCarrierOther: string;
  desiredCarrier: CarrierType;
  desiredCarrierOther: string;
  customerName: string;
  birthDate: string;
  applicationDate: string;
}

const getTodayDate = () => {
  const now = new Date();
  return `${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
};

export default function LimitedTransferWithinPeriodPage() {
  const today = getTodayDate();

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    currentPhoneNumber: '',
    currentCarrier: 'SKT',
    currentCarrierOther: '',
    desiredCarrier: 'KT',
    desiredCarrierOther: '',
    customerName: '',
    birthDate: '',
    applicationDate: today,
  });

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    const nextToday = getTodayDate();
    setFormData({
      currentPhoneNumber: '',
      currentCarrier: 'SKT',
      currentCarrierOther: '',
      desiredCarrier: 'KT',
      desiredCarrierOther: '',
      customerName: '',
      birthDate: '',
      applicationDate: nextToday,
    });
  };

  const dateYY = formData.applicationDate.slice(0, 2);
  const dateMM = formData.applicationDate.slice(2, 4);
  const dateDD = formData.applicationDate.slice(4, 6);

  const fieldValues: FieldValue = {
    currentPhoneNumber: formatPhoneWithDash(formData.currentPhoneNumber),

    currentCarrierSKT: formData.currentCarrier === 'SKT' ? '✓' : '',
    currentCarrierKT: formData.currentCarrier === 'KT' ? '✓' : '',
    currentCarrierLGU: formData.currentCarrier === 'LGU+' ? '✓' : '',
    currentCarrierOtherCheck: formData.currentCarrier === '기타' ? '✓' : '',
    currentCarrierOtherText: formData.currentCarrier === '기타' ? formData.currentCarrierOther : '',

    desiredCarrierSKT: formData.desiredCarrier === 'SKT' ? '✓' : '',
    desiredCarrierKT: formData.desiredCarrier === 'KT' ? '✓' : '',
    desiredCarrierLGU: formData.desiredCarrier === 'LGU+' ? '✓' : '',
    desiredCarrierOtherCheck: formData.desiredCarrier === '기타' ? '✓' : '',
    desiredCarrierOtherText: formData.desiredCarrier === '기타' ? formData.desiredCarrierOther : '',

    customerName: formData.customerName,
    birthDate: formData.birthDate,
    dateYY,
    dateMM,
    dateDD,
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="제한기간내 번호이동" subtitle="제한기간이내 번호이동 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[600px] border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPhoneNumber">
                          사용중인 이동전화번호 <span className="text-destructive">*</span>
                        </Label>
                        <PhoneInput id="currentPhoneNumber" value={formData.currentPhoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, currentPhoneNumber: value }))} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-3">
                        <Label>
                          사용중인 통신회사 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.currentCarrier} onValueChange={(value) => setFormData((prev) => ({ ...prev, currentCarrier: value as CarrierType }))} className="grid grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SKT" id="current-carrier-skt" />
                            <Label htmlFor="current-carrier-skt" className="font-normal cursor-pointer">
                              SKT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="KT" id="current-carrier-kt" />
                            <Label htmlFor="current-carrier-kt" className="font-normal cursor-pointer">
                              KT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LGU+" id="current-carrier-lgu" />
                            <Label htmlFor="current-carrier-lgu" className="font-normal cursor-pointer">
                              LGU+
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="기타" id="current-carrier-other" />
                            <Label htmlFor="current-carrier-other" className="font-normal cursor-pointer">
                              기타
                            </Label>
                          </div>
                        </RadioGroup>
                        {formData.currentCarrier === '기타' && <Input value={formData.currentCarrierOther} onChange={(e) => setFormData((prev) => ({ ...prev, currentCarrierOther: e.target.value }))} placeholder="통신회사명 입력" />}
                      </div>

                      <div className="space-y-3">
                        <Label>
                          이동희망 통신회사 <span className="text-destructive">*</span>
                        </Label>
                        <RadioGroup value={formData.desiredCarrier} onValueChange={(value) => setFormData((prev) => ({ ...prev, desiredCarrier: value as CarrierType }))} className="grid grid-cols-4 gap-3">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SKT" id="desired-carrier-skt" />
                            <Label htmlFor="desired-carrier-skt" className="font-normal cursor-pointer">
                              SKT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="KT" id="desired-carrier-kt" />
                            <Label htmlFor="desired-carrier-kt" className="font-normal cursor-pointer">
                              KT
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LGU+" id="desired-carrier-lgu" />
                            <Label htmlFor="desired-carrier-lgu" className="font-normal cursor-pointer">
                              LGU+
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="기타" id="desired-carrier-other" />
                            <Label htmlFor="desired-carrier-other" className="font-normal cursor-pointer">
                              기타
                            </Label>
                          </div>
                        </RadioGroup>
                        {formData.desiredCarrier === '기타' && <Input value={formData.desiredCarrierOther} onChange={(e) => setFormData((prev) => ({ ...prev, desiredCarrierOther: e.target.value }))} placeholder="통신회사명 입력" />}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">
                          고객명 <span className="text-destructive">*</span>
                        </Label>
                        <Input id="customerName" value={formData.customerName} onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value.toUpperCase() }))} placeholder="고객명 입력" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="birthDate">
                          생년월일 <span className="text-destructive">*</span>
                        </Label>
                        <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <Label>
                        날짜 (YYMMDD) <span className="text-destructive">*</span>
                      </Label>
                      <DateInput id="applicationDate" format="6" value={formData.applicationDate} onChange={(value) => setFormData((prev) => ({ ...prev, applicationDate: value }))} placeholder="YYMMDD" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </div>

          <div ref={previewRef} className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div>
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

      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} />
    </>
  );
}
