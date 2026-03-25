import { Fragment } from 'react';

type HeadlineTextProps = {
  text: string;
};

const BREAK_SENTINEL = '\u0000';

function splitHeadlineForDisplay(text: string) {
  const withBreakHints = text
    // Old newspaper headlines often alternate Hanja, Hangul, digits, and glosses in parentheses.
    .replace(/([)\]】〕〉》」』])(?=[\p{L}\p{N}])/gu, `$1${BREAK_SENTINEL}`)
    .replace(/([,./·ㆍ:;])(?=\S)/g, `$1${BREAK_SENTINEL}`)
    .replace(/(?<=[\p{Script=Hangul}])(?=[\p{Script=Han}\p{N}])/gu, BREAK_SENTINEL)
    .replace(/(?<=[\p{Script=Han}\p{N}])(?=[\p{Script=Hangul}])/gu, BREAK_SENTINEL)
    .replace(/(?<=[\p{N}])(?=[\p{Script=Han}])/gu, BREAK_SENTINEL)
    .replace(/(?<=[\p{Script=Han}])(?=[\p{N}])/gu, BREAK_SENTINEL);

  return withBreakHints.split(BREAK_SENTINEL).filter(Boolean);
}

export function HeadlineText({ text }: HeadlineTextProps) {
  const segments = splitHeadlineForDisplay(text);

  if (segments.length <= 1) {
    return text;
  }

  return segments.map((segment, index) => (
    <Fragment key={`${segment}-${index}`}>
      {segment}
      {index < segments.length - 1 ? <wbr /> : null}
    </Fragment>
  ));
}
