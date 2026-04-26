import React, { useEffect, useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import type { Player } from "../objects/Player";
import PlayerDisplay from "./PlayerDisplay";
import CustomSelect from "./CustomSelect";
import SpinButton from "./SpinButton";
import { playClick, playHover, playMusic, startBackground, stopBackground, stopMusic } from "../classes/SoundManager";
import SpinView from "./SpinView";
import type { Team } from "../objects/Team";
import { TEAMS } from "../constants/Teams";
import { ArrowPathIcon } from "@heroicons/react/24/solid";

export default function Board(): React.ReactElement {
  const { list, addTeam, removePreviousTeam, removeToken } = usePlayers();
  const playerOptions: Player[] = list();
  const teams : Team[] = TEAMS;

  const [team1Index, setTeam1Index] = useState<number | null>(null);
  const [team2Index, setTeam2Index] = useState<number | null>(null);

  const [player1Index, setPlayer1Index] = useState<number | "">(
    playerOptions.length > 0 ? 0 : ""
  );
  const [player2Index, setPlayer2Index] = useState<number | "">(
    playerOptions.length > 1 ? 1 : ""
  );

  const [spinPlayerIndex, setSpinPlayerIndex] = useState<number | null>(null);
  const [playedRapariga, setPlayedRapariga] = useState(false);
  // keep indices valid if playerOptions changes
  useEffect(() => {
    if (player1Index === "") setPlayer1Index(0);
    if (player2Index === "") setPlayer2Index(1);
    if (typeof player1Index === "number" && player1Index >= playerOptions.length) {
      setPlayer1Index(playerOptions.length - 1);
    }
    if (typeof player2Index === "number" && player2Index >= playerOptions.length) {
      setPlayer2Index(playerOptions.length - 1);
    }
  }, [playerOptions, player1Index, player2Index]);

  const optionList = playerOptions.map((player, index) => ({
    label: player.name,
    value: index,
  }));

  const [isSpinning, setIsSpinning] = useState(false);

  const spin = (playerIndex: number) => {
    setIsSpinning(true);
    setSpinPlayerIndex(playerIndex);
    
    const shouldPlayRapariga = Math.random() < 0.1;
    setPlayedRapariga(shouldPlayRapariga);
    
    if (shouldPlayRapariga) {
      stopBackground();
      playMusic("rapariga");
    }
  };

  const handleTeamRevealed = (winnerTeam: Team) => {
    // Stop whatever is playing (background or rapariga) and play the hino
    stopBackground();
    stopMusic();
    
    if (winnerTeam) {
      playMusic(`hinos/${winnerTeam.name.replace(/ /g, "_")}`);
    }
  };

  const handleSpinEnd = (winnerTeam?: Team) => {
    // User clicked continue - stop hino and restart background
    stopMusic();
    startBackground();
    setPlayedRapariga(false);
    setIsSpinning(false);

    if(spinPlayerIndex === player1Index) {
      setTeam1Index(winnerTeam ? teams.indexOf(winnerTeam) : team1Index);
    } else if(spinPlayerIndex === player2Index) {
      setTeam2Index(winnerTeam ? teams.indexOf(winnerTeam) : team2Index);
    }
    // TODO: apply winner effects (e.g., add to player's previous teams or UI reveal)
    if (typeof spinPlayerIndex === "number" && winnerTeam) {
      const player = playerOptions[spinPlayerIndex];
      if (!player) {
        console.warn("No player found for index", spinPlayerIndex);
        return;
      }
      // use player.id (not the index)
      addTeam(player.id, winnerTeam);
    }
    setSpinPlayerIndex(null);
  };

  const reroll = (playerIndex: number | "", teamIndex: number | "") => {
    if (typeof playerIndex === "number" && typeof teamIndex === "number") {
      removePreviousTeam(playerOptions[playerIndex].id, teams[teamIndex].id);
      removeToken(playerOptions[playerIndex].id);
      spin(playerIndex);
    }
  };
  return (
    // stacked on small screens, row on md+
    <div className="flex flex-col md:flex-row justify-between items-start gap-4 p-4 h-full box-border text-white">
    {!isSpinning && (
      <>
        <div className="flex-1 w-full">
            <div
            className="mb-2 text-4xl sm:text-6xl md:text-7xl pr-10 font-medium text-center"
            style={{ fontFamily: '"Arcady", "Press Start 2P", monospace' }}
            >
            Jogador 1
            </div>

            <CustomSelect<number | "">
                options={[{ label: "— escolha jogador —", value: "" as number | "" }, ...optionList]}
                value={player1Index === "" ? "" : player1Index}
                onChange={(v) => {
                  setPlayer1Index(v === "" ? "" : v);
                  setTeam1Index(null);
                }}
                className="w-full mt-5"
            />

            {typeof player1Index === "number" && !isSpinning && (
                <>
                <PlayerDisplay playerIndex={player1Index} playerOptions={playerOptions} />
                {team1Index !== null ? (
                  <div className="flex flex-col items-center mt-4 min-h-52">
                    <img
                      src={`/images/teams/${teams[team1Index].name.replace(" ", "_")}.png`}
                      alt={teams[team1Index].name}
                      className="w-32 object-contain"
                    />
                    {playerOptions[player1Index].tokens > 0 && (
                      <>
                      <button
                        onClick={() => {
                          reroll(player1Index, team1Index);
                          playClick();
                        }}
                        title="Reroll"
                        aria-label="Reroll"
                        className="mt-2 text-white font-semibold py-1 px-2 rounded flex items-center gap-2 bg-transparent focus:outline-none hover:cursor-pointer"
                        onMouseEnter={playHover}
                      >
                        <ArrowPathIcon className="w-8 h-8 text-white" aria-hidden="true" />
                      </button>
                      <p className="text-white">Tokens: {playerOptions[player1Index].tokens}</p>
                        </>
                    )}
                  </div>
                ) : (
                  <SpinButton onSpin={() => spin(player1Index)} />
                )}
                </>
            )}
        </div>

        {/* VS image: center in both stacked and row layouts */}
        <div className="flex items-center justify-center self-center md:self-center">
            <img src="/images/vs.png" alt="Versus" className="h-20 sm:h-28 md:h-48 lg:h-64 block" />
        </div>

        <div className="flex-1 w-full text-center">
            <div
            className="mb-2 text-4xl sm:text-6xl md:text-7xl pl-10"
            style={{ fontFamily: '"Arcady", "Press Start 2P", monospace' }}
            >
            Jogador 2
            </div>

            <CustomSelect<number | "">
                options={[{ label: "— escolha jogador —", value: "" as number | "" }, ...optionList]}
                value={player2Index === "" ? "" : player2Index}
                onChange={(v) => {
                  setPlayer2Index(v === "" ? "" : v);
                  setTeam2Index(null);
                }}
                className="w-full mt-5"
            />
            {typeof player2Index === "number" && (
                <>
                  <PlayerDisplay playerIndex={player2Index} playerOptions={playerOptions} />
                  {team2Index !== null ? (
                    <div className="flex flex-col items-center mt-4 min-h-52">
                        <img
                          src={`/images/teams/${teams[team2Index].name.replace(" ", "_")}.png`}
                          alt={teams[team2Index].name}
                          className="w-32 object-contain"
                        />
                        {playerOptions[player2Index].tokens > 0 && (
                          <>
                         <button
                            onClick={() => {
                              reroll(player2Index, team2Index);
                              playClick();
                            }}
                            title="Reroll"
                            aria-label="Reroll"
                            className="mt-2 text-white font-semibold py-1 px-2 rounded flex items-center gap-2 bg-transparent focus:outline-none hover:cursor-pointer"
                            onMouseEnter={playHover}
                          >
                            <ArrowPathIcon className="w-8 h-8 text-white" aria-hidden="true" />
                          </button>
                          <p className="text-white">Tokens: {playerOptions[player2Index].tokens}</p>
                          </>
                        )}
                      </div>
                  ) : (
                    <div className="flex justify-center mt-4">
                      <SpinButton onSpin={() => spin(player2Index)} />
                    </div>
                  )}
                </>
            )}
        </div>
      </>
      )}
        {isSpinning && spinPlayerIndex !== null && (
            <SpinView
            teams={teams}
            onFinish={(winner) => handleSpinEnd(winner)}
            onReveal={(winner) => handleTeamRevealed(winner)}
            />
        )}
    </div>
  );
}