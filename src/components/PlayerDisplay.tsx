import React, { useState } from "react";
import type { Player } from "../objects/Player";
import type { Team } from "../objects/Team";
import { playerManager } from "../classes/PlayerManager";
import { playClick, playHover } from "../classes/SoundManager";

const PlayerDisplay: React.FC<{ playerIndex: number; playerOptions: Player[] }> = ({ playerIndex, playerOptions }) => {
    const player = playerOptions[playerIndex];
    const previousTeams = player?.previousTeams || [] as Team[];
    const [hovered, setHovered] = useState(false);
    const [showAdd, setShowAdd] = useState(false);

    if (!player) return null;

    return (
        <div className="relative inline-block w-full align-top">
            {/* image wrapper - fixed height so card size never changes */}
            <div
                className="relative group cursor-pointer h-[360px] md:h-[60vh] overflow-hidden"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
                onClick={() => setShowAdd(s => !s)}
            >
                <img
                    src={`/images/players/${player.name.replace(" ", "_")}.png`}
                    alt={player.name}
                    className="w-full h-full object-contain block"
                />

                {/* Add token button (appears when card clicked) */}
                <div className="pointer-events-none">
                  {showAdd && player.tokens < 2 && (
                    <div className="absolute inset-0 flex items-end justify-center pb-6 pointer-events-auto">
                      <button
                        type="button"
                        onMouseEnter={playHover}
                        onClick={(e) => {
                          e.stopPropagation();
                          playerManager.addToken(player.id);
                          playClick();
                          setShowAdd(false);
                        }}
                        className="bg-gray-300 text-black font-serif px-4 py-2 rounded shadow-lg hover:scale-105 transform transition hover:cursor-pointer border-2 border-amber-400"
                        aria-label={`Adicionar token`}
                      >
                        + Token
                      </button>
                    </div>
                  )}
                </div>

                {/* overlay: centered, subtle, small team icons */}
                {previousTeams.length > 0 && (
                    <div
                        // show on hover (both CSS group-hover and react state for robustness)
                        className={
                            "pointer-events-none absolute inset-0 flex items-center justify-center " +
                            "transition-all duration-200 ease-out " +
                            (hovered ? "opacity-100 scale-100" : "opacity-0 scale-95") +
                            " group-hover:opacity-100 group-hover:scale-100"
                        }
                        aria-hidden={!hovered}
                    >
                        <div className="bg-black/40 backdrop-blur-sm rounded-md px-3 py-2 flex items-center gap-2">
                            {previousTeams.map((team, index) => (
                                <img
                                    key={index}
                                    src={`/images/teams/${team.name.replace(" ", "_")}.png`}
                                    alt={team.name}
                                    className="h-8 w-auto rounded opacity-95"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PlayerDisplay;