import { Suspense, lazy, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import LandingPage from "./landing/LandingPage";

import CreatorInvitePage from "./recipient/CreatorInvitePage";
import OnboardingPage from "./recipient/OnboardingPage";
import RecipientLayout from "./recipient/RecipientLayout";
import UserChannelHome from "./recipient/UserChannelHome";
import UserVideoPage, { UserVideosPage } from "./recipient/UserVideoPage";
import UserToolsPage, { UserToolPage } from "./recipient/UserToolsPage";
import UserFilesPage from "./recipient/UserFilesPage";
import { ChatRoute } from "./recipient/UserChatPage";
import UserProfilePage from "./recipient/UserProfilePage";
import UserNotificationsPage from "./recipient/UserNotificationsPage";


// Panel twórcy ładuje się osobno — odbiorca na telefonie go nie pobiera.
const CreatorLayout = lazy(() => import("./creator/CreatorLayout"));
const CreatorDashboard = lazy(() => import("./creator/CreatorDashboard"));
const CreatorChannelSettings = lazy(() => import("./creator/CreatorChannelSettings"));
const CreatorCreateImpulse = lazy(() => import("./creator/CreatorCreateImpulse"));
const CreatorMaterials = lazy(() => import("./creator/CreatorMaterials"));
const CreatorAudience = lazy(() => import("./creator/CreatorAudience"));
const CreatorAmbassadors = lazy(() => import("./creator/CreatorAudience").then((m) => ({ default: m.CreatorAmbassadors })));
const CreatorInteractions = lazy(() => import("./creator/CreatorInteractions"));
const CreatorAnalytics = lazy(() => import("./creator/CreatorAnalytics"));
const CreatorLinks = lazy(() => import("./creator/CreatorLinks"));
const CreatorSettings = lazy(() => import("./creator/CreatorSettings"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Klamry są celowe: scrollTo może zwracać Promise, a efekt nie może go zwrócić.
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Mapa tras:
 *   /            landing page
 *   /k/:slug     zaproszenie do kanału twórcy (wejście odbiorcy z linku)
 *   /app/*       aplikacja odbiorcy
 *   /studio/*    panel twórcy
 */
export default function App() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-paper" />}>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/k/:slug/*" element={<CreatorInvitePage />} />
        <Route path="/app/start" element={<OnboardingPage />} />
        <Route path="/app" element={<RecipientLayout />}>
          <Route index element={<UserChannelHome />} />
          <Route path="wideo" element={<UserVideosPage />} />
          <Route path="wideo/:id" element={<UserVideoPage />} />
          <Route path="narzedzia" element={<UserToolsPage />} />
          <Route path="narzedzia/:id" element={<UserToolPage />} />
          <Route path="pliki" element={<UserFilesPage />} />
          <Route path="czat" element={<ChatRoute />} />
          <Route path="profil" element={<UserProfilePage />} />
          <Route path="powiadomienia" element={<UserNotificationsPage />} />
        </Route>

        <Route path="/studio" element={<CreatorLayout />}>
          <Route index element={<CreatorDashboard />} />
          <Route path="kanal" element={<CreatorChannelSettings />} />
          <Route path="impuls" element={<CreatorCreateImpulse />} />
          <Route path="materialy" element={<CreatorMaterials />} />
          <Route path="odbiorcy" element={<CreatorAudience />} />
          <Route path="ambasadorzy" element={<CreatorAmbassadors />} />
          <Route path="interakcje" element={<CreatorInteractions />} />
          <Route path="analityka" element={<CreatorAnalytics />} />
          <Route path="linki" element={<CreatorLinks />} />
          <Route path="ustawienia" element={<CreatorSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
