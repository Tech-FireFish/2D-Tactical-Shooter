"use strict";

(function () {
  // Builds low-resolution object scaling for non-wall gameplay objects.
  function create(deps) {
    const config = deps.config || {};
    const baseWidth = Number(config.baseWidth) || 1920;
    const baseHeight = Number(config.baseHeight) || 1080;
    const minObjectScale = Number(config.minObjectScale) || 0.65;
    const scaleHitboxes = config.scaleHitboxes !== false;
    let scale = 1;

    // Recomputes scale from the current viewport.
    function update() {
      const viewport = deps.camera && deps.camera.getViewport
        ? deps.camera.getViewport()
        : { w: window.innerWidth || baseWidth, h: window.innerHeight || baseHeight };
      const next = Math.min(viewport.w / baseWidth, viewport.h / baseHeight);
      scale = Math.max(minObjectScale, Math.min(1, next || 1));
      return scale;
    }

    // Returns the current object scale.
    function objectScale() {
      return scale;
    }

    // Scales a radius when hitbox scaling is enabled.
    function scaledRadius(obj) {
      const radius = Number(obj && obj.radius) || 0;
      return scaleHitboxes ? radius * scale : radius;
    }

    // Scales a rectangle around its center.
    function scaledRect(rect) {
      if (!rect || !scaleHitboxes) return rect;
      return scaledRectVisual(rect);
    }

    // Scales a rectangle visually around its center.
    function scaledRectVisual(rect) {
      if (!rect) return rect;
      const w = rect.w * scale;
      const h = rect.h * scale;
      return {
        ...rect,
        x: rect.x + (rect.w - w) / 2,
        y: rect.y + (rect.h - h) / 2,
        w,
        h
      };
    }

    // Scales a circle-like unit around its center.
    function scaledCircle(circle) {
      if (!circle || !scaleHitboxes) return circle;
      return { ...circle, radius: scaledRadius(circle) };
    }

    // Measures point-to-scaled-rectangle distance.
    function scaledPointRectDistance(point, rect) {
      return deps.pointRectDistance(point, scaledRect(rect));
    }

    update();

    return {
      update,
      objectScale,
      scaledRadius,
      scaledRect,
      scaledRectVisual,
      scaledCircle,
      scaledPointRectDistance,
      scaleHitboxes: () => scaleHitboxes
    };
  }

  window.ObjectScaleSystem = { create };
}());
