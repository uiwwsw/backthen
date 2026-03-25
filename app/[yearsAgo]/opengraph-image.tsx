import { readFile } from 'fs/promises';
import { ImageResponse } from 'next/og';
import { join } from 'path';
import { getTodayInSeoul, toKoreanDateLabel } from '@/lib/date';
import { getOrCreateIssueOfThatDay } from '@/lib/news/getOrCreateIssueOfThatDay';
import {
  getDefaultYearsAgo,
  getResolvedYearsAgoTitle,
  getYearFromYearsAgo,
  getYearsAgoFromYear,
  KOREAN_SERVICE_NAME,
  parseLegacyYearParam,
  parseYearsAgoParam,
  validateYear,
  validateYearsAgo
} from '@/lib/year';

export const runtime = 'nodejs';
export const size = {
  width: 1200,
  height: 630
};

export const contentType = 'image/png';

type OgImageProps = {
  params: {
    yearsAgo: string;
  };
};

export default async function OpenGraphImage({ params }: OgImageProps) {
  const today = getTodayInSeoul();
  const [chosunSm, chosunKm, chosunCentennial] = await Promise.all([
    readFile(join(process.cwd(), 'public/fonts/ChosunSm.TTF')),
    readFile(join(process.cwd(), 'public/fonts/ChosunKm.TTF')),
    readFile(join(process.cwd(), 'public/fonts/ChosunCentennial_ttf.ttf'))
  ]);
  const parsedYearsAgo = parseYearsAgoParam(params.yearsAgo);
  const legacyYear = parseLegacyYearParam(params.yearsAgo);
  const yearsAgo =
    parsedYearsAgo !== null && validateYearsAgo(parsedYearsAgo, today.year)
      ? parsedYearsAgo
      : parsedYearsAgo !== null
        ? parsedYearsAgo
      : legacyYear !== null && validateYear(legacyYear, today.year)
        ? getYearsAgoFromYear(legacyYear, today.year)
        : getDefaultYearsAgo(today.year);
  const year = getYearFromYearsAgo(yearsAgo, today.year);
  const issue = await getOrCreateIssueOfThatDay(year, today.monthDay);
  const titleLabel = issue ? getResolvedYearsAgoTitle(yearsAgo) : KOREAN_SERVICE_NAME;

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          background: 'linear-gradient(180deg, #f1e6d3 0%, #e5d8c2 100%)',
          color: '#111111',
          padding: '42px',
          fontFamily: 'ChosunSm'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '14px solid #a91212',
            borderBottom: '3px solid #111111',
            paddingTop: '14px',
            paddingBottom: '16px'
          }}
        >
          <div
            style={{ display: 'flex', maxWidth: '68%', fontSize: 44, fontWeight: 700, lineHeight: 1.08, fontFamily: 'ChosunCentennial' }}
          >
            {titleLabel}
          </div>
          <div style={{ fontSize: 24, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'ChosunKm' }}>BackThen</div>
        </div>
        <div style={{ display: 'flex', flex: 1, gap: '28px', paddingTop: '26px' }}>
          <div
            style={{
              display: 'flex',
              flex: 1.2,
              border: '2px solid rgba(17, 17, 17, 0.2)',
              background:
                'linear-gradient(135deg, rgba(17,17,17,0.18) 0%, rgba(17,17,17,0.48) 100%), radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 45%)'
            }}
          />
          <div style={{ display: 'flex', width: '38%', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 26, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#4d4942', fontFamily: 'ChosunKm' }}>
              {toKoreanDateLabel(year, today.month, today.day)}
            </div>
            <div style={{ fontSize: 70, lineHeight: 1.02, fontWeight: 700, fontFamily: 'ChosunKm' }}>
              {issue?.headline ?? '그날의 기록을 충분히 찾지 못했습니다'}
            </div>
            <div style={{ fontSize: 28, lineHeight: 1.45, color: '#36322c' }}>
              {issue?.summary ??
                '같은 날짜의 기록을 다시 수집하는 중입니다. 다른 값으로 이동해 시간을 다시 넘겨보세요.'}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'ChosunSm',
          data: chosunSm,
          weight: 400,
          style: 'normal'
        },
        {
          name: 'ChosunKm',
          data: chosunKm,
          weight: 700,
          style: 'normal'
        },
        {
          name: 'ChosunCentennial',
          data: chosunCentennial,
          weight: 700,
          style: 'normal'
        }
      ]
    }
  );
}
