import React, { useEffect, useState } from "react";
import { usePlayers } from "../hooks/usePlayers";
import type { Player } from "../objects/Player";
import PlayerDisplay from "./PlayerDisplay";
import CustomSelect from "./CustomSelect";

export default function Board(): React.ReactElement {
  const { list } = usePlayers();
  const playerOptions: Player[] = list();

  const [player1Index, setPlayer1Index] = useState<number | "">(
    playerOptions.length > 0 ? 0 : ""
  );
  const [player2Index, setPlayer2Index] = useState<number | "">(
    playerOptions.length > 1 ? 1 : ""
  );

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

  return (
    <div className="flex justify-between items-center gap-4 p-4 h-full box-border text-white">
      <div className="flex-1">
        <div
          className="mb-2 text-7xl pr-10 font-medium text-center"
          style={{ fontFamily: '"Arcady", "Press Start 2P", monospace' }}
        >
          Jogador 1
        </div>

        <CustomSelect
            options={[{ label: "— select player —", value: "" }, ...optionList]}
            value={player1Index === "" ? "" : player1Index}
            onChange={(v) => setPlayer1Index(v === "" ? "" : (v as number))}
            className="w-full mt-5"
          />

        {typeof player1Index === "number" && (
            <PlayerDisplay playerIndex={player1Index} playerOptions={playerOptions} />
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
            options={[{ label: "— select player —", value: "" }, ...optionList]}
            value={player2Index === "" ? "" : player2Index}
            onChange={(v) => setPlayer2Index(v === "" ? "" : (v as number))}
            className="w-full mt-5"
          />
          {typeof player2Index === "number" && (
            <PlayerDisplay playerIndex={player2Index} playerOptions={playerOptions} />
          )}
      </div>
    </div>
  );
}