import { columns } from '@/components/cookies-table/columns';
import { DataTable } from '@/components/cookies-table/data-table';
import { FavoriteCookieAtom } from '@/components/cookies-table/favorite-cookie';
import { ColumnWidthAtom } from '@/components/cookies-table/WidthDetect';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/toaster';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getDefaultStore } from 'jotai';
import psl from 'psl';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import browser from 'webextension-polyfill';

type Props = {
  url?: string;
  popup?: boolean;
};

export const CookieShow: FC<Props> = ({ url = '', popup }) => {
  const [filter, setFilter] = useState(url);
  const [showAll, setShowAll] = useState(false);

  const { data: favorites } = useQuery({
    queryKey: ['favoriteCookie'],
    queryFn: async () => {
      const storage = await browser.storage.sync.get('favoriteCookie');
      const cookies = (storage.favoriteCookie as browser.Cookies.Cookie[]) || [];
      getDefaultStore().set(
        FavoriteCookieAtom,
        cookies.map((cookie) => {
          return {
            name: cookie.name,
            domain: cookie.domain,
          };
        }),
      );
      return cookies;
    },
  });

  const { data } = useQuery({
    queryKey: ['cookies', showAll, filter, favorites],
    keepPreviousData: true,
    queryFn: async () => {
      let domain: string | undefined;
      let hostname: string | undefined;
      if (filter) {
        try {
          hostname = new URL(filter).hostname;
        } catch {
          hostname = filter;
        } finally {
          domain = (psl.parse(hostname!) as psl.ParsedDomain).domain || undefined;
        }
      }
      const cookies = await browser.cookies.getAll({
        domain,
      });
      const dot_domain_cookies: browser.Cookies.Cookie[] = [];
      const hostname_cookies: browser.Cookies.Cookie[] = [];
      const dot_hostname_cookies: browser.Cookies.Cookie[] = [];
      const other_cookies: browser.Cookies.Cookie[] = [];
      // .domain 放在最前面
      // hostname 其次
      // .hostname 其次
      cookies.forEach((cookie) => {
        if (cookie.domain === `.${domain}`) {
          dot_domain_cookies.push(cookie);
        } else if (cookie.domain === hostname) {
          hostname_cookies.push(cookie);
        } else if (cookie.domain === `.${hostname}`) {
          dot_hostname_cookies.push(cookie);
        } else {
          other_cookies.push(cookie);
        }
      });

      const current = dot_domain_cookies.concat(hostname_cookies, dot_hostname_cookies);
      let result = current;

      if (showAll) {
        result = current.concat(other_cookies);
      }

      return result.sort((a, b) => {
        // 优先显示收藏的 cookie
        const a_favorite = favorites?.some((favorite) => {
          return favorite.name === a.name && favorite.domain === a.domain;
        });
        const b_favorite = favorites?.some((favorite) => {
          return favorite.name === b.name && favorite.domain === b.domain;
        });
        if (a_favorite && !b_favorite) {
          return -1;
        }
        if (!a_favorite && b_favorite) {
          return 1;
        }
        // 0 代表相等, -1 代表 a 在 b 前面, 1 代表 a 在 b 后面
        return 0;
      });
    },
  });

  useEffect(() => {
    getDefaultStore().set(ColumnWidthAtom, []);
  }, [data]);

  return (
    <div className={cn('p-4')}>
      <Input
        value={filter}
        onChange={(e) => {
          return setFilter(e.target.value);
        }}
        className="mb-4"
        placeholder="doamin or url"
      />
      <div className="mb-4 flex items-center space-x-2">
        <Switch
          id="onlySelf"
          checked={showAll}
          onCheckedChange={(_checked) => {
            setShowAll(_checked);
          }}
        />
        <Label htmlFor="onlySelf">是否显示全部子域名 Cookie</Label>
      </div>
      <DataTable columns={columns} data={data || []} popup={popup} />
      <Toaster />
    </div>
  );
};
