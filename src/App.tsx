import { Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Home } from '@/pages/Home';
import { History } from '@/pages/History';

function App() {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-purple-500/30">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
