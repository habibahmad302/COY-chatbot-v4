'use client';
import { CONFIG } from '@/app/config';
import FadeIn from '@/components/animation/FadeIn';
import Image from 'next/image';
import React from 'react';

const Logo = () => {
  return (
    <FadeIn delay={0} direction="down">
      <div className="space-y-4 text-center lg:text-left">
        <a href="" className="flex justify-center lg:justify-start">
          <Image
              src="/images/weblogo.png"  // Path relative to the public folder
              width={70} 
              height={70} 
              alt="logo"
            />
        </a>
        <p className="text-lg font-medium text-gray-600">
          Welcome to Coy Chatbot <span className="text-sm">Login first!</span>
        </p>
      </div>
    </FadeIn>
  );
};

export default Logo;
