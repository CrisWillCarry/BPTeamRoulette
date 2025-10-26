/**
 * Simple sound manager using HTMLAudio.
 * Put audio files in public/sounds (e.g. /sounds/ambient.mp3, /sounds/hover.mp3, /sounds/click.mp3).
 *
 * Behavior:
 * - Nothing will auto-play until userGesture() is called (a real user gesture like clicking unmute).
 * - setMuted(true) mutes & stops background; setMuted(false) will start background if userGesture() was already called.
 * - playClick/playHover will respect muted flag.
 */

type Listener = (muted: boolean) => void;

const listeners: Listener[] = [];

let muted = true;
let userGestureCalled = false;

const bg = new Audio('/sounds/ambient.mp3');
bg.loop = true;
bg.volume = 0.4;

/** Notify subscribers of muted state changes */
function notify() {
  listeners.forEach((l) => {
    try { l(muted); } catch {}
  });
}

export function subscribeMuted(cb: Listener) {
  listeners.push(cb);
  // initial notify
  cb(muted);
  return () => {
    const i = listeners.indexOf(cb);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function isMuted() {
  return muted;
}

/** Mark that a user gesture happened (call on "unmute" click) */
export function userGesture() {
  userGestureCalled = true;
}

/** Start background music if allowed (userGesture must be true and not muted) */
export function startBackground() {
  if (!userGestureCalled) return;
  if (muted) return;
  bg.play().catch(() => {
    // play may be blocked for some environments; ignore
  });
}

/** Stop background and reset position */
export function stopBackground() {
  try {
    bg.pause();
  } catch {}
}

/** Explicitly set muted state */
export function setMuted(val: boolean) {
  muted = val;
  if (muted) {
    stopBackground();
  } else {
    // on unmute, start background only if userGesture was already triggered
    if (userGestureCalled) startBackground();
  }
  notify();
}

/** Toggle muted and return new state */
export function toggleMuted() {
  setMuted(!muted);
  return muted;
}

/** Play a short UI sound (non-looping). Respects muted flag. */
function playOneShot(path: string, volume = 0.8, allowWhenMuted = false) {
  if (!userGestureCalled) return; // must have a user gesture first to satisfy autoplay policies
  if (muted && !allowWhenMuted) return;

  try {
    const s = new Audio(path);
    // clamp volume to [0,1]
    s.volume = Math.max(0, Math.min(1, volume));
    // ensure we start from beginning
    s.currentTime = 0;
    // Create and play a fresh audio element so multiple sounds can overlap
    s.play().catch(() => {});
  } catch {}
}


export function playClick() {
  playOneShot('/sounds/click.mp3', 1, true);
}

export function playHover() {
  playOneShot('/sounds/hover.mp3', 1, true);
}
