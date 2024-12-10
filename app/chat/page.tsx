'use client';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useIsLogedIn } from '../admin/hooks/useIsLogedIn';
import { Container } from '@chakra-ui/react';

export default function Chat() {
  // Check if user is logged in | Add redirect logic if needed
  const logedIn = useIsLogedIn();

  return (
    <Container
      maxW={'none'}
      className="App"
      bgColor={'black'}
      bgGradient={'linear(to-r, gray.800, blue.700)'}
      color={'black'}
    >
      <></>
      {/* <ChatWithGemini /> */}
    </Container>
  );
}
