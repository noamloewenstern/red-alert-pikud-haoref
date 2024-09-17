import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';

import './App.css';
import CitySelectorForm from './routes/City/CitySelectorForm';
import { queryClient } from './lib/query-client';
import { SDKProvider } from '@telegram-apps/sdk-react';

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <QueryClientProvider client={queryClient}>
        <SDKProvider acceptCustomStyles>
          <div style={{ minWidth: '60%', maxWidth: '100%' }}>
            <CitySelectorForm />
          </div>
          <Toaster duration={3000} />
        </SDKProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
