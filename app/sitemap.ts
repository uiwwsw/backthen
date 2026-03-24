import type { MetadataRoute } from 'next';
import { getCurrentSeoulYear, getDefaultYearsAgo, getMaxYearsAgo } from '@/lib/year';

export default function sitemap(): MetadataRoute.Sitemap {
  const currentYear = getCurrentSeoulYear();
  const maxYearsAgo = getMaxYearsAgo(currentYear);
  const yearsAgoValues = Array.from({ length: maxYearsAgo + 1 }, (_, index) => index);
  const defaultYearsAgo = getDefaultYearsAgo(currentYear);

  return [
    {
      url: 'https://backthen.example/',
      changeFrequency: 'daily',
      priority: 1
    },
    ...yearsAgoValues.map((yearsAgo) => ({
      url: `https://backthen.example/${yearsAgo}`,
      changeFrequency: 'daily' as const,
      priority: yearsAgo === defaultYearsAgo ? 0.96 : 0.82
    }))
  ];
}
