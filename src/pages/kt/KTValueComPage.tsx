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
import PhoneInput, { formatPhoneForDisplay } from '@/components/Form/PhoneInput';
import AddressInput from '@/components/Form/AddressInput';
import valueComPage1 from '@/assets/templates/밸류컴_가입신청서_선불_251222_1.jpg';

// 템플릿 이미지
const PAGE_IMAGES: string[] = [valueComPage1];

// 제공망 체크 위치 (○LG U+ ○KT - 임시 좌표, debugMode로 조정 필요)
const NETWORK_POSITIONS: Record<'lgu' | 'kt', { top: number; left: number }> = {
  lgu: { top: 82, left: 65 },
  kt: { top: 82, left: 121 },
};

// 업무구분 체크 위치 (☐신규 ☐번호이동 ☐명의변경 ☐선후불전환 ☐기간연장 - 임시 좌표, debugMode로 조정 필요)
const TASK_TYPE_POSITIONS: Record<'new' | 'transfer' | 'nameChange' | 'prepaidPostpaidChange' | 'extension', { top: number; left: number }> = {
  new: { top: 74, left: 220 },
  transfer: { top: 75, left: 253 },
  nameChange: { top: 75, left: 302 },
  prepaidPostpaidChange: { top: 76, left: 349 },
  extension: { top: 76, left: 405 },
};

// 요금제(LG U+) 체크 위치 (밸류363/383/390/550/기타 - 임시 좌표, debugMode로 조정 필요)
const PLAN_LGU_POSITIONS: Record<'363' | '383' | '390' | '550' | 'other', { top: number; left: number }> = {
  '363': { top: 231, left: 534 },
  '383': { top: 231, left: 594 },
  '390': { top: 231, left: 655 },
  '550': { top: 232, left: 715 },
  other: { top: 250, left: 535 },
};

// 요금제(KT) 체크 위치 (밸류V36/V39/V59/기타 - 임시 좌표, debugMode로 조정 필요)
const PLAN_KT_POSITIONS: Record<'V36' | 'V39' | 'V59' | 'other', { top: number; left: number }> = {
  V36: { top: 272, left: 534 },
  V39: { top: 271, left: 595 },
  V59: { top: 272, left: 655 },
  other: { top: 291, left: 535 },
};

// 변경전통신사 체크 위치 (SKT/KT/LG U+/알뜰폰 - 임시 좌표, debugMode로 조정 필요)
const CARRIER_OPTIONS = [
  { value: 'skt', label: 'SKT' },
  { value: 'kt', label: 'KT' },
  { value: 'lgu', label: 'LG U+' },
  { value: 'mvno', label: '알뜰폰' },
];
const CARRIER_POSITIONS: Record<string, { top: number; left: number }> = {
  skt: { top: 409, left: 535 },
  kt: { top: 409, left: 573 },
  lgu: { top: 408, left: 605 },
  mvno: { top: 409, left: 647 },
};

