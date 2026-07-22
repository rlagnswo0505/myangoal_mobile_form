import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import KTAsiaPage from './pages/kt/KTAsiaPage';
import KTAsiaTransferPage from './pages/kt/KTAsiaTransferPage';
import KTTheOnePage from './pages/kt/KTTheOnePage';
import KTMainApplicationPage from './pages/kt/KTMainApplicationPage';
import KTMmobilePaymentChangePage from './pages/kt/KTMmobilePaymentChangePage';
import KTSkyLifePaymentChangePage from './pages/kt/KTSkyLifePaymentChangePage';
import KTPreEntryPage from './pages/kt/KTPreEntryPage';
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
import JoytelPaymentChangePage from './pages/skt/JoytelPaymentChangePage';
import SKTSevenMobilePaymentChangePage from './pages/skt/SKTSevenMobilePaymentChangePage';
import SKNewContractPage from './pages/skt/SKNewContractPage';
import SKTransferPage from './pages/skt/SKTransferPage';
import SKTTFormPage from './pages/skt/SKTTFormPage';
import LGApplicationPage from './pages/lg/LGApplicationPage';
import LGInfoChangePage from './pages/lg/LGInfoChangePage';
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
          <Route path="kt/pre-entry" element={<KTPreEntryPage />} />
          <Route path="skt/joytel-prepaid" element={<JoytelPrepaidPage />} />
          <Route path="skt/joytel-payment-change" element={<JoytelPaymentChangePage />} />
          <Route path="skt/seven-mobile-payment-change" element={<SKTSevenMobilePaymentChangePage />} />
          <Route path="skt/new-contract" element={<SKNewContractPage />} />
          <Route path="skt/transfer" element={<SKTransferPage />} />
          <Route path="skt/t-form" element={<SKTTFormPage />} />
          <Route path="lg/application" element={<LGApplicationPage />} />
          <Route path="lg/info-change" element={<LGInfoChangePage />} />
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
