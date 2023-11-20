import { toast } from '@/components/ui/use-toast';
import { convertSameSite } from '@/lib/cookieUtils';
import { copyToClipBoard } from '@powerfulyang/utils';
import { useQueryClient } from '@tanstack/react-query';
import { serialize } from 'cookie';
import { atom, useAtomValue } from 'jotai';
import { Copy, Smile, Star } from 'lucide-react';
import type { FC } from 'react';
import type { Cookies } from 'webextension-polyfill';
import browser from 'webextension-polyfill';

export const FavoriteCookieAtom = atom<Pick<Cookies.Cookie, 'name' | 'domain'>[]>([]);

export const FavoriteCookie: FC<{ cookie: Cookies.Cookie }> = ({ cookie }) => {
  const cookies = useAtomValue(FavoriteCookieAtom);
  const isFavorite = cookies.some(
    (_cookie) => cookie.domain === _cookie.domain && cookie.name === _cookie.name,
  );
  const queryClient = useQueryClient();

  return (
    <div className="flex items-center justify-center space-x-1 font-medium">
      <Star
        onClick={async () => {
          // 已存在就删除
          if (isFavorite) {
            const _cookies = cookies.filter(
              (_cookie) => !(cookie.domain === _cookie.domain && cookie.name === _cookie.name),
            );
            await browser.storage.sync.set({
              favoriteCookie: _cookies,
            });
            toast({
              description: (
                <div className="flex items-center justify-center space-x-2">
                  <Star size={15} />
                  <div className="font-medium">Removed from favorite!</div>
                </div>
              ),
            });
          } else {
            await browser.storage.sync.set({
              favoriteCookie: cookies.concat({
                name: cookie.name,
                domain: cookie.domain,
              }),
            });
            toast({
              description: (
                <div className="flex items-center justify-center space-x-2">
                  <Star size={15} color="#f5c518" />
                  <div className="font-medium">Added to favorite!</div>
                </div>
              ),
            });
          }
          await queryClient.refetchQueries(['favoriteCookie']);
        }}
        size={15}
        color={isFavorite ? '#f5c518' : undefined}
        className="cursor-pointer"
      />
      <span className="truncate text-sm">{cookie.domain}</span>
      <Copy
        onClick={async () => {
          const { name, value, ...rest } = cookie;
          const copyValue = serialize(name, value, {
            ...rest,
            sameSite: convertSameSite(rest.sameSite),
            expires: rest.expirationDate ? new Date(rest.expirationDate * 1000) : undefined,
          });
          await copyToClipBoard(copyValue);
          toast({
            description: (
              <div className="flex items-center justify-center space-x-2">
                <Smile color="#4ecd4c" />
                <div className="font-medium">Copied!</div>
                <div className="text-blue-400">{copyValue}</div>
              </div>
            ),
          });
        }}
        size={15}
        className="cursor-pointer"
      />
    </div>
  );
};
