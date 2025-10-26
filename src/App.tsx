import React from 'react';
import './App.css';
import { PageLayout } from './components/PageLayout';
import Board from './components/Board';
import Logo from './components/Logo';
import StartButton from './components/StartButton';

const App: React.FC = () => {

  const [started, setStarted] = React.useState(false);
  return (
    <PageLayout>
     <div className="w-full h-full flex flex-col items-center justify-center">
        {!started ? (
          <>
            <Logo />
            <StartButton onClick={() => setStarted(true)} />
          </>
        ) : (
          <Board />
        )}
      </div>
    </PageLayout>
  );
};

export default App;