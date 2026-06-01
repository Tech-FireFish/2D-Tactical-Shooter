"use strict";

(function () {
  // Builds a focused camera that follows the selected operator.
  function create(deps) {
    const camera = {
      x: deps.defaultWorld.w / 2,
      y: deps.defaultWorld.h / 2,
      zoom: 1.38,
      targetZoom: 1.38
    };

    // Moves the camera toward the selected operator and clamps to world bounds.
    function update(dt) {
      const op = deps.selectedOperator();
      if (!op) return;
      const follow = 1 - Math.pow(0.001, dt);
      camera.x += (op.x - camera.x) * follow;
      camera.y += (op.y - camera.y) * follow;
      camera.zoom += (camera.targetZoom - camera.zoom) * follow;
      clampToWorld();
    }

    // Keeps the camera inside the current world rectangle.
    function clampToWorld() {
      const viewW = deps.canvas.width / camera.zoom;
      const viewH = deps.canvas.height / camera.zoom;
      camera.x = deps.clamp(camera.x, viewW / 2, Math.max(viewW / 2, deps.world.w - viewW / 2));
      camera.y = deps.clamp(camera.y, viewH / 2, Math.max(viewH / 2, deps.world.h - viewH / 2));
    }

    // Applies the world transform before map rendering.
    function apply(ctx) {
      ctx.setTransform(camera.zoom, 0, 0, camera.zoom, -camera.x * camera.zoom + deps.canvas.width / 2, -camera.y * camera.zoom + deps.canvas.height / 2);
    }

    // Restores identity transform for screen-space clearing or overlays.
    function reset(ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Converts a screen/canvas coordinate into world space.
    function screenToWorld(point) {
      return {
        x: (point.x - deps.canvas.width / 2) / camera.zoom + camera.x,
        y: (point.y - deps.canvas.height / 2) / camera.zoom + camera.y
      };
    }

    // Returns camera state for debug or status systems.
    function getCamera() {
      return camera;
    }

    return {
      update,
      apply,
      reset,
      screenToWorld,
      getCamera
    };
  }

  window.CameraSystem = { create };
}());
