import React from 'react';
import './App.css';
import { PageLayout } from './components/PageLayout';

const App: React.FC = () => {
  return (
    <PageLayout>
      <div className="w-full h-full flex items-center justify-center">
        <p className="text-white text-center">Hello World</p>
      </div>
    </PageLayout>
  );
};

export default App;