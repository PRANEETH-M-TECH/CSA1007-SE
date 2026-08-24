export default function TurbineCard({ turbine }) {
  const isStale = Date.now() - new Date(turbine.lastContact).getTime() > 5 * 60 * 1000;

  return (
    <div className={`card turbine-card ${isStale ? "turbine-card--offline" : ""}`}>
      <div className="turbine-card__header">
        <h3>{turbine.id}</h3>
        <span className={`badge ${isStale ? "badge--offline" : "badge--online"}`}>
          {isStale ? "Offline / No Data" : "Online"}
        </span>
      </div>
      <p className="turbine-card__site">{turbine.site}</p>
      <dl className="turbine-card__metrics">
        <div><dt>RPM</dt><dd>{turbine.rpm}</dd></div>
        <div><dt>Power</dt><dd>{turbine.power} MW</dd></div>
        <div><dt>Vibration</dt><dd>{turbine.vibration} mm/s</dd></div>
        <div><dt>Temperature</dt><dd>{turbine.temperature} °C</dd></div>
      </dl>
      <p className="turbine-card__timestamp">
        Last contact: {new Date(turbine.lastContact).toLocaleTimeString()}
      </p>
    </div>
  );
}
