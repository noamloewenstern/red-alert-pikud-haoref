import { useMutation } from '@tanstack/react-query';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || '';

export function postLog(data: Record<string, any>) {
  return fetch(`${SERVER_URL}/red-alert/api/v1/info-log`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data }),
  });
}

export const useLog = () =>
  useMutation({
    mutationFn: postLog,
    onSettled: () => {
      console.log('Logged');
    },
  });
