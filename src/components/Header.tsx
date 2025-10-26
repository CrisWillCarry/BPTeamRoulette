import React, { useEffect, useState } from "react";
import { SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid';
import { userGesture, setMuted, subscribeMuted, isMuted, startBackground } from "../classes/SoundManager";

const Header: React.FC = () => {
    const [muted, setLocalMuted] = useState<boolean>(isMuted());

    useEffect(() => {
      // subscribe to changes from sound manager
      const unsub = subscribeMuted((m) => setLocalMuted(m));
      return () => unsub();
    }, []);

    const toggle = () => {
        if (muted) {
            // clicking "unmute" is a user gesture -> allow playback
            userGesture();
            setMuted(false);
            // try to start background immediately
            startBackground();
        } else {
            setMuted(true);
        }
    };

    return (
        <div className="fixed top-2 right-2 z-50 pointer-events-auto">
            <button
                type="button"
                onClick={toggle}
                aria-pressed={muted}
                aria-label={muted ? "Unmute" : "Mute"}
                className="w-12 h-12 flex items-center justify-center rounded-md p-2 text-white transform transition-transform duration-150 ease-in-out hover:scale-150 hover:cursor-pointer"
            >
                {muted ? (
                    <SpeakerXMarkIcon className="w-8 h-8" aria-hidden="true" />
                ) : (
                    <SpeakerWaveIcon className="w-8 h-8" aria-hidden="true" />
                )}
            </button>
        </div>
    );
};

export default Header;