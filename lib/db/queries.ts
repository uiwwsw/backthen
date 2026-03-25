import { Pool } from 'pg';
import type { ArticleCandidate, IssueOfDay, StoredIssueCandidateRow, StoredIssueRow } from '@/lib/db/types';
import { pickRelatedArticles, pickSecondaryArticles } from '@/lib/news/rankIssueCandidates';
import { normalizeHeadline } from '@/lib/sources/shared';

let poolState: Pool | null | undefined;
let schemaPromise: Promise<void> | null = null;

function getConnectionString() {
  return process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? null;
}

function getPool() {
  if (poolState !== undefined) {
    return poolState;
  }

  const connectionString = getConnectionString();

  if (!connectionString) {
    poolState = null;
    return poolState;
  }

  poolState = new Pool({
    connectionString,
    ssl: process.env.POSTGRES_SSL === 'true' ? { rejectUnauthorized: false } : undefined
  });

  return poolState;
}

async function ensureSchema() {
  const pool = getPool();

  if (!pool) {
    return;
  }

  if (!schemaPromise) {
    schemaPromise = pool
      .query(`
        CREATE TABLE IF NOT EXISTS issues_of_day (
          id BIGSERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          month_day CHAR(5) NOT NULL,
          headline TEXT NOT NULL,
          raw_headline TEXT,
          summary TEXT NOT NULL,
          source_name TEXT NOT NULL,
          source_url TEXT NOT NULL,
          published_at TEXT NOT NULL,
          background_image_url TEXT,
          background_image_credit TEXT,
          image_status TEXT NOT NULL,
          keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
          importance_score NUMERIC(8, 2) NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (year, month_day)
        );

        CREATE TABLE IF NOT EXISTS issue_source_candidates (
          id BIGSERIAL PRIMARY KEY,
          issue_id BIGINT NOT NULL REFERENCES issues_of_day(id) ON DELETE CASCADE,
          source_name TEXT NOT NULL,
          title TEXT NOT NULL,
          raw_title TEXT,
          url TEXT NOT NULL,
          published_at TEXT NOT NULL,
          excerpt TEXT,
          image_url TEXT,
          section TEXT,
          duplicate_cluster_key TEXT,
          source_weight NUMERIC(8, 2) NOT NULL DEFAULT 0,
          event_score NUMERIC(8, 2) NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS editorial_overrides (
          id BIGSERIAL PRIMARY KEY,
          year INTEGER NOT NULL,
          month_day CHAR(5) NOT NULL,
          headline TEXT NOT NULL,
          raw_headline TEXT,
          summary TEXT NOT NULL,
          source_name TEXT NOT NULL,
          source_url TEXT NOT NULL,
          published_at TEXT NOT NULL,
          background_image_url TEXT,
          background_image_credit TEXT,
          image_status TEXT NOT NULL,
          keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
          importance_score NUMERIC(8, 2) NOT NULL DEFAULT 0,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          UNIQUE (year, month_day)
        );

        ALTER TABLE issues_of_day
          ADD COLUMN IF NOT EXISTS raw_headline TEXT;

        ALTER TABLE issue_source_candidates
          ADD COLUMN IF NOT EXISTS raw_title TEXT;

        ALTER TABLE editorial_overrides
          ADD COLUMN IF NOT EXISTS raw_headline TEXT;
      `)
      .then(() => undefined);
  }

  return schemaPromise;
}

function mapIssue(row: StoredIssueRow): IssueOfDay {
  const rawHeadline = row.raw_headline ?? row.headline;

  return {
    year: row.year,
    monthDay: row.month_day,
    headline: normalizeHeadline(row.headline),
    rawHeadline,
    summary: row.summary,
    sourceName: row.source_name,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
    backgroundImageUrl: row.background_image_url,
    backgroundImageCredit: row.background_image_credit,
    imageStatus: row.image_status,
    keywords: row.keywords ?? [],
    importanceScore: Number(row.importance_score),
    relatedArticles: [],
    secondaryArticles: []
  };
}

function mapCandidate(row: StoredIssueCandidateRow): ArticleCandidate {
  const rawTitle = row.raw_title ?? row.title;

  return {
    sourceName: row.source_name,
    title: normalizeHeadline(row.title),
    rawTitle,
    url: row.url,
    publishedAt: row.published_at,
    excerpt: row.excerpt,
    imageUrl: row.image_url,
    section: row.section,
    duplicateClusterKey: row.duplicate_cluster_key,
    sourceWeight: Number(row.source_weight),
    eventScore: Number(row.event_score)
  };
}

