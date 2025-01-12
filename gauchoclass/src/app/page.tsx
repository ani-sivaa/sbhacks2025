import dynamic from 'next/dynamic';

const CombinedExplorer = dynamic(() => import('@/components/CombinedExplorer'), {});

export default function Home() {
  return (
    <div className="min-h-screen w-full overflow-hidden">
      <div className="h-screen w-full">
        <div id="course-explorer" className="h-full w-full">
          <CombinedExplorer />
        </div>
      </div>
    </div>
  );
}