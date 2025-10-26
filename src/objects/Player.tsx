import type { Team } from "./Team";

export type Player = {
    id: number;
    name: string;
    previousTeams: Team[];
};