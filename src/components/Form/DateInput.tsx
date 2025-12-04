import { type ChangeEvent, type InputHTMLAttributes } from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** 6자리(YYMMDD) 또는 8자리(YYYYMMDD) 형식 선택 */
  format?: '6' | '8';
}

/**
 * 날짜 입력 컴포넌트
 * format='6': YY.MM.DD (6자리)
 * format='8': YYYY.MM.DD (8자리, 기본값)
 */
export default function DateInput({ value, onChange, format = '8', ...props }: DateInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // 숫자와 점만 허용
    input = input.replace(/[^0-9.]/g, '');

    // 점 제거 후 숫자만 추출
    const numbers = input.replace(/\./g, '');

    if (format === '6') {
      // 6자리 형식 (YYMMDD) - 점 없이
      const limited = numbers.slice(0, 6);
      onChange(limited);
    } else {
      // 8자리 형식 (YYYYMMDD -> YYYY.MM.DD)
      const limited = numbers.slice(0, 8);
      let formatted = '';
      if (limited.length <= 4) {
        formatted = limited;
      } else if (limited.length <= 6) {
        formatted = `${limited.slice(0, 4)}.${limited.slice(4)}`;
      } else {
        formatted = `${limited.slice(0, 4)}.${limited.slice(4, 6)}.${limited.slice(6)}`;
      }
      onChange(formatted);
    }
  };

  const placeholder = format === '6' ? 'YYMMDD' : 'YYYY.MM.DD';
  const maxLen = format === '6' ? 6 : 10;

  return <Input {...props} value={value} onChange={handleChange} placeholder={props.placeholder || placeholder} maxLength={maxLen} />;
}
