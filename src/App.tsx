import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KTAsiaPage from './pages/kt/KTAsiaPage';
import LGStoryPage from './pages/lg/LGStoryPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kt/asia" element={<KTAsiaPage />} />
          <Route path="lg/story" element={<LGStoryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
