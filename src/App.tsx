import React from 'react';
import './App.css';
import { PageLayout } from './components/PageLayout';
import Logo from './components/Logo';
import StartButton from './components/StartButton';

const App: React.FC = () => {
  return (
    <PageLayout>
     <div className="w-full h-full flex flex-col items-center justify-center">
        <Logo />
        <StartButton />
      </div>
    </PageLayout>
  );
};

export default App;