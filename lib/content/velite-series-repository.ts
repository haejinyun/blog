import type { Series as VeliteSeries } from '#site/content';
import type { Series, SeriesRepository } from './types';

/** Velite 가 빌드 시 content/series/*.md 를 읽어 만든 데이터를 SeriesRepository 로 제공한다. */
export function createVeliteSeriesRepository(source: VeliteSeries[]): SeriesRepository {
  const allSeries = source.map(toSeries).sort((a, b) => a.title.localeCompare(b.title));

  return {
    async getAllSeries() {
      return allSeries;
    },

    async getSeriesBySlug(slug) {
      return allSeries.find((series) => series.slug === slug) ?? null;
    },
  };
}

function toSeries(series: VeliteSeries): Series {
  return {
    slug: series.slug,
    title: series.title,
    description: series.description,
    body: series.body,
  };
}
