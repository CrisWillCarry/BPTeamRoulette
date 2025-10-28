import React, { useEffect, useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import type { Player } from "../objects/Player";
import PlayerDisplay from "./PlayerDisplay";
import CustomSelect from "./CustomSelect";
import SpinButton from "./SpinButton";
import { playMusic, startBackground, stopBackground, stopMusic } from "../classes/SoundManager";
import SpinView from "./SpinView";
import type { Team } from "../objects/Team";
import { TEAMS } from "../constants/Teams";

export default function Board(): React.ReactElement {
  const { list, addTeam } = usePlayers();
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
    stopBackground();
    playMusic("tigrinho");
    };

  const handleSpinEnd = (winnerTeam?: Team) => {
    // winnerTeam is the Team chosen by the spin view
    setIsSpinning(false);
    stopMusic();
    startBackground();

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
    
  return (
    <div className="flex justify-between items-center gap-4 p-4 h-full box-border text-white">
    {!isSpinning && (
      <>
        <div className="flex-1">
            <div
            className="mb-2 text-7xl pr-10 font-medium text-center"
            style={{ fontFamily: '"Arcady", "Press Start 2P", monospace' }}
            >
            Jogador 1
            </div>

            <CustomSelect
                options={[{ label: "— escolha jogador —", value: "" }, ...optionList]}
                value={player1Index === "" ? "" : player1Index}
                onChange={(v) => {
                  setPlayer1Index(v === "" ? "" : (v as number));
                  setTeam1Index(null);
                }}
                className="w-full mt-5"
            />

            {typeof player1Index === "number" && !isSpinning && (
                <>
                <PlayerDisplay playerIndex={player1Index} playerOptions={playerOptions} />
                {team1Index !== null ? (
                  <div className="flex justify-center mt-4">
                    <img
                      src={`/images/teams/${teams[team1Index].name.replace(" ", "_")}.png`}
                      alt={teams[team1Index].name}
                      className="w-32 object-contain"
                    />
                  </div>
                ) : (
                  <SpinButton onSpin={() => spin(player1Index)} />
                )}
                </>
            )}
        </div>

        <div className="flex items-center justify-center self-center">
            <img src="/images/vs.png" alt="Versus" className="h-32 md:h-48 lg:h-64 block" />
        </div>

        <div className="flex-1text-center">
            <div
            className="mb-2 text-7xl pl-10"
            style={{ fontFamily: '"Arcady", "Press Start 2P", monospace' }}
            >
            Jogador 2
            </div>

            <CustomSelect
                options={[{ label: "— escolha jogador —", value: "" }, ...optionList]}
                value={player2Index === "" ? "" : player2Index}
                onChange={(v) => {
                  setPlayer2Index(v === "" ? "" : (v as number));
                  setTeam2Index(null);
                }}
                className="w-full mt-5"
            />
            {typeof player2Index === "number" && (
                <>
                  <PlayerDisplay playerIndex={player2Index} playerOptions={playerOptions} />
                  {team2Index !== null ? (
                    <div className="flex justify-center mt-4">
                      <img
                        src={`/images/teams/${teams[team2Index].name.replace(" ", "_")}.png`}
                        alt={teams[team2Index].name}
                        className="w-32 object-contain"
                      />
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
            />
        )}
    </div>
  );
}