(function () {
  // Leave the map empty instead of breaking the page if the CDN is down
  if (!window.maplibregl) return;

  const pos = [44.4977080821991, 40.194239265816144];

  const map = new maplibregl.Map({
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: pos,
    zoom: 13,
    container: "ofm",
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({ compact: true }), "top-right");

  new maplibregl.Marker()
    .setLngLat(pos)
    .addTo(map)
    .getElement()
    .addEventListener("click", () => {
      map.flyTo({
        center: pos,
        zoom: 18,
        speed: 1.45,
        curve: 2,
        essential: true,
      });
    });
})();
