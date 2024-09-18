import { hc } from 'hono/client';
import type { AppType } from '@/../../webapp-server/src/server';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { useToast } from '@/hooks/use-toast';
const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';
const client = hc<AppType>(`${SERVER_URL}/red-alert/api/v1`);

import { InferResponseType, InferRequestType } from 'hono/client';

export const useGetSubscription = ({
  chatId,
  expandCities = false,
}: {
  chatId: number;
  expandCities?: boolean;
}) =>
  useQuery({
    queryKey: ['sub', chatId],
    queryFn: async ({ queryKey: [_, chatId] }) => {
      const res = await client.subs[':chatId'].$get({
        param: { chatId: chatId.toString() },
        query: expandCities ? { expandCities: 'true' } : {},
      });
      if (!res.ok) {
        throw new Error('Failed to get subscription');
      }
      return await res.json();
    },
    enabled: !!chatId,
  });

export const useSetCities = (chatId: number) => {
  const { toast } = useToast();

  const $put = client.subs[':chatId'].$put;
  type ReqBody = InferRequestType<typeof $put>['json'] & InferRequestType<typeof $put>['param'];
  type Resp = InferResponseType<typeof $put>;
  return useMutation<Resp, Error, ReqBody>({
    mutationFn: async ({ chatId, citiesNames }) => {
      const res = await $put({
        param: { chatId },
        json: { citiesNames },
      });
      if (!res.ok) {
        throw new Error('Failed to set cities');
      }
      return await res.json();
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ['sub', chatId] });
      toast({
        description: (
          <pre className='mt-2 w-[340px] rounded-md bg-slate-950 p-4'>
            <code className='text-white'>נשמר</code>
          </pre>
        ),
      });
    },
    onError: error => {
      console.error(error);
    },
  });
};

export const useLogInfo = () => {
  const $post = client['info-log'].$post;

  return useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['json']
  >({
    mutationFn: async (json: any) => {
      const res = await $post({
        json: {
          data: json,
        },
      });
      if (!res.ok) {
        throw new Error('Failed to set cities');
      }
      return await res.json();
    },
  });
};
