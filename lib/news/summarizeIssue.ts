import type { ArticleCandidate } from '@/lib/db/types';
import { getSourceLabel } from '@/lib/date';

type SummarizeIssueInput = {
  year: number;
  monthDay: string;
  primary: ArticleCandidate;
  related: ArticleCandidate[];
};

function toMonthDayKorean(monthDay: string) {
  const [month, day] = monthDay.split('-').map(Number);
  return `${month}월 ${day}일`;
}

function compactSentence(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function splitSentences(value: string) {
  return compactSentence(value)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

const metaSentencePatterns = [/서비스용 요약/, /재구성했/, /비중 있게 다뤘/, /주요 지면에서 반복적으로/, /가장 강하게 떠올랐습니다/];

export function sanitizeIssueSummary(value: string) {
  const filtered = splitSentences(value).filter((sentence) => !metaSentencePatterns.some((pattern) => pattern.test(sentence)));

  return filtered.join(' ').trim();
}

export function summarizeIssue({ year, monthDay, primary, related }: SummarizeIssueInput) {
  const sourceCount = new Set([primary, ...related].map((candidate) => candidate.sourceName)).size;
  const sources = [primary, ...related]
    .map((candidate) => getSourceLabel(candidate.sourceName, candidate.url))
    .filter((source, index, array) => array.indexOf(source) === index)
    .join('·');
  const excerpt = primary.excerpt ? splitSentences(primary.excerpt).slice(0, 2).join(' ') : null;
  const sourceLine =
    sourceCount > 1
      ? `${sources} 등 ${sourceCount}개 주요 일간지가 이날 주요 기사로 다뤘습니다.`
      : `${getSourceLabel(primary.sourceName, primary.url)} 기사로 확인됩니다.`;
  const sectionLine = primary.section ? `${primary.section} 면 기사입니다.` : null;

  const sentences = [
    `${year}년 ${toMonthDayKorean(monthDay)}, ${primary.title}.`,
    excerpt ? `${excerpt.endsWith('.') ? excerpt : `${excerpt}.`}` : sourceLine,
    excerpt ? sourceLine : sectionLine,
    excerpt && sectionLine ? sectionLine : null
  ];

  return sanitizeIssueSummary(sentences.filter(Boolean).join(' '));
}
