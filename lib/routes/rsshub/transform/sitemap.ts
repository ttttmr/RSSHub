import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';

export const route: Route = {
    path: '/transform/sitemap/:url/:routeParams?',
    name: 'Unknown',
    maintainers: ['flrngel'],
    handler,
};

async function handler(ctx) {
    const url = ctx.req.param('url');
    const response = await got({
        method: 'get',
        url,
    });

    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const $ = load(response.data, { xmlMode: true });

    const rssTitle = routeParams.get('title') || ($('urlset url').length && $('urlset url').first().find('loc').text() ? $('urlset url').first().find('loc').text() : 'Sitemap');

    const urls = $('urlset url').toArray();
    const items =
        urls && urls.length
            ? urls
                  .map((item) => {
                      try {
                          const title = $(item).find('loc').text() || '';
                          const link = $(item).find('loc').text() || '';
                          const description = $(item).find('loc').text() || '';
                          const pubDate = $(item).find('lastmod').text() || undefined;

                          return {
                              title,
                              link,
                              description,
                              pubDate,
                          };
                      } catch {
                          return null;
                      }
                  })
                  .filter(Boolean)
            : [];

    return {
        title: rssTitle,
        link: url,
        description: `Proxy ${url}`,
        item: items,
    };
}
