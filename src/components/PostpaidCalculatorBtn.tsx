import React, { useState, useEffect } from 'react'
import { Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { ToolbarTooltip } from './DateCalculationBtn'

type ActivationStatus = 'number_transfer' | 'new_registration'

const fmt = (value: number) =>
  new Intl.NumberFormat('ko-KR').format(value) + '원'

const PostpaidCalculatorBtn = () => {
  const [status, setStatus] = useState<ActivationStatus>('number_transfer')
  const [rebate, setRebate] = useState(0)
  const [salesMargin, setSalesMargin] = useState(0)
  const [profit, setProfit] = useState(0)

  const mnpFee = status === 'number_transfer' ? 800 : 0

  useEffect(() => {
    const margin = Math.max(0, rebate - mnpFee)
    setSalesMargin(margin)
    setProfit(Math.round(margin / 1.1))
  }, [rebate, mnpFee])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStatus('number_transfer')
      setRebate(0)
    }
  }

  return (
    <Popover onOpenChange={handleOpenChange}>
      <ToolbarTooltip content='후불 계산기'>
        <PopoverTrigger asChild>
          <Button
            size='lg'
            variant='secondary'
            className="h-12 w-12 rounded-full hover:shadow-xl [&_svg:not([class*='size-'])]:size-6"
          >
            <Wallet />
          </Button>
        </PopoverTrigger>
      </ToolbarTooltip>
      <PopoverContent className='w-72' align='end'>
        <div className='flex flex-col gap-3'>
          {/* 개통상태 토글 */}
          <div className='space-y-1'>
            <Label className='text-sm'>개통상태</Label>
            <div className='flex gap-1'>
              <Button
                size='sm'
                variant={status === 'number_transfer' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setStatus('number_transfer')}
              >
                번호이동
              </Button>
              <Button
                size='sm'
                variant={status === 'new_registration' ? 'default' : 'outline'}
                className='flex-1'
                onClick={() => setStatus('new_registration')}
              >
                신규가입
              </Button>
            </div>
          </div>

          {/* 리베이트 */}
          <div className='space-y-1'>
            <Label htmlFor='calc-rebate' className='text-sm'>리베이트</Label>
            <Input
              id='calc-rebate'
              type='number'
              value={rebate}
              onChange={(e) => setRebate(parseInt(e.target.value) || 0)}
              onFocus={(e) => e.target.select()}
              min={0}
              autoFocus
            />
          </div>

          {/* MNP 수수료 안내 */}
          <div className='rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'>
            MNP 수수료: <span className='font-medium text-foreground'>{fmt(mnpFee)}</span>
          </div>

          {/* 판매마진 */}
          <div className='space-y-1'>
            <Label htmlFor='calc-margin' className='text-sm'>= 판매마진</Label>
            <Input
              id='calc-margin'
              value={fmt(salesMargin)}
              readOnly
              className='bg-muted'
            />
          </div>

          {/* 프로핏 */}
          <div className='space-y-1'>
            <Label htmlFor='calc-profit' className='text-sm'>= 프로핏</Label>
            <Input
              id='calc-profit'
              value={fmt(profit)}
              readOnly
              onClick={() => {
                navigator.clipboard.writeText(String(profit))
                toast.success('프로핏이 클립보드에 복사되었습니다!')
              }}
              className='bg-muted cursor-pointer'
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default PostpaidCalculatorBtn
