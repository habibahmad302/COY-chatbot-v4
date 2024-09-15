'use client';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthContext } from '@/context/AutxContext';
import { ChakraProvider, ColorModeScript, theme } from '@chakra-ui/react';
import './app.css';
// import './globals.css';
// import { CONFIG } from './config';

const inter = Inter({ subsets: ['latin'] });

// export const metadata: Metadata = {
//   title: CONFIG.appTitle,
//   description: CONFIG.appDescription,
// };

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </body>
    </html>
  );
}
