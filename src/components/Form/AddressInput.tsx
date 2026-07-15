import { useState, useRef } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface AddressInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** 주소 검색 완료 시 도로명주소/지번주소를 함께 전달 (지번 기반 동/읍/면 등이 필요한 경우 사용) */
  onSelectAddress?: (data: { roadAddress: string; jibunAddress: string }) => void;
}

/**
 * 카카오 주소 검색 + 상세주소 입력 컴포넌트
 * - 주소 검색 버튼 클릭 시 카카오 주소 팝업 오픈
 * - 도로명주소 선택 후 상세주소 추가 입력
 * - 최종 결합된 주소를 onChange로 전달
 */
export default function AddressInput({ id, value, onChange, placeholder, onSelectAddress }: AddressInputProps) {
  const [roadAddress, setRoadAddress] = useState(() => value || '');
  const [detailAddress, setDetailAddress] = useState('');
  const detailRef = useRef<HTMLInputElement>(null);

  const open = useDaumPostcodePopup();

  const combine = (road: string, detail: string) => {
    return detail.trim() ? `${road} ${detail.trim()}` : road;
  };

  const handleSearch = () => {
    open({
      onComplete: (data) => {
        const address = data.roadAddress || data.jibunAddress;
        setRoadAddress(address);
        setDetailAddress('');
        onChange(address);
        onSelectAddress?.({ roadAddress: data.roadAddress, jibunAddress: data.jibunAddress });
        setTimeout(() => detailRef.current?.focus(), 0);
      },
    });
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const detail = e.target.value;
    setDetailAddress(detail);
    onChange(combine(roadAddress, detail));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          id={id}
          value={roadAddress}
          readOnly
          placeholder={placeholder || '주소 검색 버튼을 클릭하세요'}
          className="flex-1 bg-muted/50 cursor-pointer"
          onClick={handleSearch}
        />
        <Button type="button" variant="outline" size="sm" onClick={handleSearch} className="shrink-0 gap-1">
          <Search className="h-4 w-4" />
          검색
        </Button>
      </div>
      <Input
        ref={detailRef}
        value={detailAddress}
        onChange={handleDetailChange}
        placeholder="상세주소 입력 (동, 호수 등)"
        disabled={!roadAddress}
      />
    </div>
  );
}
