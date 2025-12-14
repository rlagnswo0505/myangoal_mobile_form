import { type ChangeEvent, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

/**
 * 휴대폰번호 입력 컴포넌트
 * 자동으로 010-XXXX-XXXX 형식으로 포맷팅
 */
export default function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // 숫자와 하이픈만 허용
    input = input.replace(/[^0-9-]/g, '');

    // 하이픈 제거 후 숫자만 추출
    const numbers = input.replace(/-/g, '');

    // 최대 11자리 (010XXXXXXXX)
    const limited = numbers.slice(0, 11);

    // 자동 포맷팅: 010-XXXX-XXXX
    let formatted = '';
    if (limited.length <= 3) {
      formatted = limited;
    } else if (limited.length <= 7) {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      formatted = `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }

    onChange(formatted);
  };

  return <Input {...props} value={value} onChange={handleChange} placeholder={props.placeholder || '010-1234-5678'} maxLength={13} />;
}

/**
 * 휴대폰번호에서 010을 제외하고 XXXX    XXXX 형식으로 변환 (넓은 간격)
 */
export function formatPhoneForDisplay(phone: string): string {
  const numbers = phone.replace(/[^0-9]/g, '');
  // 010 제외한 나머지 8자리
  const remaining = numbers.slice(3);
  if (remaining.length <= 4) {
    return remaining;
  }
  const nbsp = '\u00A0';
  return `${remaining.slice(0, 4)}${nbsp.repeat(4)}${remaining.slice(4)}`;
}

/**
 * 휴대폰번호를 010-0000-0000 형식으로 변환
 */
export function formatPhoneWithDash(phone: string): string {
  const numbers = phone.replace(/[^0-9]/g, '');
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}
