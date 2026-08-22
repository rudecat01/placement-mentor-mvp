import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PracticeWorkspace from './components/PracticeWorkspace';
import ResumeDoctor from './components/ResumeDoctor';
import MockInterviewRoom from './components/MockInterviewRoom';
import CompanyPrepHub from './components/CompanyPrepHub';
import WhatIfSimulator from './components/WhatIfSimulator';
import OnboardingModal from './components/OnboardingModal';
import SettingsModal from './components/SettingsModal';
import { api } from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProblemId, setSelectedProblemId] = useState(null);
  const [readinessScore, setReadinessScore] = useState(74);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadInitialState();
  }, []);

  const loadInitialState = async () => {
    try {
      const [profData, readyData] = await Promise.all([
        api.getProfile(),
        api.getReadinessScore()
      ]);
      setProfile(profData);
      setReadinessScore(readyData.readiness_score);
    } catch (err) {
      console.error('Failed to load initial state:', err);
    }
  };

  const handleMasteryChange = async () => {
    try {
      const readyData = await api.getReadinessScore();
      setReadinessScore(readyData.readiness_score);
    } catch (err) {
      console.error('Failed to refresh readiness:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        readinessScore={readinessScore}
        profile={profile}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, maxWidth: '1440px', width: '100%', margin: '0 auto', padding: '24px 32px' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            setActiveTab={setActiveTab} 
            setSelectedProblemId={setSelectedProblemId} 
          />
        )}

        {activeTab === 'practice' && (
          <PracticeWorkspace 
            selectedProblemId={selectedProblemId} 
            onMasteryChange={handleMasteryChange}
          />
        )}

        {activeTab === 'resume' && (
          <ResumeDoctor />
        )}

        {activeTab === 'interview' && (
          <MockInterviewRoom />
        )}

        {activeTab === 'company' && (
          <CompanyPrepHub 
            onSelectProblem={setSelectedProblemId}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'whatif' && (
          <WhatIfSimulator />
        )}
      </main>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => loadInitialState()}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '20px 32px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Placement Mentor 2.0 • Autonomous Multi-Agent Career Acceleration • Closed-Loop BKT & PTG Architecture
      </footer>

    </div>
  );
}
