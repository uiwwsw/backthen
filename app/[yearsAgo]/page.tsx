import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { BackThenFrontPage } from '@/components/BackThenFrontPage';
import { getTodayInSeoul, toKoreanDateLabel } from '@/lib/date';
import { getOrCreateIssueOfThatDay } from '@/lib/news/getOrCreateIssueOfThatDay';
import { getIssueThemePalette, getThemeStyle } from '@/lib/theme';
import {
  getMaxYearsAgo,
  getResolvedYearsAgoTitle,
  getYearFromYearsAgo,
  getYearsAgoFromYear,
  KOREAN_SERVICE_NAME,
  parseLegacyYearParam,
  parseYearsAgoParam,
  validateYear,
  validateYearsAgo
} from '@/lib/year';

type YearsAgoPageProps = {
  params: {
    yearsAgo: string;
  };
};

export const dynamic = 'force-dynamic';

function buildOutOfRangeDescription(currentYear: number) {
  return `입력 가능한 범위는 0년 전부터 ${getMaxYearsAgo(currentYear)}년 전까지입니다.`;
}

function buildOutOfRangeEmptyState(currentYear: number) {
  return {
    eyebrow: '존재하지 않는 판',
    title: '지원하지 않는 범위이거나 잘못된 경로입니다',
    body: `${buildOutOfRangeDescription(currentYear)} 다른 값으로 이동해 같은 날짜의 기록을 다시 살펴보세요.`
  };
}

export async function generateMetadata({ params }: YearsAgoPageProps): Promise<Metadata> {
  const today = getTodayInSeoul();
  const parsedYearsAgo = parseYearsAgoParam(params.yearsAgo);
  const legacyYear = parseLegacyYearParam(params.yearsAgo);

  if (parsedYearsAgo !== null && validateYearsAgo(parsedYearsAgo, today.year)) {
    const year = getYearFromYearsAgo(parsedYearsAgo, today.year);
    const issue = await getOrCreateIssueOfThatDay(year, today.monthDay);
    const title = issue ? getResolvedYearsAgoTitle(parsedYearsAgo) : KOREAN_SERVICE_NAME;
    const description = issue
      ? `${year}년 오늘의 대표 이슈 "${issue.headline}"를 한 장의 신문 1면으로 다시 봅니다.`
      : `${year}년 오늘의 대표 이슈를 한 장의 신문 1면으로 다시 봅니다.`;

    return {
      title,
      description,
      alternates: {
        canonical: `/${parsedYearsAgo}`
      },
      openGraph: {
        title,
        description,
        url: `/${parsedYearsAgo}`,
        images: [
          {
            url: `/${parsedYearsAgo}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `${title} 신문 1면`
          }
        ]
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`/${parsedYearsAgo}/opengraph-image`]
      }
    };
  }

  if (legacyYear === null || !validateYear(legacyYear, today.year)) {
    if (parsedYearsAgo !== null) {
      const title = KOREAN_SERVICE_NAME;
      const description = buildOutOfRangeDescription(today.year);

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `/${parsedYearsAgo}`,
          images: [
            {
              url: `/${parsedYearsAgo}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: `${title} 신문 1면`
            }
          ]
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [`/${parsedYearsAgo}/opengraph-image`]
        }
      };
    }

    return {
      title: KOREAN_SERVICE_NAME,
      description: '입력 가능한 몇 년 전 값인지 다시 확인해주세요.'
    };
  }

  const yearsAgo = getYearsAgoFromYear(legacyYear, today.year);
  const issue = await getOrCreateIssueOfThatDay(legacyYear, today.monthDay);
  const title = issue ? getResolvedYearsAgoTitle(yearsAgo) : KOREAN_SERVICE_NAME;
  const description = issue
    ? `${legacyYear}년 오늘의 대표 이슈 "${issue.headline}"를 한 장의 신문 1면으로 다시 봅니다.`
    : `${legacyYear}년 오늘의 대표 이슈를 한 장의 신문 1면으로 다시 봅니다.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${yearsAgo}`
    },
    openGraph: {
      title,
      description,
      url: `/${yearsAgo}`,
      images: [
        {
          url: `/${yearsAgo}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} 신문 1면`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/${yearsAgo}/opengraph-image`]
    }
  };
}

export default async function YearsAgoPage({ params }: YearsAgoPageProps) {
  const today = getTodayInSeoul();
  const parsedYearsAgo = parseYearsAgoParam(params.yearsAgo);
  const legacyYear = parseLegacyYearParam(params.yearsAgo);

  if (parsedYearsAgo !== null && validateYearsAgo(parsedYearsAgo, today.year)) {
    const year = getYearFromYearsAgo(parsedYearsAgo, today.year);
    const issue = await getOrCreateIssueOfThatDay(year, today.monthDay);
    const themePalette = await getIssueThemePalette(issue?.backgroundImageUrl ?? null);
    const themeStyle = getThemeStyle(themePalette);

    return (
      <BackThenFrontPage
        year={year}
        currentYearsAgo={parsedYearsAgo}
        today={today}
        issue={issue}
        themeStyle={themeStyle}
      />
    );
  }

  if (legacyYear !== null && validateYear(legacyYear, today.year)) {
    redirect(`/${getYearsAgoFromYear(legacyYear, today.year)}`);
  }

  if (parsedYearsAgo !== null) {
    return (
      <BackThenFrontPage
        year={getYearFromYearsAgo(parsedYearsAgo, today.year)}
        currentYearsAgo={parsedYearsAgo}
        today={today}
        issue={null}
        emptyState={buildOutOfRangeEmptyState(today.year)}
      />
    );
  }

  notFound();
}
