'use client';

import { FavoriteCookie } from '@/components/cookies-table/favorite-cookie';
import { WidthDetect } from '@/components/cookies-table/WidthDetect';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { copyToClipBoard } from '@powerfulyang/utils';
import type { ColumnDef } from '@tanstack/react-table';
import dayjs from 'dayjs';
import { Copy, Edit, Smile, Trash } from 'lucide-react';
import type { Cookies } from 'webextension-polyfill';

type Cookie = Cookies.Cookie;

export const columns: ColumnDef<Cookie>[] = [
  {
    accessorKey: 'domain',
    header: () => {
      return (
        <WidthDetect index={0}>
          <div>Domain</div>
        </WidthDetect>
      );
    },
    cell: ({ row }) => {
      return <FavoriteCookie cookie={row.original} />;
    },
  },
  {
    accessorKey: 'name',
    header: () => {
      return (
        <WidthDetect index={1}>
          <div>Name</div>
        </WidthDetect>
      );
    },
    cell: ({ row }) => {
      return (
        <WidthDetect index={1}>
          <div className="max-w-[150px] truncate text-center">{row.getValue('name')}</div>
        </WidthDetect>
      );
    },
  },
  {
    accessorKey: 'value',
    header: () => {
      return <div className="w-[250px]">Value</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="flex w-[250px] items-center justify-center space-x-1">
          <div className="flex-1 truncate text-right">{row.getValue('value')}</div>
          <Copy
            onClick={async () => {
              await copyToClipBoard(row.getValue('value'));
              toast({
                description: (
                  <div className="flex items-center justify-center space-x-2">
                    <Smile color="#4ecd4c" />
                    <div className="font-medium">Copied!</div>
                  </div>
                ),
              });
            }}
            size={15}
            className="cursor-pointer"
          />
          <Edit size={15} className="cursor-pointer" />
          <Trash size={15} className="cursor-pointer" />
        </div>
      );
    },
  },
  {
    accessorKey: 'expirationDate',
    header: () => {
      return <div className="w-[130px]">Expiration Date</div>;
    },
    cell: ({ row }) => {
      return (
        <div className="w-[130px] whitespace-pre text-center">
          {row.original.session
            ? 'Session'
            : dayjs(row.getValue<number>('expirationDate') * 1000).format('YYYY-MM-DD HH:mm:ss')}
        </div>
      );
    },
  },
  {
    accessorKey: 'path',
    header: () => {
      return (
        <WidthDetect index={2}>
          <div className="w-full">Path</div>
        </WidthDetect>
      );
    },
    cell: ({ row }) => {
      return (
        <WidthDetect index={2}>
          <div className="truncate text-center">{row.getValue('path')}</div>
        </WidthDetect>
      );
    },
  },
  {
    accessorKey: 'httpOnly',
    header: () => {
      return (
        <WidthDetect index={3}>
          <div>Http Only</div>
        </WidthDetect>
      );
    },
    cell: ({ row }) => {
      return (
        <WidthDetect index={3}>
          <div className="flex justify-center">
            <Switch checked={row.getValue('httpOnly')} />
          </div>
        </WidthDetect>
      );
    },
  },
  {
    accessorKey: 'sameSite',
    header: () => {
      return <div className="w-[180px]">Same Site</div>;
    },
    cell: ({ row }) => {
      return (
        <Select value={row.getValue('sameSite')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="strict">Strict</SelectItem>
            <SelectItem value="lax">Lax</SelectItem>
            <SelectItem value="no_restriction">no_restriction</SelectItem>
            <SelectItem value="unspecified">unspecified</SelectItem>
          </SelectContent>
        </Select>
      );
    },
  },
  {
    accessorKey: 'secure',
    header: () => {
      return (
        <WidthDetect index={4}>
          <div>Secure</div>
        </WidthDetect>
      );
    },
    cell: ({ row }) => {
      return (
        <WidthDetect index={4}>
          <div className="flex justify-center">
            <Switch checked={row.getValue('secure')} />
          </div>
        </WidthDetect>
      );
    },
  },
];
