import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X, Trash2, RotateCcw, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { LoadingButton } from '@/components/ui/loading-button';
import { useInitData } from '@telegram-apps/sdk-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cities as rawCities } from './cities.data';

import { arraysEqual, cn, dedup } from '@/lib/utils';
import { useGetSubscription, useSetCities } from '@/lib/api/cities';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const isProd = import.meta.env.PROD || process.env.NODE_ENV === 'production';
const isDev = !isProd;
const devChatId = +(import.meta.env.VITE_DEV_CHAT_ID || '123123123');

type City = (typeof cities)[number];
const cities = Object.values(rawCities).map(city => ({
  label: city.name,
  value: city.name_en,
}));

function useChatId() {
  if (isDev) {
    return devChatId;
  }
  const initData = useInitData();
  return initData?.chat?.id || initData?.user?.id;
}
export default function _CitySelectorForm() {
  try {
    const chatId = useChatId();

    if (!chatId)
      return (
        <div className='flex flex-col space-y-3'>
          <Skeleton className='h-[125px] w-[250px] rounded-xl' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
      );
    return <CitySelectorForm chatId={chatId} />;
  } catch (e) {
    return (
      <AlertDestructive description='Failed. Are you viewing via Telegram WebApp? If so, error is on the server' />
    );
  }
}
export function CitySelectorForm({ chatId }: { chatId: number }) {
  const {
    data: sub,
    isError,
    isLoading: isLoadingSub,
  } = useGetSubscription({ chatId, expandCities: true });
  const { mutate: setCities, isPending } = useSetCities(chatId);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const loading = isLoadingSub || isPending;

  const initialSelectedCities = useMemo(() => {
    return (
      sub?.expand?.cities.map(c => ({
        label: c.name,
        value: c.name_en,
      })) || []
    );
  }, [sub]);
  const [_selectedCities, setSelectedCities] = useState<City[]>(initialSelectedCities);
  const selectedCities = useMemo(() => {
    return _selectedCities.sort((a, b) => a.label.localeCompare(b.label));
  }, [_selectedCities]);

  useEffect(() => {
    setSelectedCities(initialSelectedCities);
  }, [initialSelectedCities]);

  const [searchTerm, setSearchTerm] = useState('');

  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));
  const allNonSelectedCities = useMemo(
    () => cities.filter(city => !selectedCities.some(item => item.value === city.value)),
    [selectedCities],
  );

  const filteredCities = useMemo(() => {
    if (!searchTerm) return allNonSelectedCities;
    return allNonSelectedCities.filter(city =>
      city.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, allNonSelectedCities]);

  const [visibleCities, setVisibleCities] = useState(() => filteredCities.slice(0, 100));

  useEffect(() => {
    setVisibleCities(dedup(filteredCities, c => c.value));
  }, [filteredCities]);

  const handleSelect = useCallback(
    (city: City) => {
      if (visibleCities.length === 1) {
        setSearchTerm('');
        inputRef.current!.textContent = '';
        inputRef.current!.value = '';
        inputRef.current!.dispatchEvent(new Event('change'));
      }
      console.log('focus');
      console.log('inputRef.current', inputRef.current);
      inputRef.current!.focus();

      setSelectedCities(prev => {
        return [...prev, city];
      });
    },
    [visibleCities],
  );

  const handleRemove = useCallback((city: City) => {
    setSelectedCities(prev => prev.filter(c => c.value !== city.value));
  }, []);

  const handleRemoveAll = useCallback(() => {
    setSelectedCities([]);
  }, []);

  const handleSubmit = useCallback(async () => {
    setIsDropdownOpen(false);
    setCities({ chatId: chatId.toString(), citiesNames: selectedCities.map(c => c.value) });
  }, [selectedCities]);

  const handleCancel = useCallback(() => {
    setSelectedCities(initialSelectedCities);
    setIsDropdownOpen(false);
  }, [initialSelectedCities]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop === clientHeight) {
        setVisibleCities(prev =>
          dedup([...prev, ...filteredCities.slice(prev.length, prev.length + 100)], c => c.value),
        );
      }
    },
    [filteredCities],
  );

  const disableSubmitButton = useMemo(() => {
    return loading || arraysEqual(selectedCities, initialSelectedCities);
  }, [isLoadingSub, isPending, selectedCities, initialSelectedCities]);

  if (isError) {
    return (
      <AlertDestructive description='Failed. Are you viewing via Telegram WebApp? If so, error is on the server' />
    );
  }

  return (
    <div className='space-y-4 w-full'>
      <div className='w-full max-w-2xl mx-auto space-y-4 bg-gray-900 p-6 rounded-lg'>
        <Title />

        <div className='flex justify-between items-center'>
          <div>
            <Button
              variant='outline'
              size='icon'
              onClick={handleRemoveAll}
              className={cn(
                'mr-2 bg-gray-800 text-white hover:bg-gray-700',
                selectedCities.length === 0 ? 'hidden' : '',
              )}
              title='Remove all selected cities'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={handleCancel}
              className={cn(
                'bg-gray-800 text-white hover:bg-gray-700',
                disableSubmitButton ? 'hidden' : '',
              )}
              title='Cancel changes'
            >
              <RotateCcw className='h-4 w-4' />
            </Button>
          </div>

          <LoadingButton
            loading={loading}
            onClick={handleSubmit}
            className={cn(
              'bg-blue-600 text-white hover:bg-blue-700 h-8',
              disableSubmitButton ? 'cursor-not-allowed' : '',
            )}
            disabled={disableSubmitButton}
          >
            שמור
          </LoadingButton>
        </div>

        <div className='relative' ref={dropdownRef}>
          <Input
            ref={inputRef}
            type='text'
            placeholder='בחר ערים...'
            onChange={e => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className={cn(
              'w-full bg-gray-800 text-white border-gray-700 focus:border-blue-500',
              // 'w-full bg-gray-800 text-white  focus:border-blue-500',
              isDropdownOpen ? 'border-blue-500' : '',
            )}
          />

          {isDropdownOpen && (
            <div style={{ direction: 'rtl' }}>
              <div
                className={cn(
                  'absolute z-10 mt-1 mx-auto bg-gray-800 border border-gray-700 rounded-md shadow-lg',
                )}
              >
                <ScrollArea className='h-64' onScroll={handleScroll}>
                  {visibleCities.map(city => (
                    <div
                      key={city.value}
                      className={`px-4 py-2 cursor-pointer hover:bg-gray-700  text-white text-right`}
                      onClick={() => handleSelect(city)}
                    >
                      {city.label}
                    </div>
                  ))}
                  {visibleCities.length === 0 && (
                    <div className='px-4 py-2 text-gray-400'>לא נמצאה התאמה</div>
                  )}
                </ScrollArea>
              </div>
            </div>
          )}
          <div className='flex flex-wrap gap-2 mt-2 flex-row-reverse'>
            {selectedCities.map(city => (
              <Badge
                key={city.value}
                variant='secondary'
                className='bg-gray-700 text-white text-sm py-1 px-2'
              >
                {city.label}
                <X className='ml-1 h-3 w-3 cursor-pointer' onClick={() => handleRemove(city)} />
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export function AlertDestructive({ description }: { description: string }) {
  return (
    <Alert variant='destructive'>
      <AlertCircle className='h-4 w-4' />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
}

const Title = () => {
  return (
    <div className='rounded text-center shadow-md'>
      <h1 className='text-xl font-bold leading-tight'>בחר ערים להתרעה</h1>
    </div>
  );
};
