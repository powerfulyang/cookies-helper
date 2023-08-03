'use client';

import { FavoriteCookie } from '@/components/cookies-table/favorite-cookie';
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
      return <div className="max-w-[150px] truncate text-center">{row.getValue('name')}</div>;
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
    header: 'Expiration Date',
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
          <Switch checked={row.getValue('httpOnly')} />
        </div>
      );
    },
  },
  {
    accessorKey: 'sameSite',
    header: 'Same Site',
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
    header: 'Secure',
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Switch checked={row.getValue('secure')} />
        </div>
      );
    },
  },
];
