import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KTAsiaPage from './pages/kt/KTAsiaPage';
import KTAsiaTransferPage from './pages/kt/KTAsiaTransferPage';
import KTTheOnePage from './pages/kt/KTTheOnePage';
import LGStoryPage from './pages/lg/LGStoryPage';
import LGStoryTransferPage from './pages/lg/LGStoryTransferPage';
import LGInsPage from './pages/lg/LGInsPage';
import LGInsPostpaidPage from './pages/lg/LGInsPostpaidPage';
import LGHanpassPage from './pages/lg/LGHanpassPage';
import LGSmartelPrepaidPage from './pages/lg/LGSmartelPrepaidPage';
import LGUmobilePaymentChangePage from './pages/lg/LGUmobilePaymentChangePage';
import JoytelPrepaidPage from './pages/skt/JoytelPrepaidPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kt/asia" element={<KTAsiaPage />} />
          <Route path="kt/asia-transfer" element={<KTAsiaTransferPage />} />
          <Route path="kt/theone" element={<KTTheOnePage />} />
          <Route path="skt/joytel-prepaid" element={<JoytelPrepaidPage />} />
          <Route path="lg/story" element={<LGStoryPage />} />
          <Route path="lg/story-transfer" element={<LGStoryTransferPage />} />
          <Route path="lg/ins" element={<LGInsPage />} />
          <Route path="lg/ins-postpaid" element={<LGInsPostpaidPage />} />
          <Route path="lg/hanpass" element={<LGHanpassPage />} />
          <Route path="lg/smartel-prepaid" element={<LGSmartelPrepaidPage />} />
          <Route path="lg/umobile-payment-change" element={<LGUmobilePaymentChangePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