export async function getIssueRecord(year: number, monthDay: string) {
  const pool = getPool();

  if (!pool) {
    return null;
  }

  await ensureSchema();

  const result = await pool.query<StoredIssueRow>(
    `
      SELECT year, month_day, headline, raw_headline, summary, source_name, source_url, published_at,
             background_image_url, background_image_credit, image_status, keywords, importance_score
      FROM issues_of_day
      WHERE year = $1 AND month_day = $2
      LIMIT 1
    `,
    [year, monthDay]
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  const issue = mapIssue(row);
  const candidateResult = await pool.query<StoredIssueCandidateRow>(
    `
      SELECT c.source_name, c.title, c.raw_title, c.url, c.published_at, c.excerpt, c.image_url,
             c.section, c.duplicate_cluster_key, c.source_weight, c.event_score
      FROM issue_source_candidates c
      JOIN issues_of_day i ON i.id = c.issue_id
      WHERE i.year = $1 AND i.month_day = $2
    `,
    [year, monthDay]
  );
  const candidates = candidateResult.rows.map(mapCandidate);

  issue.secondaryArticles = pickSecondaryArticles(candidates, {
    sourceName: issue.sourceName,
    title: issue.headline,
    rawTitle: issue.rawHeadline ?? issue.headline,
    url: issue.sourceUrl,
    publishedAt: issue.publishedAt,
    excerpt: null,
    imageUrl: issue.backgroundImageUrl,
    section: null,
    duplicateClusterKey: null,
    sourceWeight: 0,
    eventScore: 0
  });
  issue.relatedArticles = pickRelatedArticles(
    candidates,
    {
      sourceName: issue.sourceName,
      title: issue.headline,
      rawTitle: issue.rawHeadline ?? issue.headline,
      url: issue.sourceUrl,
      publishedAt: issue.publishedAt,
      excerpt: null,
      imageUrl: issue.backgroundImageUrl,
      section: null,
      duplicateClusterKey: null,
      sourceWeight: 0,
      eventScore: 0
    },
    {
      excludeUrls: issue.secondaryArticles.map((article) => article.url),
      limit: 4
    }
  );

  return issue;
}

export async function getEditorialOverride(year: number, monthDay: string) {
  const pool = getPool();

  if (!pool) {
    return null;
  }

  await ensureSchema();

  const result = await pool.query<StoredIssueRow>(
    `
      SELECT year, month_day, headline, raw_headline, summary, source_name, source_url, published_at,
             background_image_url, background_image_credit, image_status, keywords, importance_score
      FROM editorial_overrides
      WHERE year = $1 AND month_day = $2
      LIMIT 1
    `,
    [year, monthDay]
  );

  return result.rows[0] ? mapIssue(result.rows[0]) : null;
}

export async function getAvailableIssueYearsForMonthDay(monthDay: string) {
  const pool = getPool();

  if (!pool) {
    return [];
  }

  await ensureSchema();

  const result = await pool.query<{ year: number }>(
    `
      SELECT year
      FROM (
        SELECT year
        FROM issues_of_day
        WHERE month_day = $1

        UNION

        SELECT year
        FROM editorial_overrides
        WHERE month_day = $1
      ) AS available_years
      ORDER BY year ASC
    `,
    [monthDay]
  );

  return result.rows.map((row) => row.year);
}

export async function storeIssueRecord(issue: IssueOfDay, candidates: ArticleCandidate[]) {
  const pool = getPool();

  if (!pool) {
    return;
  }

  await ensureSchema();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const upserted = await client.query<{ id: string }>(
      `
        INSERT INTO issues_of_day (
          year, month_day, headline, raw_headline, summary, source_name, source_url, published_at,
          background_image_url, background_image_credit, image_status, keywords, importance_score, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, NOW())
        ON CONFLICT (year, month_day)
        DO UPDATE SET
          headline = EXCLUDED.headline,
          raw_headline = EXCLUDED.raw_headline,
          summary = EXCLUDED.summary,
          source_name = EXCLUDED.source_name,
          source_url = EXCLUDED.source_url,
          published_at = EXCLUDED.published_at,
          background_image_url = EXCLUDED.background_image_url,
          background_image_credit = EXCLUDED.background_image_credit,
          image_status = EXCLUDED.image_status,
          keywords = EXCLUDED.keywords,
          importance_score = EXCLUDED.importance_score,
          updated_at = NOW()
        RETURNING id
      `,
      [
        issue.year,
        issue.monthDay,
        issue.headline,
        issue.rawHeadline ?? issue.headline,
        issue.summary,
        issue.sourceName,
        issue.sourceUrl,
        issue.publishedAt,
        issue.backgroundImageUrl,
        issue.backgroundImageCredit,
        issue.imageStatus,
        JSON.stringify(issue.keywords),
        issue.importanceScore
      ]
    );

    const issueId = Number(upserted.rows[0]?.id ?? 0);

    await client.query('DELETE FROM issue_source_candidates WHERE issue_id = $1', [issueId]);

    for (const candidate of candidates) {
      await client.query(
        `
          INSERT INTO issue_source_candidates (
            issue_id, source_name, title, raw_title, url, published_at, excerpt, image_url,
            section, duplicate_cluster_key, source_weight, event_score
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `,
        [
          issueId,
          candidate.sourceName,
          candidate.title,
          candidate.rawTitle ?? candidate.title,
          candidate.url,
          candidate.publishedAt,
          candidate.excerpt,
          candidate.imageUrl,
          candidate.section,
          candidate.duplicateClusterKey,
          candidate.sourceWeight,
          candidate.eventScore
        ]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateIssueVisual(
  year: number,
  monthDay: string,
  visual: {
    backgroundImageUrl: string | null;
    backgroundImageCredit: string | null;
    imageStatus: IssueOfDay['imageStatus'];
  }
) {
  const pool = getPool();

  if (!pool) {
    return;
  }

  await ensureSchema();

  await pool.query(
    `
      UPDATE issues_of_day
      SET background_image_url = $3,
          background_image_credit = $4,
          image_status = $5,
          updated_at = NOW()
      WHERE year = $1 AND month_day = $2
    `,
    [year, monthDay, visual.backgroundImageUrl, visual.backgroundImageCredit, visual.imageStatus]
  );
}
