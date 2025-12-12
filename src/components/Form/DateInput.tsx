import { type ChangeEvent, type InputHTMLAttributes, useRef } from 'react';
import { Input } from '@/components/ui/input';

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** 6자리(YYMMDD) 또는 8자리(YYYYMMDD) 형식 선택 */
  format?: '6' | '8';
  /** 입력 완료 시 다음 필드로 이동할지 여부 */
  autoFocusNext?: boolean;
}

/**
 * 날짜 입력 컴포넌트
 * format='6': YY.MM.DD (6자리)
 * format='8': YYYY.MM.DD (8자리, 기본값)
 */
export default function DateInput({ value, onChange, format = '8', autoFocusNext = true, ...props }: DateInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

      // 6자리 입력 완료 시 다음 필드로 이동
      if (autoFocusNext && limited.length === 6) {
        focusNextInput();
      }
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

      // 8자리 입력 완료 시 다음 필드로 이동
      if (autoFocusNext && limited.length === 8) {
        focusNextInput();
      }
    }
  };

  const focusNextInput = () => {
    const currentInput = inputRef.current;
    if (!currentInput) return;

    // 현재 입력 필드의 부모 폼이나 컨테이너에서 모든 입력 요소 찾기
    const form = currentInput.closest('form') || currentInput.closest('.space-y-6') || document;
    const inputs = Array.from(form.querySelectorAll('input:not([disabled]), select:not([disabled]), textarea:not([disabled])'));
    const currentIndex = inputs.indexOf(currentInput);

    if (currentIndex !== -1 && currentIndex < inputs.length - 1) {
      const nextInput = inputs[currentIndex + 1] as HTMLElement;
      setTimeout(() => nextInput.focus(), 0);
    }
  };

  const placeholder = format === '6' ? 'YYMMDD' : 'YYYY.MM.DD';
  const maxLen = format === '6' ? 6 : 10;

  return <Input {...props} ref={inputRef} value={value} onChange={handleChange} placeholder={props.placeholder || placeholder} maxLength={maxLen} />;
}
