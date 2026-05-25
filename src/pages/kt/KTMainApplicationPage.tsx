import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import ImageViewer, { type FieldPosition, type FieldValue } from '@/components/PDFPreview/ImageViewer';
import { usePreviewScale } from '@/hooks/use-preview-scale';
import PrintModal from '@/components/PrintModal/PrintModal';
import PageHeader from '@/components/Layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import DateInput from '@/components/Form/DateInput';
import AddressInput from '@/components/Form/AddressInput';
import ktFormPage1 from '@/assets/templates/KT 신청서-1.jpg';
import ktFormPage2 from '@/assets/templates/KT 신청서-2.jpg';
import ktFormPage3 from '@/assets/templates/KT 신청서-3.jpg';
import ktFormPage4 from '@/assets/templates/KT 신청서-4.jpg';

const PAGE_IMAGES: string[] = [ktFormPage1, ktFormPage2, ktFormPage3, ktFormPage4];

const FIELD_POSITIONS: FieldPosition[] = [
  { id: 'customerName', page: 1, top: 150, left: 152, width: 230, height: 28, fontSize: 15 },
  { id: 'birthDate', page: 1, top: 150, left: 474, width: 150, height: 28, fontSize: 14 },
  { id: 'genderMale', page: 1, top: 183, left: 156, width: 20, height: 20, fontSize: 16 },
  { id: 'genderFemale', page: 1, top: 183, left: 214, width: 20, height: 20, fontSize: 16 },
  { id: 'phoneNumber', page: 1, top: 214, left: 152, width: 210, height: 28, fontSize: 14 },
  { id: 'address', page: 1, top: 243, left: 152, width: 450, height: 28, fontSize: 12 },

  { id: 'mainLineNumber', page: 2, top: 145, left: 153, width: 220, height: 28, fontSize: 14 },
  { id: 'subLineNumber', page: 2, top: 145, left: 443, width: 220, height: 28, fontSize: 14 },
  { id: 'payerName', page: 2, top: 176, left: 153, width: 240, height: 28, fontSize: 14 },

  { id: 'bankOrCard', page: 3, top: 145, left: 153, width: 180, height: 28, fontSize: 14 },
  { id: 'accountOrCardNumber', page: 3, top: 145, left: 386, width: 265, height: 28, fontSize: 14 },
  { id: 'payerName2', page: 3, top: 176, left: 153, width: 240, height: 28, fontSize: 14 },

  { id: 'signature', page: 4, top: 924, left: 155, width: 220, height: 36, fontSize: 18 },
];

interface FormData {
  customerName: string;
  birthDate: string;
  gender: 'male' | 'female';
  phoneNumber: string;
  address: string;
  mainLineNumber: string;
  subLineNumber: string;
  payerName: string;
  bankOrCard: string;
  accountOrCardNumber: string;
  signature: string;
}

const SIGNATURE_STORAGE_KEY = 'kt-main-application-signature';

export default function KTMainApplicationPage() {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;

  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [rememberSignature, setRememberSignature] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    customerName: '',
    birthDate: '',
    gender: 'male',
    phoneNumber: '',
    address: '',
    mainLineNumber: '',
    subLineNumber: '',
    payerName: '',
    bankOrCard: '',
    accountOrCardNumber: '',
    signature: '',
  });

  useEffect(() => {
    const savedSignature = localStorage.getItem(SIGNATURE_STORAGE_KEY);
    if (savedSignature) {
      setFormData((prev) => ({ ...prev, signature: savedSignature }));
      setRememberSignature(true);
    }
  }, []);

  useEffect(() => {
    if (rememberSignature && formData.signature) {
      localStorage.setItem(SIGNATURE_STORAGE_KEY, formData.signature);
    }
  }, [formData.signature, rememberSignature]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      birthDate: '',
      gender: 'male',
      phoneNumber: '',
      address: '',
      mainLineNumber: '',
      subLineNumber: '',
      payerName: '',
      bankOrCard: '',
      accountOrCardNumber: '',
      signature: '',
    });
    setRememberSignature(false);
    localStorage.removeItem(SIGNATURE_STORAGE_KEY);
  };

  const fieldValues: FieldValue = {
    customerName: formData.customerName,
    birthDate: formData.birthDate,
    genderMale: formData.gender === 'male' ? '✓' : '',
    genderFemale: formData.gender === 'female' ? '✓' : '',
    phoneNumber: formData.phoneNumber,
    address: formData.address,
    mainLineNumber: formData.mainLineNumber,
    subLineNumber: formData.subLineNumber,
    payerName: formData.payerName,
    payerName2: formData.payerName,
    bankOrCard: formData.bankOrCard,
    accountOrCardNumber: formData.accountOrCardNumber,
    signature: formData.signature,
    signDate: todayFormatted,
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="메인 KT 신청" subtitle="이동전화 서비스 신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[600px] border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청서 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객 정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="customerName">고객명</Label>
                        <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleChange} placeholder="고객명 입력" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">생년월일</Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={(value) => setFormData((prev) => ({ ...prev, birthDate: value }))} />
                        </div>
                        <div className="space-y-2">
                          <Label>성별</Label>
                          <RadioGroup value={formData.gender} onValueChange={(value) => setFormData((prev) => ({ ...prev, gender: value as FormData['gender'] }))} className="flex gap-4 pt-2">
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="male" id="gender-male" />
                              <Label htmlFor="gender-male" className="font-normal cursor-pointer">
                                남
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="female" id="gender-female" />
                              <Label htmlFor="gender-female" className="font-normal cursor-pointer">
                                여
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">핸드폰번호</Label>
                        <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="010-1234-5678" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <AddressInput id="address" value={formData.address} onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">회선 정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="mainLineNumber">모회선번호</Label>
                          <Input id="mainLineNumber" name="mainLineNumber" value={formData.mainLineNumber} onChange={handleChange} placeholder="모회선번호 입력" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subLineNumber">자회선번호</Label>
                          <Input id="subLineNumber" name="subLineNumber" value={formData.subLineNumber} onChange={handleChange} placeholder="자회선번호 입력" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">납부 정보</p>
                      <div className="space-y-2">
                        <Label htmlFor="payerName">예금주 / 카드주</Label>
                        <Input id="payerName" name="payerName" value={formData.payerName} onChange={handleChange} placeholder="예금주 또는 카드주 입력" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bankOrCard">은행 / 카드사</Label>
                          <Input id="bankOrCard" name="bankOrCard" value={formData.bankOrCard} onChange={handleChange} placeholder="은행 또는 카드사" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountOrCardNumber">계좌 / 카드번호</Label>
                          <Input id="accountOrCardNumber" name="accountOrCardNumber" value={formData.accountOrCardNumber} onChange={handleChange} placeholder="계좌 또는 카드번호" />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">고객 서명</p>
                      <div className="space-y-2">
                        <Label htmlFor="signature">사인 저장 후 계속 사용</Label>
                        <Input id="signature" name="signature" value={formData.signature} onChange={handleChange} placeholder="고객 서명 또는 이름 입력" />
                      </div>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={rememberSignature} onChange={(e) => setRememberSignature(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
                        <span className="text-muted-foreground">서명 저장 후 계속 사용</span>
                      </label>
                      <p className="text-xs text-muted-foreground">저장된 서명은 다음에 이 페이지를 열어도 자동으로 불러옵니다.</p>
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
                <ImageViewer images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} scale={scale} debugMode={debugMode} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      <PrintModal isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} images={PAGE_IMAGES} fieldPositions={FIELD_POSITIONS} fieldValues={fieldValues} />
    </>
  );
}