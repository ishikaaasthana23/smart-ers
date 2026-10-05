import { useState, useEffect } from "react";
import Header from "../components/Header";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, incidentsRes, resourcesRes, dispatchesRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/incidents'),
        fetch('/api/resources'),
        fetch('/api/dispatches')
      ]);

      if (!statsRes.ok || !incidentsRes.ok || !resourcesRes.ok || !dispatchesRes.ok) {
        throw new Error('Failed to load dashboard data');
      }

      setStats(await statsRes.json());
      setIncidents(await incidentsRes.json());
      setResources(await resourcesRes.json());
      setDispatches(await dispatchesRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <div style={{color: 'red'}}>{error}</div>;

  return (
    <>
      <Header
        title="Emergency Command Center"
        subtitle="Smart Emergency Response & Resource Allocation System"
      />

      {/* Statistics */}
      <section className="stats">
        <div className="stat-card critical">
          <span>CRITICAL INCIDENTS</span>
          <strong>{stats?.criticalIncidents < 10 ? `0${stats.criticalIncidents}` : stats?.criticalIncidents}</strong>
          <small>Immediate response required</small>
        </div>

        <div className="stat-card">
          <span>ACTIVE INCIDENTS</span>
          <strong>{stats?.activeIncidents < 10 ? `0${stats.activeIncidents}` : stats?.activeIncidents}</strong>
          <small>Currently being monitored</small>
        </div>

        <div className="stat-card">
          <span>AVAILABLE UNITS</span>
          <strong>{stats?.availableResources < 10 ? `0${stats.availableResources}` : stats?.availableResources}</strong>
          <small>Ready for deployment</small>
        </div>

        <div className="stat-card">
          <span>RESOLVED</span>
          <strong>{stats?.resolvedIncidents < 10 ? `0${stats.resolvedIncidents}` : stats?.resolvedIncidents}</strong>
          <small>Total incidents resolved</small>
        </div>
      </section>

      {/* Main Dashboard */}
      <section className="dashboard-grid">

        {/* Active Emergencies */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Active Emergencies</h2>
              <p>Current incidents requiring response</p>
            </div>
            <button className="add-button" onClick={fetchData}>
              ↻ Refresh
            </button>
          </div>

          {incidents.filter(i => i.status !== 'Resolved').slice(0, 3).map(incident => (
            <Incident
              key={incident.id}
              icon={incident.type === 'Fire' ? '🔥' : incident.type === 'Medical' ? '🚑' : incident.type === 'Accident' ? '🚗' : '⚠️'}
              title={`${incident.id} — ${incident.title}`}
              location={`Node ${incident.location}`}
              severity={incident.severity.toUpperCase()}
              description={incident.description}
              time={incident.status}
            />
          ))}
          {incidents.filter(i => i.status !== 'Resolved').length === 0 && <p>No active emergencies.</p>}
        </div>

        {/* Response Resources */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Response Resources</h2>
              <p>Current resource availability</p>
            </div>
          </div>

          {resources.slice(0, 4).map(resource => (
            <Resource
              key={resource.id}
              icon={resource.type === 'Fire Truck' ? '🚒' : resource.type === 'Police Vehicle' ? '👮' : '🚑'}
              name={`${resource.id} — ${resource.name}`}
              location={resource.location}
              status={resource.status.toUpperCase()}
            />
          ))}
        </div>
      </section>

      {/* Bottom Section */}
      <section className="bottom-grid">

        {/* Dispatch Status */}
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Dispatch Status</h2>
              <p>Latest system decision</p>
            </div>
          </div>

          {dispatches.slice(0, 1).map(dispatch => (
            <div className="dispatch-result" key={dispatch.id}>
              <div className="dispatch-icon">✓</div>
              <div>
                <strong>{dispatch.resourceId} assigned to {dispatch.incidentId}</strong>
                <p>
                  {dispatch.resourceName} to {dispatch.incidentTitle} • 
                  Estimated response: {dispatch.estimatedArrival ? `${dispatch.estimatedArrival} min` : 'Calculating'}
                </p>
              </div>
            </div>
          ))}
          {dispatches.length === 0 && <p>No active dispatches.</p>}
        </div>


        {/* Mathematics */}

        <div className="panel">

          <div className="panel-header">

            <div>
              <h2>Mathematical Engine</h2>
              <p>Active decision models</p>
            </div>

          </div>


          <div className="math-tags">

            <span>✓ Propositional Logic</span>
            <span>✓ Relations</span>
            <span>✓ Weighted Graph</span>
            <span>✓ Partial Order</span>
            <span>✓ Assignment</span>
            <span>✓ Pigeonhole</span>

          </div>

        </div>

      </section>

    </>
  );
}


/* Incident Component */

function Incident({
  icon,
  title,
  location,
  severity,
  description,
  time
}) {

  return (

    <div className="incident">

      <div className="incident-icon">
        {icon}
      </div>


      <div className="incident-info">

        <div className="incident-title">

          <strong>{title}</strong>

          <span className={`badge ${severity.toLowerCase()}-badge`}>
            {severity}
          </span>

        </div>

        <p>📍 {location}</p>

        <small>{description}</small>

      </div>


      <div className="incident-time">

        <strong>{time}</strong>

        <span>waiting</span>

      </div>

    </div>

  );
}


/* Resource Component */

function Resource({
  icon,
  name,
  location,
  status
}) {

  return (

    <div className="resource">

      <div className="resource-icon">
        {icon}
      </div>


      <div className="resource-info">

        <strong>{name}</strong>

        <span>📍 {location}</span>

      </div>


      <span
        className={
          status === "AVAILABLE"
            ? "available"
            : "occupied"
        }
      >
        {status}
      </span>

    </div>

  );
}


export default Dashboard;