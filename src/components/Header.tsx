import React, { useEffect, useState } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { userGesture, setMuted, subscribeMuted, isMuted, startBackground } from "../classes/SoundManager";

const Header: React.FC = () => {
    const [muted, setLocalMuted] = useState<boolean>(isMuted());

    useEffect(() => {
      const unsub = subscribeMuted((m) => setLocalMuted(m));
      return () => unsub();
    }, []);

    const toggle = () => {
        if (muted) {
            userGesture();
            setMuted(false);
            startBackground();
        } else {
            setMuted(true);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
            <div className="w-full flex justify-end p-2">
                <button
                    type="button"
                    onClick={toggle}
                    aria-pressed={muted}
                    aria-label={muted ? "Unmute" : "Mute"}
                    className="w-12 h-12 flex items-center justify-center rounded-md p-2 text-white transform transition-transform duration-150 ease-in-out hover:scale-110"
                >
                    {muted ? (
                        <SpeakerXMarkIcon className="w-8 h-8" aria-hidden="true" />
                    ) : (
                        <SpeakerWaveIcon className="w-8 h-8" aria-hidden="true" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default Header;