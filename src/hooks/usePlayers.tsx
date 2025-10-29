import { useEffect, useState } from "react";
import { playerManager } from "../classes/PlayerManager";
import type { Player } from "../objects/Player";

export function usePlayers() {
  const [players, setPlayers] = useState<Record<number, Player>>(playerManager.getAllById());

  useEffect(() => playerManager.subscribe(setPlayers), []);

  return {
    players,
    list: () => Object.values(players),
    addTeam: (playerId: number, team: any) => playerManager.addPreviousTeam(playerId, team),
    removeTeams: (playerId: number) => playerManager.removePreviousTeams(playerId),
    removePreviousTeam: (playerId: number, team: number) => playerManager.removePreviousTeam(playerId, team),
    addToken: (playerId: number) => playerManager.addToken(playerId),
    removeToken: (playerId: number) => playerManager.removeToken(playerId),
  };
}