// weatherAPI.js — Fixed API fetchers
// KEY FIX: NASA POWER returns -999 for missing/fill values — must filter these out

// ── Open-Meteo (100% free, no key needed)
export async function fetchOpenMeteo(lat, lng) {
  const url =
    `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}` +
    `&current_weather=true` +
    `&daily=precipitation_sum,temperature_2m_max,windspeed_10m_max` +
    `&timezone=Asia%2FKolkata&forecast_days=7`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!data.current_weather) return null;
    return {
      temp:     data.current_weather.temperature,
      wind:     data.current_weather.windspeed,
      windDir:  data.current_weather.winddirection,
      rainfall: data.daily?.precipitation_sum || [],
      maxTemp:  data.daily?.temperature_2m_max || [],
      maxWind:  data.daily?.windspeed_10m_max || [],
      source:   "Open-Meteo",
    };
  } catch {
    return null;
  }
}

// ── NASA POWER (free, no key) — FIXED: filter -999 fill values
export async function fetchNASAPower(lat, lng) {
  const today = new Date();
  const end = today.toISOString().slice(0, 10).replace(/-/g, "");
  const start30 = new Date(today);
  start30.setDate(today.getDate() - 30);
  const start = start30.toISOString().slice(0, 10).replace(/-/g, "");

  const url =
    `https://power.larc.nasa.gov/api/temporal/daily/point?` +
    `parameters=PRECTOTCORR,WS10M,T2M,RH2M` +
    `&community=RE&longitude=${lng}&latitude=${lat}` +
    `&start=${start}&end=${end}&format=JSON`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const data = await res.json();
    const props = data?.properties?.parameter;
    if (!props) return null;

    // ── THE FIX: NASA uses -999 as "no data" fill value
    const clean = (obj) => Object.values(obj || {}).filter(v => v !== -999 && v > -900);
    const avg   = (arr)  => arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2) : null;
    const sum   = (arr)  => arr.length ? arr.reduce((a, b) => a + b, 0).toFixed(1) : null;

    const rainfall = clean(props.PRECTOTCORR);
    const wind     = clean(props.WS10M);
    const temp     = clean(props.T2M);
    const humid    = clean(props.RH2M);

    return {
      avgRainfall:      avg(rainfall),
      avgWind:          avg(wind),
      avgTemp:          avg(temp),
      avgHumidity:      avg(humid),
      totalRainfall30d: sum(rainfall),
      dataPoints:       rainfall.length,
      source:           "NASA POWER",
    };
  } catch {
    return null;
  }
}

// ── Fetch both in parallel
export async function fetchAllWeatherData(lat, lng) {
  const [meteo, nasa] = await Promise.all([
    fetchOpenMeteo(lat, lng),
    fetchNASAPower(lat, lng),
  ]);
  return { meteo, nasa };
}