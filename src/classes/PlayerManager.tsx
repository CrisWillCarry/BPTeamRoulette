import type { Player } from "../objects/Player";
import { PLAYERS } from "../constants/Players";

type Subscriber = (playersById: Record<number, Player>) => void;
const STORAGE_KEY = "bptr_players_v5";

export default class PlayerManager {
  private playersById: Record<number, Player> = {};
  private subs: Subscriber[] = [];

  constructor() {
    this.load();
  }

  private load() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        this.playersById = JSON.parse(raw) as Record<number, Player>;
        return;
      } catch {}
    }
    // seed from constants
    this.playersById = PLAYERS.reduce((acc, p) => {
      acc[p.id] = { ...p, previousTeams: [...p.previousTeams], tokens: p.tokens };
      return acc;
    }, {} as Record<number, Player>);
    this.persist();
  }

  private persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.playersById));
  }

  private notify() {
    this.subs.forEach((s) => s(this.getAllById()));
  }

  getAll(): Player[] {
    return Object.values(this.playersById).map(p => ({ ...p, previousTeams: [...p.previousTeams] }));
  }

  getAllById(): Record<number, Player> {
    // return a shallow copy to avoid external mutation
    return { ...this.playersById };
  }

  get(id: number): Player | undefined {
    const p = this.playersById[id];
    return p ? { ...p, previousTeams: [...p.previousTeams] } : undefined;
  }

  addPreviousTeam(playerId: number, team: any) {
    const p = this.playersById[playerId];
    if (!p) return false;
    // avoid duplicates (adjust equality as needed)
    if (!p.previousTeams.find(t => t.id === team.id)) {
      this.playersById[playerId] = {
        ...p,
        previousTeams: [...p.previousTeams, team],
      };
      this.persist();
      this.notify();
    }
    return true;
  }

  removePreviousTeams(playerId: number) {
    const p = this.playersById[playerId];
    if (!p) return false;
    this.playersById[playerId] = {
      ...p,
      previousTeams: [],
    };
    this.persist();
    this.notify();
    return true;
  }

  removePreviousTeam(playerId: number, teamId: number) {
    const p = this.playersById[playerId];
    if (!p) return false;
    this.playersById[playerId] = {
      ...p,
      previousTeams: p.previousTeams.filter(t => t.id !== teamId),
    };
    this.persist();
    this.notify();
    return true;
  }

  removeToken(playerId: number, amount: number = 1) {
    const p = this.playersById[playerId];
    if (!p) return false;
    this.playersById[playerId] = {
      ...p,
      tokens: Math.max(0, p.tokens - amount),
    };
    this.persist();
    this.notify();
    return true;
  }

  subscribe(cb: Subscriber) {
    this.subs.push(cb);
    cb(this.getAllById());
    return () => { this.subs = this.subs.filter(s => s !== cb); };
  }

  addToken(playerId: number, amount: number = 1) {
    const p = this.playersById[playerId];
    if (!p) return false;
    this.playersById[playerId] = {
      ...p,
      tokens: p.tokens + amount,
    };
    this.persist();
    this.notify();
    return true;
  } 
}

export const playerManager = new PlayerManager();