import React, { useState } from 'react';
import { ClinicProvider, useClinic } from './context/ClinicContext';
import { HeaderSwitcher } from './components/common/HeaderSwitcher';
import { SecretaryDashboard } from './components/secretary/SecretaryDashboard';
import { ClientApp } from './components/client/ClientApp';
import { NotificationsModal } from './components/common/NotificationsModal';
import { NotificationBanner } from './components/common/NotificationBanner';
import { AuthModal } from './components/auth/AuthModal';
import { SecretaryLoginGate } from './components/secretary/SecretaryLoginGate';
import { ReceptionScreenLockModal } from './components/common/ReceptionScreenLockModal';
import { MedicalConsentViewModal } from './components/common/MedicalConsentViewModal';
import { PatientInvoiceViewModal } from './components/common/PatientInvoiceViewModal';
import { AnimatePresence, motion } from 'motion/react';
import { isFlutterApkPlatform } from './utils/platformHelper';

function AppContent() {
  const {
    toastMessage,
    authModalOpen,
    authMode,
    closeAuthModal,
    currentUser,
    isAuthenticated,
    viewMode,
    setViewMode,
    isSecretaryDashboardUnlocked,
    activeBannerNotification,
    dismissBannerNotification,
    handleNotificationClick,
    activeConsentModalApt,
    closeConsentModal,
    activeInvoiceModalApt,
    closeInvoiceModal
  } = useClinic();
  
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const isFlutter = isFlutterApkPlatform();

  // On Web: Strictly Secretary. Patient / Mobile App Mode is only rendered for the Flutter APK
  if (isFlutter && viewMode === 'client') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-['Cairo',sans-serif] text-slate-900 selection:bg-amber-100 selection:text-amber-900">
        <ClientApp
          isFramed={false}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        {/* Interactive Auth Modal (Patient login/register) */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={closeAuthModal}
          initialMode={authMode}
        />

        {/* Toast Alert Popup */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-16 sm:bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-800 text-xs sm:text-sm font-bold"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                ✓
              </div>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notifications Modal */}
        <NotificationsModal
          isOpen={isNotifOpen}
          onClose={() => setIsNotifOpen(false)}
        />

        {/* Floating In-App Notification Banner */}
        <NotificationBanner
          notification={activeBannerNotification}
          onClose={dismissBannerNotification}
          onClick={(notif) => {
            handleNotificationClick(notif);
          }}
        />

        {/* Global Medical Consent View & Print Modal (Deep link navigation from notifications) */}
        {activeConsentModalApt && (
          <MedicalConsentViewModal
            appointment={activeConsentModalApt}
            onClose={closeConsentModal}
          />
        )}

        {/* Global Patient Invoice View Modal (Deep link navigation from notifications) */}
        {activeInvoiceModalApt && (
          <PatientInvoiceViewModal
            appointment={activeInvoiceModalApt}
            onClose={closeInvoiceModal}
          />
        )}
      </div>
    );
  }

  // 2. Secretary Dashboard Security Gate: If locked or not authenticated
  if (!isSecretaryDashboardUnlocked || !isAuthenticated || !currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-['Cairo',sans-serif]">
        <SecretaryLoginGate />
        
        {/* Toast Alert Popup */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-800 text-xs sm:text-sm font-bold"
            >
              <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                ✓
              </div>
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // 3. Secretary Management Dashboard (Full reception desk)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Cairo',sans-serif] text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      
      {/* Top Secretary Desk Header with Security & Lock Controls */}
      <HeaderSwitcher
        onOpenNotifications={() => setIsNotifOpen(true)}
      />

      {/* Main View Mode Renderer: Web version dedicated exclusively to Secretary & Reception Management */}
      <main className="flex-1 w-full flex flex-col">
        <div className="flex-1 w-full bg-slate-50">
          <SecretaryDashboard />
        </div>
      </main>

      {/* Interactive Auth Modal (Switch Account / Edit) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authMode}
      />

      {/* Toast Alert Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border border-slate-800 text-xs sm:text-sm font-bold"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              ✓
            </div>
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />

      {/* Floating In-App Notification Banner */}
      <NotificationBanner
        notification={activeBannerNotification}
        onClose={dismissBannerNotification}
        onClick={(notif) => {
          handleNotificationClick(notif);
        }}
      />

      {/* Reception Desk Security PIN Screen Lock */}
      <ReceptionScreenLockModal />

      {/* Global Medical Consent View & Print Modal (Deep link navigation from notifications) */}
      {activeConsentModalApt && (
        <MedicalConsentViewModal
          appointment={activeConsentModalApt}
          onClose={closeConsentModal}
        />
      )}

      {/* Global Patient Invoice View Modal (Deep link navigation from notifications) */}
      {activeInvoiceModalApt && (
        <PatientInvoiceViewModal
          appointment={activeInvoiceModalApt}
          onClose={closeInvoiceModal}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <ClinicProvider>
      <AppContent />
    </ClinicProvider>
  );
}
