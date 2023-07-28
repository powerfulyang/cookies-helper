import { useLayoutEffect, useState } from 'react';
import browser from 'webextension-polyfill';

export const useSessionStorage = <T>(key: string, initialValue: T) => {
  const [value, setValue] = useState<T>(initialValue);

  const _setValue = (newValue: T) => {
    setValue(newValue);
    return browser.storage.session.set({ [key]: newValue });
  };

  useLayoutEffect(() => {
    browser.storage.session.get(key).then((result) => {
      if (result[key]) {
        setValue(result[key]);
      }
    });
  }, [key]);

  return [value, _setValue] as const;
};
