import dynamic from 'next/dynamic';

const CombinedExplorer = dynamic(() => import('@/components/CombinedExplorer'), {});

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-pink-500 to-blue-500 text-transparent bg-clip-text">
              Welcome to GauchoClass
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            Explore UCSB courses and their grade distributions
          </p>
        </header>
        <div id="course-explorer">
          <CombinedExplorer />
        </div>
      </div>
    </div>
  );
}