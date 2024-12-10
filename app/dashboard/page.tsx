'use client';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
// import { useIsLogedIn } from '../admin/hooks/useIsLogedIn';
import { Container } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
// import ChatWithGemini from '../components/ChatWithGemini';
const TraitsChatbot = dynamic(() => import('../components/CoyChatbot'), { ssr: false });
import Image from 'next/image';

export default function Home() {
  // Check if user is logged in | Add redirect logic if needed
  // const logedIn = useIsLogedIn();

  return (
    <div>
      <nav className="border-gray-200 bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between">
          <div className="ml-4 flex items-center space-x-3 rtl:space-x-reverse">
            <Image
              src="/images/weblogo.png" // Path relative to the public folder
              width={70}
              height={70}
              alt="logo"
            />
          </div>
          <div
            className="flex items-center space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse"
            style={{ marginRight: '20px' }}
          >
            <Button onClick={() => signOut()}>Logout</Button>
          </div>
          <div
            className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
            id="navbar-user"
          ></div>
        </div>
      </nav>
      
        <TraitsChatbot />
      
    </div>
  );
}
