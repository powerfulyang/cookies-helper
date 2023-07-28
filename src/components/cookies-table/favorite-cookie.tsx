import { WidthDetect } from '@/components/cookies-table/WidthDetect';
import { toast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { atom, useAtomValue } from 'jotai';
import { Star } from 'lucide-react';
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
    <WidthDetect index={0}>
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
      </div>
    </WidthDetect>
  );
};
