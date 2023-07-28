import { atom, useAtom } from 'jotai';
import type { CSSProperties, FC, PropsWithChildren, ReactElement } from 'react';
import { cloneElement, useEffect, useState } from 'react';
import { useResizeDetector } from 'react-resize-detector';

export const ColumnWidthAtom = atom<number[][]>([]);

export const WidthDetect: FC<PropsWithChildren<{ index: number }>> = ({
  index,
  children,
  ...props
}) => {
  const [columnWith, setColumnWith] = useAtom(ColumnWidthAtom);
  const [style, setStyle] = useState<CSSProperties>({});
  const { ref } = useResizeDetector({
    onResize: (width) => {
      if (width) {
        setColumnWith((prev) => {
          const _prev = [...prev];
          _prev[index] = [...(_prev[index] || []), width!];
          return _prev;
        });
      }
    },
  });
  useEffect(() => {
    if (columnWith[index]) {
      setStyle({
        width: Math.max(...columnWith[index]),
      });
    } else {
      setStyle({
        width: undefined,
      });
    }
  }, [columnWith, index]);

  return cloneElement(children as ReactElement, {
    ref,
    style,
    ...props,
  });
};
