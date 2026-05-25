import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KTAsiaPage from './pages/kt/KTAsiaPage';
import KTAsiaTransferPage from './pages/kt/KTAsiaTransferPage';
import KTTheOnePage from './pages/kt/KTTheOnePage';
import KTMainApplicationPage from './pages/kt/KTMainApplicationPage';
import KTMmobilePaymentChangePage from './pages/kt/KTMmobilePaymentChangePage';
import KTSkyLifePaymentChangePage from './pages/kt/KTSkyLifePaymentChangePage';
import LGStoryPage from './pages/lg/LGStoryPage';
import LGStoryTransferPage from './pages/lg/LGStoryTransferPage';
import LGInsPage from './pages/lg/LGInsPage';
import LGInsPostpaidPage from './pages/lg/LGInsPostpaidPage';
import LGHanpassPage from './pages/lg/LGHanpassPage';
import LGAsiaPage from './pages/lg/LGAsiaPage';
import LGSmartelPrepaidPage from './pages/lg/LGSmartelPrepaidPage';
import LGUmobilePaymentChangePage from './pages/lg/LGUmobilePaymentChangePage';
import LGInsPaymentChangePage from './pages/lg/LGInsPaymentChangePage';
import LGHelloPaymentChangePage from './pages/lg/LGHelloPaymentChangePage';
import JoytelPrepaidPage from './pages/skt/JoytelPrepaidPage';
import SKTSevenMobilePaymentChangePage from './pages/skt/SKTSevenMobilePaymentChangePage';
import LimitedTransferWithinPeriodPage from './pages/etc/LimitedTransferWithinPeriodPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="kt/asia" element={<KTAsiaPage />} />
          <Route path="kt/asia-transfer" element={<KTAsiaTransferPage />} />
          <Route path="kt/theone" element={<KTTheOnePage />} />
          <Route path="kt/main-application" element={<KTMainApplicationPage />} />
          <Route path="kt/mmobile-payment-change" element={<KTMmobilePaymentChangePage />} />
          <Route path="kt/skylife-payment-change" element={<KTSkyLifePaymentChangePage />} />
          <Route path="skt/joytel-prepaid" element={<JoytelPrepaidPage />} />
          <Route path="skt/seven-mobile-payment-change" element={<SKTSevenMobilePaymentChangePage />} />
          <Route path="lg/story" element={<LGStoryPage />} />
          <Route path="lg/story-transfer" element={<LGStoryTransferPage />} />
          <Route path="lg/ins" element={<LGInsPage />} />
          <Route path="lg/ins-postpaid" element={<LGInsPostpaidPage />} />
          <Route path="lg/hanpass" element={<LGHanpassPage />} />
          <Route path="lg/asia" element={<LGAsiaPage />} />
          <Route path="lg/smartel-prepaid" element={<LGSmartelPrepaidPage />} />
          <Route path="lg/umobile-payment-change" element={<LGUmobilePaymentChangePage />} />
          <Route path="lg/ins-payment-change" element={<LGInsPaymentChangePage />} />
          <Route path="lg/hello-payment-change" element={<LGHelloPaymentChangePage />} />
          <Route path="etc/limited-transfer-within-period" element={<LimitedTransferWithinPeriodPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
