import React, { useState } from 'react'
import { TooltipTrigger } from '@radix-ui/react-tooltip'
import { Calculator } from 'lucide-react'
import { toast } from 'sonner'
import { DatePicker } from './date-picker'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Tooltip, TooltipContent } from './ui/tooltip'

type ToolbarTooltipProps = {
  content: string
  children: React.ReactNode
}

export const ToolbarTooltip = ({ content, children }: ToolbarTooltipProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side='left'>{content}</TooltipContent>
    </Tooltip>
  )
}

const DateCalculationBtn = () => {
  const [baseDate, setBaseDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [days, setDays] = useState(0)
  const [result, setResult] = useState<string | null>(null)

  React.useEffect(() => {
    if (baseDate && days >= 0) {
      const date = new Date(baseDate)
      date.setHours(0, 0, 0, 0)
      date.setDate(date.getDate() + days + 1)
      setResult(date.toISOString().slice(0, 10))
    }
  }, [baseDate, days])

  const handleDaysFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const handleResultFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      setBaseDate(today)
      setDays(0)
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <ToolbarTooltip content='날짜 계산기'>
        <PopoverTrigger asChild>
          <Button
            size={'lg'}
            className="h-12 w-12 rounded-full hover:shadow-xl [&_svg:not([class*='size-'])]:size-6"
          >
            <Calculator />
          </Button>
        </PopoverTrigger>
      </ToolbarTooltip>
      <PopoverContent className='w-80' align='end'>
        <div className='flex flex-col gap-2'>
          <div className='space-y-1'>
            <Label htmlFor='base-date' className='text-sm'>
              기준 날짜
            </Label>
            <DatePicker
              selected={baseDate}
              onSelect={(date) => date && setBaseDate(date)}
              placeholder='기준 날짜를 선택하세요'
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='days' className='text-sm'>
              + 추가할 일수
            </Label>
            <Input
              id='days'
              type='number'
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value) || 0)}
              onFocus={handleDaysFocus}
              min={0}
              className='w-full'
              placeholder='일수를 입력하세요'
              autoFocus
            />
          </div>
          <div className='space-y-1'>
            <Label htmlFor='result' className='text-sm'>
              = 계산 결과
            </Label>
            <Input
              id='result'
              type='text'
              value={result || ''}
              readOnly
              onFocus={handleResultFocus}
              className='bg-muted w-full cursor-pointer'
              placeholder='날짜를 계산 중...'
              onClick={() => {
                navigator.clipboard.writeText(result || '')
                toast.success('계산된 날짜가 클립보드에 복사되었습니다!')
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default DateCalculationBtn
