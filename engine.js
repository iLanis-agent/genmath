/* GenMath engine - honest generator sizing math. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.GenMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {

  // Appliance library: running watts + starting multiplier (motor loads surge).
  var APPLIANCES = [
    { id: 'fridge',      name: 'Refrigerator',        running: 150,  startMult: 3.0 },
    { id: 'furnace',     name: 'Furnace blower',      running: 600,  startMult: 3.0 },
    { id: 'windowac',    name: 'Window AC (10k BTU)', running: 1200, startMult: 3.0 },
    { id: 'sump',        name: 'Sump pump',           running: 800,  startMult: 3.0 },
    { id: 'wellpump',    name: 'Well pump',           running: 1000, startMult: 3.0 },
    { id: 'microwave',   name: 'Microwave',           running: 1000, startMult: 1.0 },
    { id: 'coffee',      name: 'Coffee maker',        running: 900,  startMult: 1.0 },
    { id: 'lights',      name: 'LED lights (house)',  running: 100,  startMult: 1.0 },
    { id: 'router',      name: 'Router + modem',      running: 20,   startMult: 1.0 },
    { id: 'laptop',      name: 'Laptop charger',      running: 60,   startMult: 1.0 },
    { id: 'tv',          name: 'TV',                  running: 150,  startMult: 1.0 },
    { id: 'phonecharge', name: 'Phone chargers',      running: 10,   startMult: 1.0 },
    { id: 'freezer',     name: 'Chest freezer',       running: 100,  startMult: 3.0 },
    { id: 'spaceheater', name: 'Space heater',        running: 1500, startMult: 1.0 },
    { id: 'waterheater', name: 'Electric water heater', running: 4000, startMult: 1.0 }
  ];

  function startingWatts(a) { return Math.round(a.running * a.startMult); }

  function totalRunning(items) {
    return items.reduce(function (s, a) { return s + a.running; }, 0);
  }

  // Worst-case surge: everything running, then the biggest-start appliance kicks on last.
  function worstCaseStart(items) {
    if (!items.length) return 0;
    var total = totalRunning(items);
    var worst = 0;
    items.forEach(function (a) {
      var sw = startingWatts(a);
      var need = total - a.running + sw; // others running + this one starting
      if (need > worst) worst = need;
    });
    return worst;
  }

  // Box number honesty: most generators advertise PEAK watts.
  function boxLie(gen) {
    var pct = gen.running > 0 ? Math.round((gen.peak - gen.running) / gen.peak * 100) : 0;
    return pct; // % of the box number you cannot actually run continuously
  }

  // Load fraction at the running total.
  function loadFraction(gen, items) {
    if (gen.running <= 0) return Infinity;
    return totalRunning(items) / gen.running;
  }

  // Fuel model: gallons-per-hour interpolated between 25% and 100% load points.
  function gphAtLoad(gen, frac) {
    if (frac <= 0) return 0;
    var f = Math.min(frac, 1.0);
    if (f <= 0.25) return gen.gph25 * (f / 0.25);
    return gen.gph25 + (gen.gph100 - gen.gph25) * ((f - 0.25) / 0.75);
  }

  function runtimeHours(gen, items) {
    var frac = loadFraction(gen, items);
    if (!isFinite(frac) || frac > 1) return 0; // overloaded: no honest runtime
    var gph = gphAtLoad(gen, frac);
    if (gph <= 0) return 0;
    return Math.round(gen.tank / gph * 10) / 10;
  }

  function verdict(gen, items) {
    var run = totalRunning(items);
    var surge = worstCaseStart(items);
    if (run > gen.running) return { code: 'overload', label: 'Will not even run' };
    if (surge > gen.peak) return { code: 'surge', label: 'Starts nothing new - surge kills it' };
    var frac = loadFraction(gen, items);
    if (frac > 0.85) return { code: 'tight', label: 'Runs, but no headroom' };
    return { code: 'ready', label: 'Storm-ready' };
  }

  function fmtW(w) { return w.toLocaleString('en-US') + ' W'; }
  function fmtH(h) {
    if (h <= 0) return '0 h';
    var hrs = Math.floor(h), mins = Math.round((h - hrs) * 60);
    return hrs + ' h ' + (mins < 10 ? '0' : '') + mins + ' m';
  }

  return {
    APPLIANCES: APPLIANCES,
    startingWatts: startingWatts,
    totalRunning: totalRunning,
    worstCaseStart: worstCaseStart,
    boxLie: boxLie,
    loadFraction: loadFraction,
    gphAtLoad: gphAtLoad,
    runtimeHours: runtimeHours,
    verdict: verdict,
    fmtW: fmtW,
    fmtH: fmtH
  };
});
