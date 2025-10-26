import React, { useState } from "react";
import type { Player } from "../objects/Player";
import type { Team } from "../objects/Team";

const PlayerDisplay: React.FC<{ playerIndex: number; playerOptions: Player[] }> = ({ playerIndex, playerOptions }) => {
    const player = playerOptions[playerIndex];
    const previousTeams = player?.previousTeams || [] as Team[];
    const [hovered, setHovered] = useState(false);

    if (!player) return null;

    return (
        <div className="relative inline-block w-full">
            {/* image wrapper - use group so CSS hover also works */}
            <div
                className="relative group"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onFocus={() => setHovered(true)}
                onBlur={() => setHovered(false)}
            >
                <img
                    src={`/images/players/${player.name.replace(" ", "_")}.png`}
                    alt={player.name}
                    className="mt-4 w-full h-auto max-h-[60vh] object-contain block"
                />

                {/* overlay: centered, subtle, small team icons */}
                {previousTeams.length > 0 && (
                    <div
                        // show on hover (both CSS group-hover and react state for robustness)
                        className={
                            "pointer-events-none absolute inset-0 flex items-center justify-center " +
                            "transition-all duration-200 ease-out " +
                            (hovered ? "opacity-100 scale-100" : "opacity-0 scale-95") +
                            " group-hover:opacity-100 group-hover:scale-100 mt-10"
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