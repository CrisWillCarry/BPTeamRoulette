import React from "react";
import type { Team } from "../objects/Team";
import { playClick, playHover, playMusic, stopMusic } from "../classes/SoundManager";

type Props = {
  teams: Team[];
  onFinish: (winner: Team) => void;
  className?: string;
};

type Phase = "shrink" | "merge" | "spin" | "reveal" | "announce";

type State = {
  visible: Team[];
  phase: Phase;
  currentIndex: number;
  winner: Team | null;
  revealStarted: boolean;
};

function removeRandom<T>(arr: T[]) {
  if (arr.length === 0) return arr;
  const i = Math.floor(Math.random() * arr.length);
  return arr.slice(0, i).concat(arr.slice(i + 1));
}

export default class SpinView extends React.Component<Props, State> {
  private mounted = false;
  private timers: number[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      visible: [...props.teams],
      phase: "shrink",
      currentIndex: 0,
      winner: null,
      revealStarted: false,
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.startSequenceFromProps();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    if (prevProps.teams !== this.props.teams) {
      this.startSequenceFromProps();
    }

    // if phase changed to spin, start spin
    if (prevState.phase !== this.state.phase && this.state.phase === "spin") {
      this.startSpin();
    }

    // if phase changed to reveal, start reveal routine
    if (prevState.phase !== this.state.phase && this.state.phase === "reveal") {
      this.startReveal();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
    this.clearTimers();
  }

  private pushTimer(id: number) {
    this.timers.push(id);
  }

  private clearTimers() {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers = [];
  }

  private startSequenceFromProps() {
    this.clearTimers();
    if (!this.mounted) return;

    const initialTeams = this.props.teams || [];
    // reset state
    this.setState({
      visible: [...initialTeams],
      phase: "shrink",
      currentIndex: 0,
      winner: null,
      revealStarted: false,
    });

    // fast path: already <= 3
    if (initialTeams.length <= 3) {
      const t = window.setTimeout(() => {
        if (!this.mounted) return;
        this.setState({ visible: initialTeams.slice(0, 3), phase: "merge" });
        const t2 = window.setTimeout(() => {
          if (!this.mounted) return;
          this.setState({ phase: "spin" });
        }, 350);
        this.pushTimer(t2);
      }, 20);
      this.pushTimer(t);
      return;
    }

    // schedule removals until 3 remain
    const toRemove = initialTeams.length - 3;
    let totalDelay = 0;
    for (let i = 0; i < toRemove; i++) {
      const delay = 140 + i * 45;
      totalDelay += delay;
      const id = window.setTimeout(() => {
        if (!this.mounted) return;
        this.setState((prev) => {
          if (prev.visible.length <= 3) return prev;
          return { visible: removeRandom(prev.visible) };
        });
      }, totalDelay);
      this.pushTimer(id);
    }

    // after removals, move to merge
    const t = window.setTimeout(() => {
      if (!this.mounted) return;
      this.setState({ phase: "merge" });
      const t2 = window.setTimeout(() => {
        if (!this.mounted) return;
        this.setState({ phase: "spin" });
      }, 350);
      this.pushTimer(t2);
    }, totalDelay + 160);
    this.pushTimer(t);
  }

  private startSpin() {
    this.clearTimers();
    if (!this.mounted) return;

    const pool = this.state.visible.slice(0, 3);
    if (pool.length === 0) {
      this.setState({ phase: "reveal" });
      return;
    }

    const finalIndex = Math.floor(Math.random() * pool.length);
    const steps = 10 + Math.floor(Math.random() * 18); // shorter spin
    const startDelay = 35;
    const endDelay = 220;

    let cumulative = 0;
    for (let step = 0; step <= steps; step++) {
      const progress = step / steps;
      const delay = startDelay + Math.pow(progress, 2) * (endDelay - startDelay);
      cumulative += delay;
      const id = window.setTimeout(() => {
        if (!this.mounted) return;
        this.setState((s) => ({ currentIndex: (s.currentIndex + 1) % pool.length }));
      }, Math.floor(cumulative));
      this.pushTimer(id);
    }

    const extras = 4 + Math.floor(Math.random() * 4);
    for (let e = 0; e <= extras; e++) {
      const progress = (steps + e) / (steps + extras);
      const delay = startDelay + Math.pow(progress, 2) * (endDelay - startDelay);
      cumulative += delay;
      const id = window.setTimeout(() => {
        if (!this.mounted) return;
        this.setState((s) => ({ currentIndex: (s.currentIndex + 1) % pool.length }));
      }, Math.floor(cumulative));
      this.pushTimer(id);
    }

    const finalDelay = cumulative + endDelay;
    const finalId = window.setTimeout(() => {
      if (!this.mounted) return;

      // hide logos immediately after spin finishes
      this.setState({ currentIndex: finalIndex, visible: [] });
      stopMusic();
      console.log("Playing music for", pool[finalIndex].name);
      playMusic(`hinos/${pool[finalIndex].name.replace(/ /g, "_")}`);
            // wait 4 seconds with no logos shown, then reveal the winner
      const revealDelay = 4000;
      const revealId = window.setTimeout(() => {
        if (!this.mounted) return;
        const chosen = pool[finalIndex];
        this.setState({ winner: chosen, phase: "reveal" });
      }, revealDelay);
      this.pushTimer(revealId);
    }, Math.floor(finalDelay));
    this.pushTimer(finalId);
  }

  private startReveal() {
    this.clearTimers();
    if (!this.mounted) return;

    // hide the grid immediately
    this.setState({ visible: [], revealStarted: false });

    // small kick to let initial style apply then rise
    const kick = window.setTimeout(() => {
      if (!this.mounted) return;
      this.setState({ revealStarted: true });
    }, 50);
    this.pushTimer(kick);

    // after ~5s (rise duration) move to announce
    const announce = window.setTimeout(() => {
      if (!this.mounted) return;
      this.setState({ phase: "announce" });
    }, 50 + 5000);
    this.pushTimer(announce);
  }

  private handleContinue = () => {
    const { winner } = this.state;
    if (!winner) return;
    this.clearTimers();
    this.props.onFinish(winner);
  };

  render() {
    const { className } = this.props;
    const { visible, phase, currentIndex, winner, revealStarted } = this.state;

    return (
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 ${className}`} aria-live="polite">
        <div className="relative w-full max-w-3xl p-4 sm:p-6 min-h-[280px] sm:min-h-[420px]">
          {phase === "shrink" && (
            <div className="grid grid-cols-6 gap-3 place-items-center">
              {visible.map((t, i) => (
                <img
                  key={t.id + "-" + i}
                  src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                  alt={t.name}
                  className="h-20 w-auto transition-opacity duration-200 ease-out"
                />
              ))}
            </div>
          )}

          {phase === "merge" && (
            <div className="flex items-center justify-center gap-6">
              {visible.slice(0, 3).map((t, i) => (
                <img
                  key={t.id + "-" + i}
                  src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                  alt={t.name}
                  className="h-20 sm:h-28 w-auto transform transition-all duration-400 ease-out"
                  style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }}
                />
              ))}
            </div>
          )}

          {phase === "spin" && visible.slice(0, 3).length > 0 && (
            <div className="flex items-center justify-center">
              <div className="relative flex items-center justify-center" style={{ width: "min(64vw, 320px)", height: "min(64vw, 320px)" }}>
                {visible.slice(0, 3).map((t, i) => {
                  const isActive = i === currentIndex;
                  return (
                    <img
                      key={t.id + "-" + i}
                      src={`/images/teams/${t.name.replace(/ /g, "_")}.png`}
                      alt={t.name}
                      className={`absolute transition-all duration-150 ease-out ${isActive ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
                      style={{
                        width: "min(56vw, 280px)",
                        height: "auto",
                        zIndex: isActive ? 30 : 10,
                        filter: isActive ? "drop-shadow(0 10px 30px rgba(0,0,0,0.7))" : "none",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {phase === "reveal" && winner && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
              <img
                src={`/images/teams/${winner.name.replace(/ /g, "_")}.png`}
                alt={winner.name}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: revealStarted ? "50%" : "100%",
                  transform: revealStarted ? "translate(-50%,-50%) scale(1)" : "translate(-50%,0) scale(0.98)",
                  transition: "top 5000ms cubic-bezier(.22,.9,.2,1), transform 5000ms cubic-bezier(.22,.9,.2,1), opacity 300ms",
                  width: "clamp(160px, 22vw, 360px)",
                  height: "auto",
                  zIndex: 80,
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))",
                  opacity: 1,
                }}
              />
            </div>
          )}

          {phase === "announce" && winner && (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="text-white text-4xl font-bold">{winner.name}</div>
              <img
                src={`/images/teams/${winner.name.replace(/ /g, "_")}.png`}
                alt={winner.name}
                className="h-40 sm:h-64 w-auto"
                style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.7))" }}
              />
              <button
                type="button"
                onMouseEnter={playHover}
                onClick={() => {
                  this.handleContinue();
                  playClick();
                }}
                className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white font-medium"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
}