// 필드 위치 설정 (임시 좌표 - debugMode로 실제 좌표 확인 후 조정 필요)
const BASE_FIELD_POSITIONS: FieldPosition[] = [
  // 가입고객정보
  { id: 'activationNumberDisplay', page: 1, top: 70, left: 519, width: 255, height: 25, fontSize: 11 },
  { id: 'customerName', page: 1, top: 112, left: 161, width: 246, height: 27, fontSize: 11 },
  { id: 'birthDate', page: 1, top: 112, left: 526, width: 247, height: 27, fontSize: 11 },
  { id: 'foreignerNumber', page: 1, top: 138, left: 527, width: 247, height: 28, fontSize: 10 },
  { id: 'phoneNumber', page: 1, top: 167, left: 161, width: 246, height: 26, fontSize: 11 },
  { id: 'address', page: 1, top: 192, left: 161, width: 613, height: 29, fontSize: 10 },
  // 가입단말정보
  { id: 'wishNumber1', page: 1, top: 224, left: 236, width: 79, height: 27, fontSize: 11 },
  { id: 'wishNumber2', page: 1, top: 226, left: 330, width: 77, height: 28, fontSize: 11 },
  { id: 'usimModelName', page: 1, top: 253, left: 161, width: 146, height: 25, fontSize: 9 },
  { id: 'usimSerialNumber', page: 1, top: 279, left: 163, width: 245, height: 28, fontSize: 9 },
  { id: 'planLGUOther', page: 1, top: 244, left: 600, width: 162, height: 22 },
  { id: 'planKTOther', page: 1, top: 285, left: 601, width: 161, height: 22, fontSize: 9 },
  // 번호이동정보
  { id: 'portInNumber', page: 1, top: 400, left: 161, width: 247, height: 27, fontSize: 10 },
  // 자동충전정보
  { id: 'accountHolderName', page: 1, top: 455, left: 161, width: 245, height: 28, fontSize: 11 },
  { id: 'accountHolderBirthDate', page: 1, top: 456, left: 526, width: 247, height: 28, fontSize: 11 },
  { id: 'accountOrCardNumber', page: 1, top: 485, left: 160, width: 244, height: 25, fontSize: 11 },
  { id: 'cardValidPeriod', page: 1, top: 485, left: 482, width: 104, height: 25, fontSize: 10 },
  { id: 'cardPinFirst2', page: 1, top: 483, left: 684, width: 89, height: 27, fontSize: 10 },
  // 명의변경
  { id: 'nameChangeCustomerName', page: 1, top: 568, left: 162, width: 245, height: 26, fontSize: 11 },
  { id: 'nameChangePhone', page: 1, top: 567, left: 528, width: 246, height: 28, fontSize: 11 },
  { id: 'nameChangeBirthDate', page: 1, top: 595, left: 163, width: 245, height: 27, fontSize: 11 },
  // 신청일
  { id: 'applicationYear', page: 1, top: 972, left: 109, width: 46, height: 28, fontSize: 11 },
  { id: 'applicationMonth', page: 1, top: 977, left: 192, width: 38, height: 21, fontSize: 11 },
  { id: 'applicationDay', page: 1, top: 977, left: 257, width: 38, height: 21, fontSize: 11 },
];

interface FormData {
  network: 'lgu' | 'kt';
  taskType: 'new' | 'transfer' | 'nameChange' | 'prepaidPostpaidChange' | 'extension';
  activationNumber: string;
  customerName: string;
  birthDate: string;
  foreignerNumber: string;
  phoneNumber: string;
  address: string;
  wishNumberRandom: boolean;
  wishNumber1: string;
  wishNumber2: string;
  usimModelName: string;
  usimStandalone: boolean;
  usimSerialNumber: string;
  planLGU: '363' | '383' | '390' | '550' | 'other' | '';
  planLGUOther: string;
  planKT: 'V36' | 'V39' | 'V59' | 'other' | '';
  planKTOther: string;
  portInNumber: string;
  prevCarrier: string;
  mvnoCarrierName: string;
  accountHolderName: string;
  accountHolderBirthDate: string;
  accountOrCardNumber: string;
  cardValidPeriod: string;
  cardPinFirst2: string;
  nameChangeCustomerName: string;
  nameChangePhone: string;
  nameChangeBirthDate: string;
  applicationDate: string;
}

// 신청일 기본값(오늘 날짜)을 포함한 초기값을 매번 새로 생성
const createInitialFormData = (): FormData => {
  const now = new Date();
  const todayFormatted = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
  return {
    network: 'kt',
    taskType: 'new',
    activationNumber: '',
    customerName: '',
    birthDate: '',
    foreignerNumber: '',
    phoneNumber: '010-4427-7675',
    address: '인천광역시 부평구 광장로 16 1층 10호 미얀골',
    wishNumberRandom: false,
    wishNumber1: '',
    wishNumber2: '',
    usimModelName: '',
    usimStandalone: false,
    usimSerialNumber: '',
    planLGU: '',
    planLGUOther: '',
    planKT: '',
    planKTOther: '',
    portInNumber: '',
    prevCarrier: '',
    mvnoCarrierName: '',
    accountHolderName: '',
    accountHolderBirthDate: '',
    accountOrCardNumber: '',
    cardValidPeriod: '',
    cardPinFirst2: '',
    nameChangeCustomerName: '',
    nameChangePhone: '',
    nameChangeBirthDate: '',
    applicationDate: todayFormatted,
  };
};

