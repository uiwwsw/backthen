import { NextRequest, NextResponse } from 'next/server';
import { getTodayInSeoul } from '@/lib/date';
import { pickRandomAvailableIssueYear } from '@/lib/news/pickRandomAvailableIssueYear';
import { validateYear } from '@/lib/year';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function parseYear(value: string | null) {
  if (!value || !/^\d{4}$/.test(value)) {
    return null;
  }

  return Number(value);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const today = getTodayInSeoul();
  const activeYear = parseYear(searchParams.get('activeYear'));
  const monthDayParam = searchParams.get('monthDay');

  if (
    activeYear === null ||
    !validateYear(activeYear, today.year) ||
    monthDayParam === null ||
    !/^\d{2}-\d{2}$/.test(monthDayParam)
  ) {
    return NextResponse.json({ error: 'Invalid random year request.' }, { status: 400 });
  }

  const monthDay = monthDayParam;
  const year = await pickRandomAvailableIssueYear(monthDay, activeYear, today.year);

  return NextResponse.json(
    { year },
    {
      headers: {
        'Cache-Control': 'no-store'
      }
    }
  );
}
