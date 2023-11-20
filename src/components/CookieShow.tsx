/*
  eslint-disable react/no-unstable-nested-components
 */
import { DataTable } from '@/components/cookies-table/data-table';
import { FavoriteCookie, FavoriteCookieAtom } from '@/components/cookies-table/favorite-cookie';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { convertCookiesToNetscapeFormat } from '@/lib/cookieUtils';
import { cn } from '@/lib/utils';
import { copyToClipBoard } from '@powerfulyang/utils';
import { useQuery } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { getDefaultStore } from 'jotai';
import { Copy, Edit, RefreshCcw, Smile, Trash } from 'lucide-react';
import psl from 'psl';
import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';
import browser, { Cookies } from 'webextension-polyfill';
import Cookie = Cookies.Cookie;

type Props = {
  url?: string;
  popup?: boolean;
};

const generateUrl = (_cookie: Cookie) => {
  const { domain, secure, path } = _cookie;
  const _domain = domain.startsWith('.') ? domain.slice(1) : domain;
  return `${secure ? 'https' : 'http'}://${_domain}${path}`;
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

  const { data, refetch, isFetching } = useQuery({
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

  const updateCookie = useCallback(
    async (cookie: Cookie, update: Partial<Cookie>) => {
      const { hostOnly, session, ...rest } = cookie;
      const _url = generateUrl(cookie);
      const _domain = new URL(_url).hostname;
      await browser.cookies.set({
        ...rest,
        domain: hostOnly ? undefined : _domain,
        url: _url,
        ...update,
      });
      return refetch();
    },
    [refetch],
  );

  const columns: ColumnDef<Cookie>[] = useMemo(() => {
    return [
      {
        accessorKey: 'domain',
        header: 'Domain',
        cell: ({ row }) => {
          return <FavoriteCookie cookie={row.original} />;
        },
      },
      {
        accessorKey: 'name',
        header: () => {
          return 'Name';
        },
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-2">
              <div className="max-w-[150px] truncate text-center">{row.getValue('name')}</div>
              <Copy
                onClick={async () => {
                  const { name } = row.original;
                  await copyToClipBoard(name);
                  toast({
                    description: (
                      <div className="flex items-center justify-center space-x-2">
                        <Smile color="#4ecd4c" />
                        <div className="font-medium">Copied!</div>
                        <div className="text-blue-400">{name}</div>
                      </div>
                    ),
                  });
                }}
                size={15}
                className="cursor-pointer"
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'value',
        header: 'Value',
        cell: ({ row }) => {
          return (
            <div className="flex max-w-[250px] items-center justify-center space-x-1">
              <div className="flex-1 truncate text-right">{row.getValue('value')}</div>
              <Copy
                onClick={async () => {
                  const { value } = row.original;
                  await copyToClipBoard(value);
                  toast({
                    description: (
                      <div className="flex items-center justify-center space-x-2">
                        <Smile color="#4ecd4c" />
                        <div className="font-medium">Copied!</div>
                        <div className="text-blue-400">{value}</div>
                      </div>
                    ),
                  });
                }}
                size={15}
                className="cursor-pointer"
              />
              <Edit size={15} className="hidden cursor-pointer" />
              <Trash
                onClick={async () => {
                  await browser.cookies.remove({
                    url: generateUrl(row.original),
                    name: row.original.name,
                  });
                  return refetch();
                }}
                size={15}
                className="cursor-pointer"
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'expirationDate',
        header: 'Expiration Date',
        cell: ({ row }) => {
          return (
            <div className="w-[130px] whitespace-pre text-center">
              {row.original.session
                ? 'Session'
                : dayjs(row.getValue<number>('expirationDate') * 1000).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}
            </div>
          );
        },
      },
      {
        accessorKey: 'path',
        header: 'Path',
        cell: ({ row }) => {
          return <div className="truncate text-center">{row.getValue('path')}</div>;
        },
      },
      {
        accessorKey: 'httpOnly',
        header: 'Http Only',
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <Switch
                onCheckedChange={(checked) => {
                  return updateCookie(row.original, { httpOnly: checked });
                }}
                checked={row.getValue('httpOnly')}
              />
            </div>
          );
        },
      },
      {
        accessorKey: 'sameSite',
        header: 'Same Site',
        cell: ({ row }) => {
          return (
            <Select
              onValueChange={(value) => {
                let sameSite: Cookies.SameSiteStatus | undefined = value as Cookies.SameSiteStatus;
                if (value === 'unspecified') {
                  sameSite = undefined;
                }
                return updateCookie(row.original, { sameSite });
              }}
              value={row.getValue('sameSite')}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Same Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="lax">Lax</SelectItem>
                {row.original.secure && (
                  <SelectItem value="no_restriction">no_restriction</SelectItem>
                )}
                <SelectItem value="unspecified">unspecified</SelectItem>
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: 'secure',
        header: 'Secure',
        cell: ({ row }) => {
          return (
            <div className="flex justify-center">
              <Switch
                onCheckedChange={(checked) => {
                  return updateCookie(row.original, { secure: checked });
                }}
                checked={row.getValue('secure')}
              />
            </div>
          );
        },
      },
    ];
  }, [refetch, updateCookie]);

  return (
    <div>
      <div className="sticky top-0 bg-white p-4 shadow">
        <Input
          value={filter}
          onChange={(e) => {
            return setFilter(e.target.value);
          }}
          className="mb-4"
          placeholder="doamin or url"
        />
        <div className="flex items-center space-x-2">
          <Switch
            id="onlySelf"
            checked={showAll}
            onCheckedChange={(_checked) => {
              setShowAll(_checked);
            }}
          />
          <Label htmlFor="onlySelf">是否显示全部子域名 Cookie</Label>
          <div className="!ml-auto flex items-center gap-2">
            <button
              type="button"
              className="cursor-pointer text-blue-400 hover:text-blue-500"
              onClick={async () => {
                const cookie = convertCookiesToNetscapeFormat(data || []);
                await copyToClipBoard(cookie);
                toast({
                  description: (
                    <div className="flex items-center justify-center space-x-2">
                      <Smile color="#4ecd4c" />
                      <div className="font-medium">Copied!</div>
                    </div>
                  ),
                });
              }}
            >
              复制为 Netscape 格式
            </button>
            <RefreshCcw
              size={15}
              className={cn('!mr-2 cursor-pointer text-gray-600', {
                'animate-spin': isFetching,
              })}
              onClick={() => {
                return refetch();
              }}
            />
          </div>
        </div>
      </div>
      <div className="p-4">
        <DataTable columns={columns} data={data || []} popup={popup} />
      </div>
      <Toaster />
    </div>
  );
};
