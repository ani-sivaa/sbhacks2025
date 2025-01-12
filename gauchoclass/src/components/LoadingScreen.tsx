'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  onComplete: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [firstTypedText, setFirstTypedText] = useState('');
  const [secondTypedText, setSecondTypedText] = useState('');
  const [isFirstTypingComplete, setIsFirstTypingComplete] = useState(false);
  const [isSecondTypingComplete, setIsSecondTypingComplete] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const styles = `
    @keyframes slideOutLeft {
      0% {
        opacity: 1;
        transform: translateX(0);
      }
      100% {
        opacity: 0;
        transform: translateX(-100%);
      }
    }

    @keyframes slideInLaptop {
      0% {
        opacity: 0;
        transform: translateY(20px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .animate-laptop {
      animation: slideInLaptop 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    @keyframes fadeInClick {
      0% {
        opacity: 0;
      }
      100% {
        opacity: 1;
      }
    }
    .animate-fade-click {
      animation: fadeInClick 0.5s ease-in forwards;
      animation-delay: 0.3s;
    }

 
    @keyframes fadeOutImage {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }

    .slide-out-left {
      animation: slideOutLeft 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .fade-out-image {
      animation: fadeOutImage 1s cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }

    .fixed-brand {
      position: fixed;
      top: 64px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      font-size: 2.75rem;
      font-weight: bold;
      text-align: center;
      background: linear-gradient(to right, #6366f1, #8b5cf6, #3b82f6);
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
  `;

  useEffect(() => {
    const firstText = "Don't worry, we";
    const secondText = "GauchoCourse.";
    let firstIndex = 0;
    let secondIndex = 0;

    const typeFirst = setInterval(() => {
      if (firstIndex < firstText.length) {
        setFirstTypedText(firstText.substring(0, firstIndex + 1));
        firstIndex++;
      } else {
        clearInterval(typeFirst);
        setIsFirstTypingComplete(true);

        const typeSecond = setInterval(() => {
          if (secondIndex < secondText.length) {
            setSecondTypedText(secondText.substring(0, secondIndex + 1));
            secondIndex++;
          } else {
            clearInterval(typeSecond);
            setIsSecondTypingComplete(true);
          }
        }, 100);
      }
    }, 100);

    return () => clearInterval(typeFirst);
  }, []);

  const handleLoadingScreenClick = () => {
    if (isSecondTypingComplete && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        localStorage.setItem('hasSeenIntro', 'true');
        onComplete();
      }, 1000); // Wait for animations to complete
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div 
        onClick={handleLoadingScreenClick}
        className="fixed inset-0 bg-[#202020] flex cursor-pointer overflow-hidden"
      >
        <div className="w-full md:w-1/2 flex items-center justify-center z-10 relative px-4 md:px-0">
          <div className="space-y-4 max-w-full translate-y-[-280px] translate-x-[340px]">
            <div className={`space-y-4 ${!isTransitioning ? 'animate-laptop' : ''}`}>
              <h1 className={`text-3xl md:text-5xl font-light text-gray-300 whitespace-normal
                ${isTransitioning ? 'slide-out-left' : ''}`}>
                {firstTypedText}
              </h1>
              <h2 
                className={`text-5xl md:text-7xl font-bold text-transparent bg-clip-text 
                  bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 
                  ${isTransitioning ? 'fixed-brand' : ''}`}
              >
                {secondTypedText}
              </h2>
              {isSecondTypingComplete && (
                <p className={`text-white-500 text-sm uppercase tracking-wider 
                  ${!isTransitioning ? 'animate-fade-click' : 'slide-out-left'}`}>
                  CLICK ANYWHERE TO CONTINUE
                </p>
              )}
            </div>
          </div>
        </div>
        <div className={`w-3/4 relative h-lvh flex items-center justify-center ${isTransitioning ? 'fade-out-image' : ''}`}>
          <Image 
            src="/computer.svg" 
            alt="Computer illustration" 
            fill
            className="object-cover z-0 pointer-events-none  translate-y-[200px] translate-x-[-200px]"
          />
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;