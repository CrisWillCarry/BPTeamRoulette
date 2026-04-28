import React from "react";
import { playHover } from "../classes/SoundManager";

const SpinButton: React.FC<{ onSpin: () => void }> = ({ onSpin }) => {
    return (
        <button
            onClick={onSpin}
            onMouseEnter={()=>playHover()}
            className="mx-auto bg-red-600 text-white text-center font-mono py-2 px-6 sm:px-8 rounded-lg hover:cursor-pointer hover:scale-105 transition-transform duration-150 ease-in-out flex items-center justify-center text-lg sm:text-xl"
        >
        Sortear
        </button>
    );
};

export default SpinButton;
