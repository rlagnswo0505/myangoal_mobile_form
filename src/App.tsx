import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KTAsiaPage from './pages/kt/KTAsiaPage';
import LGStoryPage from './pages/lg/LGStoryPage';
import LGStoryTransferPage from './pages/lg/LGStoryTransferPage';
import LGInsPage from './pages/lg/LGInsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kt/asia" element={<KTAsiaPage />} />
          <Route path="lg/story" element={<LGStoryPage />} />
          <Route path="lg/story-transfer" element={<LGStoryTransferPage />} />
          <Route path="lg/ins" element={<LGInsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