export default function KTValueComPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const scale = usePreviewScale(previewRef);

  const [debugMode, setDebugMode] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(createInitialFormData);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 고객명 입력 시 예금주명·명의변경 고객명도 함께 입력
  const handleCustomerNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData((prev) => ({ ...prev, customerName: value, accountHolderName: value, nameChangeCustomerName: value }));
  };

  // 생년월일 입력 시 예금주생년월일·명의변경 생년월일·외국인등록번호 앞자리도 함께 입력
  const handleBirthDateChange = (value: string) => {
    setFormData((prev) => ({ ...prev, birthDate: value, accountHolderBirthDate: value, nameChangeBirthDate: value, foreignerNumber: value ? `${value}-` : '' }));
  };

  // 개통번호 입력 시 번호이동 신청번호·명의변경 연락처도 함께 입력
  const handleActivationNumberChange = (value: string) => {
    setFormData((prev) => ({ ...prev, activationNumber: value, portInNumber: value, nameChangePhone: value }));
  };

  const handlePrint = () => {
    setShowPrintModal(true);
  };

  const resetForm = () => {
    setFormData(createInitialFormData());
  };

  const isTransfer = formData.taskType === 'transfer';

  const networkPos = NETWORK_POSITIONS[formData.network];
  const taskTypePos = TASK_TYPE_POSITIONS[formData.taskType];
  const planPos = formData.network === 'lgu' ? (formData.planLGU ? PLAN_LGU_POSITIONS[formData.planLGU] : null) : formData.planKT ? PLAN_KT_POSITIONS[formData.planKT] : null;
  const carrierPos = isTransfer && formData.prevCarrier ? CARRIER_POSITIONS[formData.prevCarrier] : null;

  const fieldPositions: FieldPosition[] = [
    ...BASE_FIELD_POSITIONS,
    { id: 'networkCheck', page: 1, top: networkPos.top, left: networkPos.left, fontSize: 12 },
    { id: 'taskTypeCheck', page: 1, top: taskTypePos.top, left: taskTypePos.left, fontSize: 12 },
    ...(formData.wishNumberRandom ? [{ id: 'wishNumberRandomCheck', page: 1, top: 236, left: 168, fontSize: 12 }] : []),
    ...(formData.usimStandalone ? [{ id: 'usimStandaloneCheck', page: 1, top: 261, left: 310, fontSize: 12 }] : []),
    ...(planPos ? [{ id: 'planCheck', page: 1, top: planPos.top, left: planPos.left, fontSize: 12 }] : []),
    ...(carrierPos ? [{ id: 'carrierCheck', page: 1, top: carrierPos.top, left: carrierPos.left, fontSize: 12 }] : []),
    ...(isTransfer && formData.prevCarrier === 'mvno' ? [{ id: 'mvnoCarrierName', page: 1, top: 402, left: 688, width: 86, height: 27, fontSize: 10 }] : []),
  ];

  const applicationDateParts = formData.applicationDate.split('.');

  const fieldValues: FieldValue = {
    networkCheck: '✓',
    taskTypeCheck: '✓',
    activationNumberDisplay: formData.taskType !== 'new' ? formatPhoneForDisplay(formData.activationNumber) : '',
    customerName: formData.customerName,
    birthDate: formData.birthDate,
    foreignerNumber: formData.foreignerNumber,
    phoneNumber: formData.phoneNumber,
    address: formData.address,
    wishNumberRandomCheck: formData.wishNumberRandom ? '✓' : '',
    wishNumber1: formData.wishNumber1,
    wishNumber2: formData.wishNumber2,
    usimModelName: formData.usimModelName,
    usimStandaloneCheck: formData.usimStandalone ? '✓' : '',
    usimSerialNumber: formData.usimSerialNumber,
    planCheck: planPos ? '✓' : '',
    planLGUOther: formData.network === 'lgu' && formData.planLGU === 'other' ? formData.planLGUOther : '',
    planKTOther: formData.network === 'kt' && formData.planKT === 'other' ? formData.planKTOther : '',
    portInNumber: isTransfer ? formData.portInNumber : '',
    carrierCheck: carrierPos ? '✓' : '',
    mvnoCarrierName: isTransfer && formData.prevCarrier === 'mvno' ? formData.mvnoCarrierName : '',
    accountHolderName: formData.accountHolderName,
    accountHolderBirthDate: formData.accountHolderBirthDate,
    accountOrCardNumber: formData.accountOrCardNumber,
    cardValidPeriod: formData.cardValidPeriod,
    cardPinFirst2: formData.cardPinFirst2,
    nameChangeCustomerName: formData.taskType === 'nameChange' ? formData.nameChangeCustomerName : '',
    nameChangePhone: formData.taskType === 'nameChange' ? formData.nameChangePhone : '',
    nameChangeBirthDate: formData.taskType === 'nameChange' ? formData.nameChangeBirthDate : '',
    applicationYear: applicationDateParts[0]?.slice(2) ?? '',
    applicationMonth: applicationDateParts[1] ?? '',
    applicationDay: applicationDateParts[2] ?? '',
  };

  return (
    <>
      <div className="no-print flex flex-col h-full">
        <PageHeader title="밸류컴 가입신청서" subtitle="밸류컴 선불이동전화 가입신청서" debugMode={debugMode} onDebugToggle={() => setDebugMode(!debugMode)} onPrint={handlePrint} onReset={resetForm} />

        {/* 메인 컨텐츠 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 입력 폼 */}
          <div className="flex-1 border-r bg-muted/30">
            <ScrollArea className="h-full">
              <div className="p-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">신청서 정보 입력</CardTitle>
                    <CardDescription>필수 정보를 입력하세요 (좌표는 추후 조정 예정)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* 제공망 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">제공망</p>
                      <RadioGroup value={formData.network} onValueChange={(value) => setFormData((prev) => ({ ...prev, network: value as FormData['network'] }))} className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="lgu" id="network-lgu" />
                          <Label htmlFor="network-lgu" className="font-normal cursor-pointer">
                            LG U+
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="kt" id="network-kt" />
                          <Label htmlFor="network-kt" className="font-normal cursor-pointer">
                            KT
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 업무구분 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">업무구분</p>
                      <RadioGroup value={formData.taskType} onValueChange={(value) => setFormData((prev) => ({ ...prev, taskType: value as FormData['taskType'] }))} className="flex flex-wrap gap-4">
                        {[
                          { value: 'new', label: '신규' },
                          { value: 'transfer', label: '번호이동' },
                          { value: 'nameChange', label: '명의변경' },
                          { value: 'prepaidPostpaidChange', label: '선후불전환' },
                          { value: 'extension', label: '기간연장' },
                        ].map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value} id={`task-${option.value}`} />
                            <Label htmlFor={`task-${option.value}`} className="font-normal cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* 가입고객정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">가입고객정보</p>
                      {formData.taskType !== 'new' && (
                        <div className="space-y-2">
                          <Label htmlFor="activationNumber">개통번호 (010-****-****)</Label>
                          <PhoneInput id="activationNumber" value={formData.activationNumber} onChange={handleActivationNumberChange} />
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="customerName">고객명</Label>
                          <Input id="customerName" name="customerName" value={formData.customerName} onChange={handleCustomerNameChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">생년월일</Label>
                          <DateInput id="birthDate" format="6" value={formData.birthDate} onChange={handleBirthDateChange} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="foreignerNumber">외국인등록(여권)번호</Label>
                        <Input id="foreignerNumber" name="foreignerNumber" value={formData.foreignerNumber} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">연락처</Label>
                        <PhoneInput id="phoneNumber" value={formData.phoneNumber} onChange={(value) => setFormData((prev) => ({ ...prev, phoneNumber: value }))} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">주소</Label>
                        <AddressInput id="address" value={formData.address} onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))} />
                      </div>
                    </div>

                    <Separator />

                    {/* 가입단말정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">가입단말정보</p>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
                          <input type="checkbox" checked={formData.wishNumberRandom} onChange={(e) => setFormData((prev) => ({ ...prev, wishNumberRandom: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
                          <span>희망번호 랜덤</span>
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="wishNumber1">희망번호 ①</Label>
                            <Input id="wishNumber1" name="wishNumber1" value={formData.wishNumber1} onChange={handleChange} placeholder="1234" maxLength={4} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="wishNumber2">희망번호 ②</Label>
                            <Input id="wishNumber2" name="wishNumber2" value={formData.wishNumber2} onChange={handleChange} placeholder="5678" maxLength={4} />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="usimModelName">USIM 모델명</Label>
                          <Input id="usimModelName" name="usimModelName" value={formData.usimModelName} onChange={handleChange} />
                        </div>
                        <div className="space-y-2 pt-6">
                          <label className="flex items-center gap-2 text-sm cursor-pointer w-fit">
                            <input type="checkbox" checked={formData.usimStandalone} onChange={(e) => setFormData((prev) => ({ ...prev, usimStandalone: e.target.checked }))} className="h-4 w-4 rounded border-gray-300" />
                            <span>USIM 단독개통</span>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="usimSerialNumber">USIM 일련번호</Label>
                        <Input id="usimSerialNumber" name="usimSerialNumber" value={formData.usimSerialNumber} onChange={handleChange} placeholder="8982000000000000000" />
                      </div>
                      <Separator />
                      {formData.network === 'lgu' ? (
                        <div className="space-y-2">
                          <Label>요금제 (LG U+)</Label>
                          <RadioGroup value={formData.planLGU} onValueChange={(value) => setFormData((prev) => ({ ...prev, planLGU: value as FormData['planLGU'] }))} className="flex flex-wrap gap-4">
                            {['363', '383', '390', '550'].map((plan) => (
                              <div key={plan} className="flex items-center space-x-2">
                                <RadioGroupItem value={plan} id={`plan-lgu-${plan}`} />
                                <Label htmlFor={`plan-lgu-${plan}`} className="font-normal cursor-pointer">
                                  밸류{plan}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="plan-lgu-other" />
                              <Label htmlFor="plan-lgu-other" className="font-normal cursor-pointer">
                                기타
                              </Label>
                            </div>
                          </RadioGroup>
                          {formData.planLGU === 'other' && <Input value={formData.planLGUOther} onChange={(e) => setFormData((prev) => ({ ...prev, planLGUOther: e.target.value }))} placeholder="기타 요금제명" />}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>요금제 (KT)</Label>
                          <RadioGroup value={formData.planKT} onValueChange={(value) => setFormData((prev) => ({ ...prev, planKT: value as FormData['planKT'] }))} className="flex flex-wrap gap-4">
                            {['V36', 'V39', 'V59'].map((plan) => (
                              <div key={plan} className="flex items-center space-x-2">
                                <RadioGroupItem value={plan} id={`plan-kt-${plan}`} />
                                <Label htmlFor={`plan-kt-${plan}`} className="font-normal cursor-pointer">
                                  밸류{plan}
                                </Label>
                              </div>
                            ))}
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="other" id="plan-kt-other" />
                              <Label htmlFor="plan-kt-other" className="font-normal cursor-pointer">
                                기타
                              </Label>
                            </div>
                          </RadioGroup>
                          {formData.planKT === 'other' && <Input value={formData.planKTOther} onChange={(e) => setFormData((prev) => ({ ...prev, planKTOther: e.target.value }))} placeholder="기타 요금제명" />}
                        </div>
                      )}
                    </div>

                    {isTransfer && (
                      <>
                        <Separator />
                        {/* 번호이동정보 */}
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">번호이동정보</p>
                          <div className="space-y-2">
                            <Label htmlFor="portInNumber">번호이동 신청번호</Label>
                            <Input id="portInNumber" name="portInNumber" value={formData.portInNumber} onChange={handleChange} placeholder="010-1234-5678" />
                          </div>
                          <div className="space-y-2">
                            <Label>변경전통신사</Label>
                            <RadioGroup value={formData.prevCarrier} onValueChange={(value) => setFormData((prev) => ({ ...prev, prevCarrier: value, mvnoCarrierName: value === 'mvno' ? prev.mvnoCarrierName : '' }))} className="flex flex-wrap gap-4">
                              {CARRIER_OPTIONS.map((option) => (
                                <div key={option.value} className="flex items-center space-x-2">
                                  <RadioGroupItem value={option.value} id={`carrier-${option.value}`} />
                                  <Label htmlFor={`carrier-${option.value}`} className="font-normal cursor-pointer">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                            {formData.prevCarrier === 'mvno' && (
                              <div className="space-y-2 pt-2">
                                <Label htmlFor="mvnoCarrierName">알뜰폰 통신사명</Label>
                                <Input id="mvnoCarrierName" name="mvnoCarrierName" value={formData.mvnoCarrierName} onChange={handleChange} placeholder="예: 프리티, 아이즈모바일 등" />
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {formData.taskType === 'nameChange' && (
                      <>
                        <Separator />
                        {/* 명의변경 */}
                        <div className="space-y-4">
                          <p className="text-sm font-medium text-muted-foreground">명의변경 (명의를 주는 고객)</p>
                          <p className="text-xs text-muted-foreground">기본값은 가입고객정보와 동일하며, 다를 경우 직접 수정하세요.</p>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="nameChangeCustomerName">고객명</Label>
                              <Input id="nameChangeCustomerName" name="nameChangeCustomerName" value={formData.nameChangeCustomerName} onChange={handleChange} placeholder="홍길동" />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="nameChangePhone">연락처</Label>
                              <PhoneInput id="nameChangePhone" value={formData.nameChangePhone} onChange={(value) => setFormData((prev) => ({ ...prev, nameChangePhone: value }))} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="nameChangeBirthDate">생년월일</Label>
                            <DateInput id="nameChangeBirthDate" format="6" value={formData.nameChangeBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, nameChangeBirthDate: value }))} />
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    {/* 자동충전정보 */}
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">자동충전정보</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderName">예금주</Label>
                          <Input id="accountHolderName" name="accountHolderName" value={formData.accountHolderName} onChange={handleChange} placeholder="홍길동" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="accountHolderBirthDate">예금주 생년월일</Label>
                          <DateInput id="accountHolderBirthDate" format="6" value={formData.accountHolderBirthDate} onChange={(value) => setFormData((prev) => ({ ...prev, accountHolderBirthDate: value }))} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="accountOrCardNumber">계좌(카드)번호</Label>
                        <Input id="accountOrCardNumber" name="accountOrCardNumber" value={formData.accountOrCardNumber} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cardValidPeriod">카드유효기간 (YYMM)</Label>
                          <Input id="cardValidPeriod" name="cardValidPeriod" value={formData.cardValidPeriod} onChange={handleChange} placeholder="2512" maxLength={4} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cardPinFirst2">카드비밀번호 앞2자리</Label>
                          <Input id="cardPinFirst2" name="cardPinFirst2" value={formData.cardPinFirst2} onChange={handleChange} placeholder="12" maxLength={2} />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* 신청일 */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="applicationDate">신청일</Label>
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
