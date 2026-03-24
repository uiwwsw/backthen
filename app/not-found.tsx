import { BackThenFrontPage } from '@/components/BackThenFrontPage';
import { getTodayInSeoul } from '@/lib/date';
import { getDefaultYearsAgo, getMaxYearsAgo, getYearFromYearsAgo } from '@/lib/year';

export default function NotFoundPage() {
  const defaultYearsAgo = getDefaultYearsAgo();
  const today = getTodayInSeoul();

  return (
    <BackThenFrontPage
      year={getYearFromYearsAgo(defaultYearsAgo, today.year)}
      currentYearsAgo={defaultYearsAgo}
      today={today}
      issue={null}
      emptyState={{
        eyebrow: '존재하지 않는 판',
        title: '지원하지 않는 범위이거나 잘못된 경로입니다',
        body: `입력 가능한 범위는 0년 전부터 ${getMaxYearsAgo(today.year)}년 전까지입니다. 다른 값으로 이동해 같은 날짜의 기록을 다시 살펴보세요.`
      }}
    />
  );
}
