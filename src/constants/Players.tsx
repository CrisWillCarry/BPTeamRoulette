import type { Player } from "../objects/Player";
import { TEAMS } from "./Teams";

export const PLAYERS: Player[] = [
    { id: 1, name: 'Henrique', previousTeams: [] },
    { id: 2, name: 'Cristian', previousTeams: [TEAMS[6], TEAMS[13], TEAMS[15], TEAMS[16]] }, 
    { id: 3, name: 'Vinicius', previousTeams: [] },
    { id: 4, name: 'Lucas Fiuza', previousTeams: [] },
    { id: 5, name: 'Kane', previousTeams: [] },
    { id: 6, name: 'Leonardo', previousTeams: [] },
    { id: 7, name: 'Dan', previousTeams: [] },
    { id: 8, name: 'Emerson', previousTeams: [TEAMS[6]] },
    { id: 9, name: 'João', previousTeams: [] },
    { id: 10, name: 'Paulo Cesar', previousTeams: [] },
    { id: 11, name: 'Marquinhos', previousTeams: [] },
    { id: 12, name: 'Miguel', previousTeams: [] },
];