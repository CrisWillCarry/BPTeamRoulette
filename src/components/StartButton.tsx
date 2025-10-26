import React from "react";
import { playClick, playHover } from "../classes/SoundManager";

type StartButtonProps = {
  started?: boolean;
  onClick?: () => void;
};

const StartButton: React.FC<StartButtonProps> = ({ onClick }) => {
    const onStart = () => {
        playClick();
        onClick?.();
    };
   
    return (
        <button
          className="text-6xl bg-red-600 hover:bg-red-700 text-white font-mono py-4 px-18 rounded hover:cursor-pointer hover:scale-110 transition-transform duration-150 ease-in-out"
          onClick={onStart}
          onMouseEnter={() => playHover()}
        >
            Start
        </button>
    );
};

export default StartButton