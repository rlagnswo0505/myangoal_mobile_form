import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type DatePickerProps = {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ selected, onSelect, placeholder = '날짜를 선택하세요', className }: DatePickerProps) {
  const currentYear = new Date().getFullYear()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !selected && 'text-muted-foreground',
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selected ? format(selected, 'PPP', { locale: ko }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 z-200" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          locale={ko}
          captionLayout="dropdown"
          startMonth={new Date(2000, 0)}
          endMonth={new Date(currentYear + 10, 11)}
          formatters={{
            formatMonthDropdown: (date) =>
              date.toLocaleString('ko-KR', { month: 'long' }),
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
