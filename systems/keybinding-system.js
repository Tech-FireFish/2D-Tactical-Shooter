"use strict";

(function () {
  // Builds persistent keyboard remapping and input matching helpers.
  function create(deps) {
    const storageKey = "breachline-keybindings-v1";
    const defaults = {
      moveUp: { label: "Move Up", value: "KeyW", display: "W" },
      moveLeft: { label: "Move Left", value: "KeyA", display: "A" },
      moveDown: { label: "Move Down", value: "KeyS", display: "S" },
      moveRight: { label: "Move Right", value: "KeyD", display: "D" },
      interact: { label: "Interact", value: "KeyE", display: "E" },
      inventory: { label: "Inventory", value: "KeyI", display: "I" },
      pause: { label: "Execute / Pause", value: "Space", display: "Space" },
      restart: { label: "Restart", value: "KeyR", display: "R" },
      debug: { label: "Debug", value: "F3", display: "F3" },
      settings: { label: "Settings", value: "Escape", display: "Esc" },
      sneak: { label: "Sneak", value: "ControlLeft", display: "Left Ctrl" },
      sprint: { label: "Sprint", value: "ShiftLeft", display: "Left Shift" }
    };
    const bindings = loadBindings();

    // Loads saved bindings and merges them with defaults.
    function loadBindings() {
      try {
        const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
        return Object.fromEntries(Object.entries(defaults).map(([action, config]) => {
          const savedConfig = saved[action];
          return [action, savedConfig && savedConfig.value ? { ...config, ...savedConfig } : { ...config }];
        }));
      } catch (error) {
        return Object.fromEntries(Object.entries(defaults).map(([action, config]) => [action, { ...config }]));
      }
    }

    // Persists current key choices to localStorage.
    function saveBindings() {
      try {
        localStorage.setItem(storageKey, JSON.stringify(bindings));
      } catch (error) {
        return;
      }
    }

    // Converts a keyboard event into a stable binding value.
    function eventValue(event) {
      return event.code || event.key;
    }

    // Converts a keyboard event into a readable label.
    function eventDisplay(event) {
      if (event.code === "Space") return "Space";
      if (event.code === "Escape") return "Esc";
      if (event.code === "ControlLeft") return "Left Ctrl";
      if (event.code === "ControlRight") return "Right Ctrl";
      if (event.code === "ShiftLeft") return "Left Shift";
      if (event.code === "ShiftRight") return "Right Shift";
      if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
      if (/^Digit\d$/.test(event.code)) return event.code.slice(5);
      return event.key.length === 1 ? event.key.toUpperCase() : event.key;
    }

    // Tests whether an event matches a named action.
    function matches(event, action) {
      const binding = bindings[action];
      return Boolean(binding && eventValue(event) === binding.value);
    }

    // Updates one action binding from a keyboard event.
    function capture(action, event) {
      if (!bindings[action]) return;
      bindings[action].value = eventValue(event);
      bindings[action].display = eventDisplay(event);
      saveBindings();
      render();
    }

    // Renders editable keybinding controls in settings.
    function render() {
      if (!deps.elements.keyBindingList) return;
      deps.elements.keyBindingList.innerHTML = Object.entries(bindings).map(([action, config]) => `
        <label class="keybinding-row">
          <span>${config.label}</span>
          <button type="button" data-keybinding-action="${action}">${config.display}</button>
        </label>
      `).join("");
    }

    // Returns a display label for status text.
    function display(action) {
      return bindings[action] ? bindings[action].display : "";
    }

    render();

    return {
      bindings,
      defaults,
      matches,
      capture,
      render,
      display
    };
  }

  window.KeybindingSystem = { create };
}());
