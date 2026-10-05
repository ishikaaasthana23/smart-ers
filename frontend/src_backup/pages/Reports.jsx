import Header from "../components/Header";

function Reports() {
  const summaryMetrics = {
    totalIncidents: 14,
    activeIncidents: 3,
    resolvedIncidents: 11,
    avgResponseTime: "6.8 min",
    totalRoads: 6,
    openRoads: 6,
    closedRoads: 0,
    networkStatus: "FULLY CONNECTED",
    pathOptimizationRate: "99.4%",
    dijkstraAvgTime: "< 1 ms",
    availableUnits: 3,
    totalUnits: 4
  };

  return (
    <>
      <Header
        title="System Analytics & Operational Reports"
        subtitle="Performance analytics, response summaries, road network diagnostics, and routing metrics"
      />

      {/* TOP METRIC CARDS */}
      <section className="stats">
        <div className="stat-card">
          <span>TOTAL INCIDENTS</span>
          <strong>{summaryMetrics.totalIncidents}</strong>
          <small>Registered emergency events</small>
        </div>

        <div className="stat-card stat-danger">
          <span>ACTIVE INCIDENTS</span>
          <strong>{summaryMetrics.activeIncidents}</strong>
          <small>Currently in progress</small>
        </div>

        <div className="stat-card stat-success">
          <span>RESOLVED INCIDENTS</span>
          <strong>{summaryMetrics.resolvedIncidents}</strong>
          <small>Successfully closed</small>
        </div>

        <div className="stat-card stat-time">
          <span>AVG RESPONSE TIME</span>
          <strong>{summaryMetrics.avgResponseTime}</strong>
          <small>Calculated target: &lt; 8 min</small>
        </div>
      </section>

      {/* REPORT SECTIONS */}
      <div className="reports-grid">
        {/* RESPONSE SUMMARY */}
        <div className="report-card">
          <h3>📋 Response Summary</h3>
          <div className="report-metric-list">
            <div className="report-metric-item">
              <span>Total Emergency Reports</span>
              <strong>{summaryMetrics.totalIncidents}</strong>
            </div>
            <div className="report-metric-item">
              <span>Active Dispatched Units</span>
              <strong>{summaryMetrics.activeIncidents}</strong>
            </div>
            <div className="report-metric-item">
              <span>Completed Incidents</span>
              <strong>{summaryMetrics.resolvedIncidents}</strong>
            </div>
            <div className="report-metric-item">
              <span>Average On-Scene Response</span>
              <strong>{summaryMetrics.avgResponseTime}</strong>
            </div>
            <div className="report-metric-item">
              <span>Incident Clearance Efficiency</span>
              <strong style={{ color: "var(--accent-green)" }}>78.5%</strong>
            </div>
          </div>
        </div>

        {/* ROAD NETWORK STATUS */}
        <div className="report-card">
          <h3>🛣️ Road Network Diagnostics</h3>
          <div className="report-metric-list">
            <div className="report-metric-item">
              <span>Total Graph Edges (Roads)</span>
              <strong>{summaryMetrics.totalRoads}</strong>
            </div>
            <div className="report-metric-item">
              <span>Open Road Segments</span>
              <strong style={{ color: "var(--accent-green)" }}>{summaryMetrics.openRoads}</strong>
            </div>
            <div className="report-metric-item">
              <span>Closed / Obstructed Roads</span>
              <strong style={{ color: "var(--accent-red)" }}>{summaryMetrics.closedRoads}</strong>
            </div>
            <div className="report-metric-item">
              <span>Graph Connectivity State</span>
              <strong style={{ color: "var(--accent-green)" }}>{summaryMetrics.networkStatus}</strong>
            </div>
            <div className="report-metric-item">
              <span>Network Redundancy Factor</span>
              <strong>1.0 (Single Cycle)</strong>
            </div>
          </div>
        </div>

        {/* ROUTE PERFORMANCE & METRICS */}
        <div className="report-card">
          <h3>⚡ Algorithmic Performance</h3>
          <div className="report-metric-list">
            <div className="report-metric-item">
              <span>Shortest Path Accuracy</span>
              <strong style={{ color: "var(--accent-blue)" }}>{summaryMetrics.pathOptimizationRate}</strong>
            </div>
            <div className="report-metric-item">
              <span>Dijkstra Execution Latency</span>
              <strong>{summaryMetrics.dijkstraAvgTime}</strong>
            </div>
            <div className="report-metric-item">
              <span>Resource Utilization Ratio</span>
              <strong>75.0%</strong>
            </div>
            <div className="report-metric-item">
              <span>Available Response Readiness</span>
              <strong style={{ color: "var(--accent-green)" }}>{summaryMetrics.availableUnits} / {summaryMetrics.totalUnits} Units</strong>
            </div>
            <div className="report-metric-item">
              <span>Hospital Node Reachability</span>
              <strong style={{ color: "var(--accent-green)" }}>100%</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Reports;
