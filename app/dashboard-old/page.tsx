'use client';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
// import { useIsLogedIn } from '../admin/hooks/useIsLogedIn';
import { Container } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
// import ChatWithGemini from '../components/ChatWithGemini';
const ChatWithGemini = dynamic(() => import('../components/ChatWithGemini'), { ssr: false });
import Image from "next/image";
export default function Home() {
  // Check if user is logged in | Add redirect logic if needed
  // const logedIn = useIsLogedIn();

  return (
    <div>
      <nav className="border-gray-200 bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-screen-xl flex-wrap items-center justify-between p-4">
          <div className="ml-4 flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            src="/images/weblogo.png"  // Path relative to the public folder
            width={70} 
            height={70} 
            alt="logo"
          />
          </div>
          <div className="flex items-center space-x-3 md:order-2 md:space-x-0 rtl:space-x-reverse">
            <Button onClick={() => signOut()}>Logout</Button>
          </div>
          <div
            className="hidden w-full items-center justify-between md:order-1 md:flex md:w-auto"
            id="navbar-user"
          >
            <ul className="mt-4 flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-4 font-medium md:mt-0 md:flex-row md:space-x-8 md:border-0 md:bg-white md:p-0 rtl:space-x-reverse dark:border-gray-700 dark:bg-gray-800 md:dark:bg-gray-900">
              <li>
                <Link
                  className="block rounded bg-blue-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500"
                  href="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  className="block rounded bg-blue-700 px-3 py-2 text-white md:bg-transparent md:p-0 md:text-blue-700 md:dark:text-blue-500"
                  href="/admin"
                >
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <Container
        maxW={'none'}
        className="App"
        bgColor={'black'}
        bgGradient={'linear(to-r, gray.800, blue.700)'}
        color={'black'}
      >
        <ChatWithGemini />
      </Container>
    </div>
  );
}
