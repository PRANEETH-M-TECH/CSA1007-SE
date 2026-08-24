export default function WeatherPanel({ site, weather }) {
  if (!weather) return null;

  return (
    <div className="card">
      <h2>Weather — {site}</h2>
      {weather.advisory && <p className="advisory-banner">⚠ {weather.advisory}</p>}
      <dl className="turbine-card__metrics">
        <div><dt>Wind Speed</dt><dd>{weather.windSpeed} m/s</dd></div>
        <div><dt>Wave Height</dt><dd>{weather.waveHeight} m</dd></div>
        <div><dt>Visibility</dt><dd>{weather.visibility}</dd></div>
        <div><dt>Temperature</dt><dd>{weather.temperature} °C</dd></div>
      </dl>
      <p className="turbine-card__timestamp">
        Updated: {new Date(weather.updatedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}
