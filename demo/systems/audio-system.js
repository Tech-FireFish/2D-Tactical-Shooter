"use strict";

(function () {
  // Builds sound loading, browser unlock, and playback helpers.
  function create(deps) {
    const sounds = new Map();
    const loops = new Map();
    const loopActivity = new Map();
    let unlocked = false;

    // Loads each configured audio asset without blocking gameplay on failures.
    function loadSounds() {
      for (const sound of deps.soundOptions) {
        const audio = new Audio(sound.file);
        audio.preload = "auto";
        sounds.set(sound.id, audio);
      }
    }

    // Allows playback after the first user gesture, as required by browsers.
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      for (const audio of sounds.values()) {
        audio.load();
      }
    }

    // Plays one sound effect by ID when audio is available.
    function play(id) {
      const source = sounds.get(id);
      if (!source || !unlocked) return;
      try {
        const audio = source.cloneNode();
        audio.volume = deps.volume;
        const result = audio.play();
        if (result && typeof result.catch === "function") {
          result.catch(() => {});
        }
      } catch (error) {
        return;
      }
    }

    // Maps weapon IDs to their matching weapon-fire sound.
    function playWeapon(weaponId) {
      if (weaponId === "smg") {
        play("smg-shot");
      } else if (weaponId === "pistol") {
        play("pistol-shot");
      } else {
        play("rifle-shot");
      }
    }

    // Marks a looping movement sound as active for the current frame.
    function noteLoopActivity(id) {
      loopActivity.set(id, 0.18);
      if (unlocked) {
        startLoop(id);
      }
    }

    // Starts a looping sound if it is not already running.
    function startLoop(id) {
      if (loops.has(id)) return;
      const source = sounds.get(id);
      if (!source) return;
      try {
        const audio = source.cloneNode();
        audio.loop = true;
        audio.volume = deps.loopVolume;
        loops.set(id, audio);
        const result = audio.play();
        if (result && typeof result.catch === "function") {
          result.catch(() => stopLoop(id));
        }
      } catch (error) {
        stopLoop(id);
      }
    }

    // Stops and clears a looping sound.
    function stopLoop(id) {
      const audio = loops.get(id);
      if (!audio) return;
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        return;
      } finally {
        loops.delete(id);
      }
    }

    // Expires movement-loop activity when units stop reporting movement.
    function update(dt) {
      for (const [id, remaining] of loopActivity.entries()) {
        const next = remaining - dt;
        if (next <= 0) {
          loopActivity.delete(id);
          stopLoop(id);
        } else {
          loopActivity.set(id, next);
        }
      }
    }

    // Reports whether browser audio has been unlocked by user input.
    function isUnlocked() {
      return unlocked;
    }

    loadSounds();

    return {
      unlock,
      play,
      playWeapon,
      noteLoopActivity,
      startLoop,
      stopLoop,
      update,
      isUnlocked
    };
  }

  window.AudioSystem = { create };
}());
