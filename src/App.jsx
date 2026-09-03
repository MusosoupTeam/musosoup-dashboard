import { useState } from 'react';
import './App.css';
import { useReviews } from './hooks/useReviews.js';
import { useRedditMentions } from './hooks/useRedditMentions.js';
import { Header } from './components/Header.jsx';
import { SourceTabs } from './components/SourceTabs.jsx';
import { SOURCES } from './utils/sources.js';
import { TrustpilotView } from './views/TrustpilotView.jsx';
import { RedditView } from './views/RedditView.jsx';

export default function App() {
  const [source, setSource] = useState(SOURCES.TRUSTPILOT);
  const trustpilot = useReviews();
  const reddit = useRedditMentions();
  const active = source === SOURCES.TRUSTPILOT ? trustpilot : reddit;

  return (
    <div className="page">
      <Header status={active.status} fetchedAt={active.fetchedAt} onRefresh={active.refresh} />

      <main className="content">
        <SourceTabs active={source} onChange={setSource} />

        {source === SOURCES.TRUSTPILOT ? (
          <TrustpilotView
            reviews={trustpilot.reviews}
            status={trustpilot.status}
            error={trustpilot.error}
            refresh={trustpilot.refresh}
          />
        ) : (
          <RedditView mentions={reddit.mentions} status={reddit.status} error={reddit.error} refresh={reddit.refresh} />
        )}
      </main>
    </div>
  );
}
