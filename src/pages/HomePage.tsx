import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Eye, Printer, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">휴대폰 선불요금제 신청서</h2>
        <p className="text-muted-foreground mb-8">
          좌측 메뉴에서 통신사와 요금제를 선택하여
          <br />
          신청서를 자동으로 작성하세요.
        </p>

        <Button onClick={() => navigate('/kt/asia')} size="lg">
          KT 아시아 신청서 작성하기
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>

        <div className="mt-12 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="font-medium text-sm">간편 입력</div>
              <div className="text-muted-foreground text-xs mt-1">필요한 정보만 입력</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <div className="font-medium text-sm">실시간 미리보기</div>
              <div className="text-muted-foreground text-xs mt-1">입력 즉시 반영</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Printer className="w-5 h-5 text-primary" />
              </div>
              <div className="font-medium text-sm">바로 인쇄</div>
              <div className="text-muted-foreground text-xs mt-1">정확한 위치에 출력</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
