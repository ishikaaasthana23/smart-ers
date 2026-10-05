import { useState } from "react";

function CityMap() {
  const [roads, setRoads] = useState([
    { id: 1, from: "H1", to: "J1", time: 4, status: "Open" },
    { id: 2, from: "J1", to: "J2", time: 3, status: "Open" },
    { id: 3, from: "H1", to: "J3", time: 5, status: "Open" },
    { id: 4, from: "J3", to: "J2", time: 6, status: "Open" },
    { id: 5, from: "J2", to: "H2", time: 2, status: "Open" },
    { id: 6, from: "S1", to: "J2", time: 4, status: "Open" }
  ]);

  // NORMAL ROUTING
  const [start, setStart] = useState("H1");
  const [destination, setDestination] = useState("J2");
  const [routeResult, setRouteResult] = useState(null);

  // EMERGENCY DISPATCH
  const [emergencyType, setEmergencyType] = useState("Medical");
  const [emergencyLocation, setEmergencyLocation] = useState("J2");
  const [dispatchDestination, setDispatchDestination] = useState("H1");
  const [unit, setUnit] = useState("Ambulance");

  // ACTIVE INCIDENTS
  const [incidents, setIncidents] = useState([]);

  // OPEN / CLOSE ROAD
  function toggleRoad(id) {
    setRoads((currentRoads) =>
      currentRoads.map((road) => {
        if (road.id === id) {
          return {
            ...road,
            status:
              road.status === "Open"
                ? "Closed"
                : "Open"
          };
        }

        return road;
      })
    );

    setRouteResult(null);
  }

  // DIJKSTRA
  function calculateShortestPath(source, target) {
    const nodes = [
      "H1",
      "J1",
      "J2",
      "J3",
      "H2",
      "S1"
    ];

    const graph = {};

    nodes.forEach((node) => {
      graph[node] = [];
    });

    roads
      .filter((road) => road.status === "Open")
      .forEach((road) => {
        graph[road.from].push({
          node: road.to,
          time: road.time
        });

        graph[road.to].push({
          node: road.from,
          time: road.time
        });
      });

    const distances = {};
    const previous = {};
    const unvisited = new Set(nodes);

    nodes.forEach((node) => {
      distances[node] = Infinity;
      previous[node] = null;
    });

    distances[source] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let shortestDistance = Infinity;

      unvisited.forEach((node) => {
        if (distances[node] < shortestDistance) {
          shortestDistance = distances[node];
          current = node;
        }
      });

      if (
        current === null ||
        shortestDistance === Infinity
      ) {
        break;
      }

      unvisited.delete(current);

      if (current === target) {
        break;
      }

      graph[current].forEach((neighbor) => {
        if (!unvisited.has(neighbor.node)) {
          return;
        }

        const newDistance =
          distances[current] + neighbor.time;

        if (
          newDistance <
          distances[neighbor.node]
        ) {
          distances[neighbor.node] =
            newDistance;

          previous[neighbor.node] =
            current;
        }
      });
    }

    if (distances[target] === Infinity) {
      return null;
    }

    const route = [];
    let current = target;

    while (current !== null) {
      route.unshift(current);
      current = previous[current];
    }

    return {
      route: route,
      time: distances[target]
    };
  }

  // NORMAL ROUTE
  function findShortestPath() {
    if (start === destination) {
      return;
    }

    const result =
      calculateShortestPath(
        start,
        destination
      );

    if (result === null) {
      setRouteResult({
        reachable: false
      });

      return;
    }

    setRouteResult({
      reachable: true,
      route: result.route,
      time: result.time
    });
  }

  // DISPATCH EMERGENCY
  function dispatchEmergency() {
    if (
      emergencyLocation ===
      dispatchDestination
    ) {
      alert(
        "Please select different locations."
      );
      return;
    }

    const result =
      calculateShortestPath(
        emergencyLocation,
        dispatchDestination
      );

    if (result === null) {
      alert(
        "No available route for this emergency."
      );
      return;
    }

    const newIncident = {
      id: Date.now(),
      type: emergencyType,
      location: emergencyLocation,
      destination: dispatchDestination,
      unit: unit,
      route: result.route,
      time: result.time,
      status: "DISPATCHED"
    };

    setIncidents((currentIncidents) => [
      ...currentIncidents,
      newIncident
    ]);

    setRouteResult({
      reachable: true,
      route: result.route,
      time: result.time
    });

    setStart(emergencyLocation);
    setDestination(dispatchDestination);
  }

  // MARK ON ROUTE
  function markOnRoute(id) {
    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) => {
        if (incident.id === id) {
          return {
            ...incident,
            status: "ON ROUTE"
          };
        }

        return incident;
      })
    );
  }

  // RESOLVE INCIDENT
  function resolveIncident(id) {
    setIncidents((currentIncidents) =>
      currentIncidents.map((incident) => {
        if (incident.id === id) {
          return {
            ...incident,
            status: "RESOLVED"
          };
        }

        return incident;
      })
    );
  }

  // CHECK ROUTE
  function isRoadInRoute(from, to) {
    if (
      !routeResult ||
      !routeResult.reachable
    ) {
      return false;
    }

    const route =
      routeResult.route;

    for (
      let i = 0;
      i < route.length - 1;
      i++
    ) {
      if (
        (route[i] === from &&
          route[i + 1] === to) ||
        (route[i] === to &&
          route[i + 1] === from)
      ) {
        return true;
      }
    }

    return false;
  }

  // STATISTICS
  const openRoads =
    roads.filter(
      (road) =>
        road.status === "Open"
    ).length;

  const closedRoads =
    roads.filter(
      (road) =>
        road.status === "Closed"
    ).length;

  const activeIncidents =
    incidents.filter(
      (incident) =>
        incident.status !== "RESOLVED"
    ).length;

  const dispatchedUnits =
    incidents.filter(
      (incident) =>
        incident.status !== "RESOLVED"
    ).length;

  const resolvedIncidents =
    incidents.filter(
      (incident) =>
        incident.status === "RESOLVED"
    ).length;

  const averageResponseTime =
    incidents.length > 0
      ? Math.round(
          incidents.reduce(
            (total, incident) =>
              total + incident.time,
            0
          ) / incidents.length
        )
      : 0;

  return (
    <>
      {/* TOP BAR */}

      <div className="dashboard-topbar">

        <div className="dashboard-title-area">

          <div className="system-icon">
            ⚡
          </div>

          <div>

            <h1>
              City Graph & Routing
            </h1>

            <p>
              Emergency dispatch and shortest-path control system
            </p>

          </div>

        </div>

        <div className="system-status">

          <span className="status-dot"></span>

          <div>

            <strong>
              SYSTEM ONLINE
            </strong>

            <small>
              All services operational
            </small>

          </div>

        </div>

      </div>


      {/* DASHBOARD STATISTICS */}

      <section className="stats">

        {/* ACTIVE INCIDENTS */}

        <div className="stat-card stat-danger">

          <div className="stat-icon">
            🚨
          </div>

          <div className="stat-content">

            <span>
              ACTIVE INCIDENTS
            </span>

            <strong>
              {activeIncidents}
            </strong>

            <small>
              Currently being handled
            </small>

          </div>

        </div>


        {/* UNITS DISPATCHED */}

        <div className="stat-card stat-unit-card">

          <div className="stat-icon">
            🚑
          </div>

          <div className="stat-content">

            <span>
              UNITS DISPATCHED
            </span>

            <strong>
              {dispatchedUnits}
            </strong>

            <small>
              Response units active
            </small>

          </div>

        </div>


        {/* OPEN ROADS */}

        <div className="stat-card stat-success">

          <div className="stat-icon">
            🛣️
          </div>

          <div className="stat-content">

            <span>
              OPEN ROADS
            </span>

            <strong>
              {openRoads}
            </strong>

            <small>
              Available road segments
            </small>

          </div>

        </div>


        {/* AVERAGE RESPONSE TIME */}

        <div className="stat-card stat-time">

          <div className="stat-icon">
            ⏱️
          </div>

          <div className="stat-content">

            <span>
              AVG RESPONSE TIME
            </span>

            <strong>
              {averageResponseTime}

              <small className="stat-unit">
                min
              </small>

            </strong>

            <small>
              Based on dispatched incidents
            </small>

          </div>

        </div>

      </section>


      {/* EMERGENCY DISPATCH */}

      <div className="panel dispatch-panel">

        <div className="panel-header">

          <div>

            <h2>
              Emergency Dispatch
            </h2>

            <p>
              Dispatch the nearest response unit using shortest-path routing
            </p>

          </div>

        </div>

        <div className="dispatch-controls">

          {/* TYPE */}

          <div className="routing-field">

            <label>
              EMERGENCY TYPE
            </label>

            <select
              value={emergencyType}
              onChange={(e) =>
                setEmergencyType(
                  e.target.value
                )
              }
            >

              <option value="Medical">
                Medical Emergency
              </option>

              <option value="Fire">
                Fire Emergency
              </option>

              <option value="Accident">
                Road Accident
              </option>

              <option value="Rescue">
                Rescue Operation
              </option>

            </select>

          </div>


          {/* LOCATION */}

          <div className="routing-field">

            <label>
              EMERGENCY LOCATION
            </label>

            <select
              value={emergencyLocation}
              onChange={(e) =>
                setEmergencyLocation(
                  e.target.value
                )
              }
            >

              <option value="H1">
                H1 — Hospital
              </option>

              <option value="H2">
                H2 — Hospital
              </option>

              <option value="J1">
                J1 — Junction
              </option>

              <option value="J2">
                J2 — Junction
              </option>

              <option value="J3">
                J3 — Junction
              </option>

              <option value="S1">
                S1 — Fire Station
              </option>

            </select>

          </div>


          {/* DESTINATION */}

          <div className="routing-field">

            <label>
              DESTINATION
            </label>

            <select
              value={dispatchDestination}
              onChange={(e) =>
                setDispatchDestination(
                  e.target.value
                )
              }
            >

              <option value="H1">
                H1 — Hospital
              </option>

              <option value="H2">
                H2 — Hospital
              </option>

              <option value="J1">
                J1 — Junction
              </option>

              <option value="J2">
                J2 — Junction
              </option>

              <option value="J3">
                J3 — Junction
              </option>

              <option value="S1">
                S1 — Fire Station
              </option>

            </select>

          </div>


          {/* UNIT */}

          <div className="routing-field">

            <label>
              RESPONSE UNIT
            </label>

            <select
              value={unit}
              onChange={(e) =>
                setUnit(
                  e.target.value
                )
              }
            >

              <option value="Ambulance">
                Ambulance
              </option>

              <option value="Fire Truck">
                Fire Truck
              </option>

              <option value="Rescue Unit">
                Rescue Unit
              </option>

            </select>

          </div>


          <button
            className="dispatch-button"
            onClick={
              dispatchEmergency
            }
          >
            🚨 DISPATCH UNIT
          </button>

        </div>

      </div>


      {/* ACTIVE INCIDENTS */}

      <div className="panel incidents-panel">

        <div className="panel-header">

          <div>

            <h2>
              Active Incidents
            </h2>

            <p>
              Emergency response operations
            </p>

          </div>

          <div className="incident-count">
            {activeIncidents} Active
          </div>

        </div>


        {incidents.length === 0 ? (

          <div className="no-incidents">

            <div className="no-incidents-icon">
              ✓
            </div>

            <strong>
              No active emergencies
            </strong>

            <p>
              Dispatch a unit to create an incident.
            </p>

          </div>

        ) : (

          <div className="incident-list">

            {incidents.map(
              (incident) => (

                <div
                  className={
                    incident.status ===
                    "RESOLVED"
                      ? "incident-card resolved"
                      : "incident-card"
                  }
                  key={incident.id}
                >

                  <div className="incident-top">

                    <div>

                      <span className="incident-type">
                        {incident.type}
                      </span>

                      <h3>
                        {incident.type} Emergency
                      </h3>

                    </div>

                    <span
                      className={
                        incident.status ===
                        "RESOLVED"
                          ? "incident-status resolved-status"
                          : incident.status ===
                            "ON ROUTE"
                          ? "incident-status route-status"
                          : "incident-status"
                      }
                    >
                      {incident.status}
                    </span>

                  </div>


                  <div className="incident-info">

                    <div>

                      <span>
                        LOCATION
                      </span>

                      <strong>
                        {incident.location}
                      </strong>

                    </div>


                    <div>

                      <span>
                        DESTINATION
                      </span>

                      <strong>
                        {incident.destination}
                      </strong>

                    </div>


                    <div>

                      <span>
                        UNIT
                      </span>

                      <strong>
                        {incident.unit}
                      </strong>

                    </div>


                    <div>

                      <span>
                        ETA
                      </span>

                      <strong>
                        {incident.time} min
                      </strong>

                    </div>

                  </div>


                  <div className="incident-route">

                    <span>
                      ROUTE
                    </span>

                    <strong>
                      {incident.route.join(
                        " → "
                      )}
                    </strong>

                  </div>


                  {incident.status !==
                    "RESOLVED" && (

                    <div className="incident-actions">

                      {incident.status ===
                        "DISPATCHED" && (

                        <button
                          onClick={() =>
                            markOnRoute(
                              incident.id
                            )
                          }
                          className="incident-route-button"
                        >
                          Start Journey
                        </button>

                      )}


                      <button
                        onClick={() =>
                          resolveIncident(
                            incident.id
                          )
                        }
                        className="incident-resolve-button"
                      >
                        ✓ Resolve Incident
                      </button>

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* SHORTEST PATH */}

      <div className="panel routing-panel">

        <div className="panel-header">

          <div>

            <h2>
              Shortest-Path Routing
            </h2>

            <p>
              Dijkstra's algorithm using current road conditions
            </p>

          </div>

        </div>


        <div className="routing-controls">

          <div className="routing-field">

            <label>
              START LOCATION
            </label>

            <select
              value={start}
              onChange={(e) => {

                setStart(
                  e.target.value
                );

                setRouteResult(null);

              }}
            >

              <option value="H1">
                H1 — Hospital
              </option>

              <option value="H2">
                H2 — Hospital
              </option>

              <option value="J1">
                J1 — Junction
              </option>

              <option value="J2">
                J2 — Junction
              </option>

              <option value="J3">
                J3 — Junction
              </option>

              <option value="S1">
                S1 — Fire Station
              </option>

            </select>

          </div>


          <div className="route-arrow">
            →
          </div>


          <div className="routing-field">

            <label>
              DESTINATION
            </label>

            <select
              value={destination}
              onChange={(e) => {

                setDestination(
                  e.target.value
                );

                setRouteResult(null);

              }}
            >

              <option value="H1">
                H1 — Hospital
              </option>

              <option value="H2">
                H2 — Hospital
              </option>

              <option value="J1">
                J1 — Junction
              </option>

              <option value="J2">
                J2 — Junction
              </option>

              <option value="J3">
                J3 — Junction
              </option>

              <option value="S1">
                S1 — Fire Station
              </option>

            </select>

          </div>


          <button
            className="calculate-route-button"
            onClick={
              findShortestPath
            }
            disabled={
              start === destination
            }
          >
            Calculate Route
          </button>

        </div>


        {routeResult && (

          <div
            className={
              routeResult.reachable
                ? "route-result"
                : "route-result route-failed"
            }
          >

            {routeResult.reachable ? (

              <>

                <div className="route-result-title">
                  ✓ Route Found
                </div>


                <div className="route-path">

                  {routeResult.route.map(
                    (node, index) => (

                      <span
                        key={node}
                        className="route-node"
                      >

                        {node}

                        {index <
                          routeResult.route.length -
                            1 && (

                          <span className="route-arrow-small">
                            →
                          </span>

                        )}

                      </span>

                    )
                  )}

                </div>


                <div className="route-time">

                  Total Travel Time:

                  <strong>
                    {routeResult.time} minutes
                  </strong>

                </div>

              </>

            ) : (

              <>

                <div className="route-result-title">
                  ✕ No Route Available
                </div>

                <p>
                  The destination cannot be reached using the
                  currently open roads.
                </p>

              </>

            )}

          </div>

        )}

      </div>


      {/* CITY GRAPH */}

      <div className="panel graph-panel">

        <div className="panel-header">

          <div>

            <h2>
              Emergency Road Network
            </h2>

            <p>
              Click a road to open or close it
            </p>

          </div>

        </div>


        <div className="city-graph-wrapper">

          <svg
            className="city-graph-svg"
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
          >

            {/* ROAD 1 */}

            <g onClick={() => toggleRoad(1)}>

              <line
                className="city-road-hit"
                x1="180"
                y1="120"
                x2="400"
                y2="120"
              />

              <line
                className={
                  roads[0].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "H1",
                        "J1"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="180"
                y1="120"
                x2="400"
                y2="120"
              />

              <text
                className="city-road-label"
                x="290"
                y="105"
              >
                4 min
              </text>

            </g>


            {/* ROAD 2 */}

            <g onClick={() => toggleRoad(2)}>

              <line
                className="city-road-hit"
                x1="500"
                y1="130"
                x2="700"
                y2="230"
              />

              <line
                className={
                  roads[1].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "J1",
                        "J2"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="500"
                y1="130"
                x2="700"
                y2="230"
              />

              <text
                className="city-road-label"
                x="600"
                y="165"
              >
                3 min
              </text>

            </g>


            {/* ROAD 3 */}

            <g onClick={() => toggleRoad(3)}>

              <line
                className="city-road-hit"
                x1="150"
                y1="160"
                x2="400"
                y2="350"
              />

              <line
                className={
                  roads[2].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "H1",
                        "J3"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="150"
                y1="160"
                x2="400"
                y2="350"
              />

              <text
                className="city-road-label"
                x="270"
                y="260"
              >
                5 min
              </text>

            </g>


            {/* ROAD 4 */}

            <g onClick={() => toggleRoad(4)}>

              <line
                className="city-road-hit"
                x1="500"
                y1="370"
                x2="700"
                y2="270"
              />

              <line
                className={
                  roads[3].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "J3",
                        "J2"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="500"
                y1="370"
                x2="700"
                y2="270"
              />

              <text
                className="city-road-label"
                x="600"
                y="315"
              >
                6 min
              </text>

            </g>


            {/* ROAD 5 */}

            <g onClick={() => toggleRoad(5)}>

              <line
                className="city-road-hit"
                x1="750"
                y1="290"
                x2="750"
                y2="350"
              />

              <line
                className={
                  roads[4].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "J2",
                        "H2"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="750"
                y1="290"
                x2="750"
                y2="350"
              />

              <text
                className="city-road-label"
                x="780"
                y="325"
              >
                2 min
              </text>

            </g>


            {/* ROAD 6 */}

            <g onClick={() => toggleRoad(6)}>

              <line
                className="city-road-hit"
                x1="180"
                y1="390"
                x2="700"
                y2="250"
              />

              <line
                className={
                  roads[5].status ===
                  "Closed"
                    ? "city-road closed"
                    : isRoadInRoute(
                        "S1",
                        "J2"
                      )
                    ? "city-road route-highlight"
                    : "city-road"
                }
                x1="180"
                y1="390"
                x2="700"
                y2="250"
              />

              <text
                className="city-road-label"
                x="430"
                y="325"
              >
                4 min
              </text>

            </g>


            {/* H1 */}

            <g className="city-node">

              <rect
                x="70"
                y="85"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="125"
                y="115"
                className="city-node-id"
                textAnchor="middle"
              >
                H1
              </text>

              <text
                x="125"
                y="138"
                className="city-node-name"
                textAnchor="middle"
              >
                Hospital
              </text>

            </g>


            {/* J1 */}

            <g className="city-node">

              <rect
                x="400"
                y="85"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="455"
                y="115"
                className="city-node-id"
                textAnchor="middle"
              >
                J1
              </text>

              <text
                x="455"
                y="138"
                className="city-node-name"
                textAnchor="middle"
              >
                Junction
              </text>

            </g>


            {/* J2 */}

            <g className="city-node">

              <rect
                x="700"
                y="220"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="755"
                y="250"
                className="city-node-id"
                textAnchor="middle"
              >
                J2
              </text>

              <text
                x="755"
                y="273"
                className="city-node-name"
                textAnchor="middle"
              >
                Junction
              </text>

            </g>


            {/* J3 */}

            <g className="city-node">

              <rect
                x="400"
                y="350"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="455"
                y="380"
                className="city-node-id"
                textAnchor="middle"
              >
                J3
              </text>

              <text
                x="455"
                y="403"
                className="city-node-name"
                textAnchor="middle"
              >
                Junction
              </text>

            </g>


            {/* H2 */}

            <g className="city-node">

              <rect
                x="700"
                y="350"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="755"
                y="380"
                className="city-node-id"
                textAnchor="middle"
              >
                H2
              </text>

              <text
                x="755"
                y="403"
                className="city-node-name"
                textAnchor="middle"
              >
                Hospital
              </text>

            </g>


            {/* S1 */}

            <g className="city-node">

              <rect
                x="70"
                y="350"
                width="110"
                height="70"
                rx="12"
              />

              <text
                x="125"
                y="380"
                className="city-node-id"
                textAnchor="middle"
              >
                S1
              </text>

              <text
                x="125"
                y="403"
                className="city-node-name"
                textAnchor="middle"
              >
                Fire Station
              </text>

            </g>

          </svg>

        </div>

      </div>


      {/* ROAD NETWORK */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Road Network
            </h2>

            <p>
              Current graph edges
            </p>

          </div>

        </div>


        {roads.map((road) => (

          <div
            className="road-row"
            key={road.id}
          >

            <div className="road-route">

              <strong>
                {road.from}
              </strong>

              <span>
                →
              </span>

              <strong>
                {road.to}
              </strong>

            </div>


            <div className="road-weight">

              <span>
                Travel Time
              </span>

              <strong>
                {road.time} min
              </strong>

            </div>


            <div className="road-status">

              <span
                className={
                  road.status ===
                  "Open"
                    ? "road-open-status"
                    : "road-closed-status"
                }
              >
                ● {road.status}
              </span>


              <button
                className="road-toggle-button"
                onClick={() =>
                  toggleRoad(
                    road.id
                  )
                }
              >

                {road.status ===
                "Open"
                  ? "Close Road"
                  : "Open Road"}

              </button>

            </div>

          </div>

        ))}

      </div>


      {/* ========================================================= */}
      {/* DISCRETE MATHEMATICS */}
      {/* ========================================================= */}

      <div className="panel math-panel">

        <div className="panel-header">

          <div>

            <h2>
              Discrete Mathematics & Graph Model
            </h2>

            <p>
              Mathematical foundation of the emergency dispatch and routing system
            </p>

          </div>

        </div>


        {/* GRAPH REPRESENTATION */}

        <div className="math-grid">

          <div className="math-card">

            <span className="math-card-label">
              01 · GRAPH REPRESENTATION
            </span>

            <h3>
              G = (V, E)
            </h3>

            <p>
              The city road network is represented using
              a mathematical graph where locations are
              vertices and roads are edges.
            </p>


            <div className="math-definition">

              <div>

                <strong>
                  V
                </strong>

                <span>
                  Set of Vertices
                </span>

                <p>
                  {"V = {H1, H2, J1, J2, J3, S1}"}
                </p>

                <small>
                  6 locations in the emergency network
                </small>

              </div>


              <div>

                <strong>
                  E
                </strong>

                <span>
                  Set of Edges
                </span>

                <p>
                  {"E = {H1-J1, J1-J2, H1-J3, J3-J2, J2-H2, S1-J2}"}
                </p>

                <small>
                  6 road connections
                </small>

              </div>

            </div>

          </div>


          {/* GRAPH PROPERTIES */}

          <div className="math-card">

            <span className="math-card-label">
              02 · GRAPH PROPERTIES
            </span>

            <h3>
              Network Structure
            </h3>

            <p>
              The emergency road network is represented
              as a connected, undirected and weighted graph.
            </p>


            <div className="property-list">

              <div>
                <span>
                  Vertices |V|
                </span>

                <strong>
                  6
                </strong>
              </div>


              <div>
                <span>
                  Edges |E|
                </span>

                <strong>
                  6
                </strong>
              </div>


              <div>
                <span>
                  Graph Type
                </span>

                <strong>
                  Undirected
                </strong>
              </div>


              <div>
                <span>
                  Graph Weight
                </span>

                <strong>
                  Travel Time
                </strong>
              </div>


              <div>
                <span>
                  Connectivity
                </span>

                <strong>
                  Connected
                </strong>
              </div>


              <div>
                <span>
                  Edge Direction
                </span>

                <strong>
                  Both Ways
                </strong>
              </div>

            </div>

          </div>

        </div>


        {/* WEIGHTED GRAPH */}

        <div className="math-card math-wide-card">

          <span className="math-card-label">
            03 · WEIGHTED GRAPH
          </span>

          <h3>
            Edge Weights
          </h3>

          <p>
            Every road has a numerical weight representing
            its estimated travel time. These weights are used
            by Dijkstra's algorithm to calculate the shortest route.
          </p>


          <div className="weight-list">

            <div>
              <span>
                H1 → J1
              </span>

              <strong>
                4 min
              </strong>
            </div>


            <div>
              <span>
                J1 → J2
              </span>

              <strong>
                3 min
              </strong>
            </div>


            <div>
              <span>
                H1 → J3
              </span>

              <strong>
                5 min
              </strong>
            </div>


            <div>
              <span>
                J3 → J2
              </span>

              <strong>
                6 min
              </strong>
            </div>


            <div>
              <span>
                J2 → H2
              </span>

              <strong>
                2 min
              </strong>
            </div>


            <div>
              <span>
                S1 → J2
              </span>

              <strong>
                4 min
              </strong>
            </div>

          </div>

        </div>


        {/* VERTEX DEGREE */}

        <div className="math-card math-wide-card">

          <span className="math-card-label">
            04 · VERTEX DEGREE
          </span>

          <h3>
            Degree of Each Vertex
          </h3>

          <p>
            The degree of a vertex represents the number
            of roads directly connected to that location.
          </p>


          <div className="degree-grid">

            <div>

              <strong>
                H1
              </strong>

              <span>
                Degree = 2
              </span>

              <small>
                Connected to J1, J3
              </small>

            </div>


            <div>

              <strong>
                J1
              </strong>

              <span>
                Degree = 2
              </span>

              <small>
                Connected to H1, J2
              </small>

            </div>


            <div>

              <strong>
                J2
              </strong>

              <span>
                Degree = 4
              </span>

              <small>
                Connected to J1, J3, H2, S1
              </small>

            </div>


            <div>

              <strong>
                J3
              </strong>

              <span>
                Degree = 2
              </span>

              <small>
                Connected to H1, J2
              </small>

            </div>


            <div>

              <strong>
                H2
              </strong>

              <span>
                Degree = 1
              </span>

              <small>
                Connected to J2
              </small>

            </div>


            <div>

              <strong>
                S1
              </strong>

              <span>
                Degree = 1
              </span>

              <small>
                Connected to J2
              </small>

            </div>

          </div>

        </div>


        {/* ADJACENCY REPRESENTATION */}

        <div className="math-card math-wide-card">

          <span className="math-card-label">
            05 · ADJACENCY REPRESENTATION
          </span>

          <h3>
            Graph Adjacency
          </h3>

          <p>
            Since the graph is undirected, every road connection
            appears in the adjacency list of both connected vertices.
          </p>


          <div className="adjacency-list">

            <div>
              <strong>
                H1
              </strong>

              <span>
                J1 (4), J3 (5)
              </span>
            </div>


            <div>
              <strong>
                J1
              </strong>

              <span>
                H1 (4), J2 (3)
              </span>
            </div>


            <div>
              <strong>
                J2
              </strong>

              <span>
                J1 (3), J3 (6), H2 (2), S1 (4)
              </span>
            </div>


            <div>
              <strong>
                J3
              </strong>

              <span>
                H1 (5), J2 (6)
              </span>
            </div>


            <div>
              <strong>
                H2
              </strong>

              <span>
                J2 (2)
              </span>
            </div>


            <div>
              <strong>
                S1
              </strong>

              <span>
                J2 (4)
              </span>
            </div>

          </div>

        </div>


        {/* SHORTEST PATH MATHEMATICS */}

        <div className="algorithm-card">

          <div className="algorithm-heading">

            <div className="algorithm-number">
              06
            </div>

            <div>

              <span>
                SHORTEST PATH CALCULATION
              </span>

              <h3>
                Example: H1 → J2
              </h3>

            </div>

          </div>


          <p className="algorithm-description">
            Consider an emergency that requires a response
            from H1 to J2. There are two possible paths
            between these locations.
          </p>


          <div className="path-calculation">

            <div className="calculation-option">

              <span>
                PATH 1
              </span>

              <strong>
                H1 → J1 → J2
              </strong>

              <p>
                4 + 3 = <b>7 minutes</b>
              </p>

            </div>


            <div className="calculation-option">

              <span>
                PATH 2
              </span>

              <strong>
                H1 → J3 → J2
              </strong>

              <p>
                5 + 6 = <b>11 minutes</b>
              </p>

            </div>

          </div>


          <div className="math-result-box">

            <span>
              SHORTEST PATH
            </span>

            <strong>
              H1 → J1 → J2
            </strong>

            <p>
              Minimum travel time = 7 minutes
            </p>

          </div>

        </div>


        {/* DIJKSTRA ALGORITHM */}

        <div className="algorithm-card">

          <div className="algorithm-heading">

            <div className="algorithm-number">
              07
            </div>

            <div>

              <span>
                SHORTEST PATH ALGORITHM
              </span>

              <h3>
                Dijkstra's Algorithm
              </h3>

            </div>

          </div>


          <p className="algorithm-description">
            Dijkstra's algorithm finds the minimum-weight path
            from a source vertex to a destination in a weighted
            graph with non-negative edge weights.
          </p>


          <div className="algorithm-steps">

            <div className="algorithm-step">

              <strong>
                1
              </strong>

              <div>

                <h4>
                  Initialize
                </h4>

                <p>
                  Set the source vertex distance to 0 and
                  all other vertices to infinity.
                </p>

              </div>

            </div>


            <div className="algorithm-step">

              <strong>
                2
              </strong>

              <div>

                <h4>
                  Select Minimum
                </h4>

                <p>
                  Select the unvisited vertex with the
                  smallest known distance.
                </p>

              </div>

            </div>


            <div className="algorithm-step">

              <strong>
                3
              </strong>

              <div>

                <h4>
                  Relax Edges
                </h4>

                <p>
                  Check neighbouring vertices and update
                  their distances if a shorter path is found.
                </p>

              </div>

            </div>


            <div className="algorithm-step">

              <strong>
                4
              </strong>

              <div>

                <h4>
                  Repeat
                </h4>

                <p>
                  Continue the process until the destination
                  is reached or no reachable vertices remain.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* DIJKSTRA TABLE */}

        <div className="math-card math-wide-card">

          <span className="math-card-label">
            08 · DIJKSTRA ITERATION
          </span>

          <h3>
            Distance Calculation
          </h3>

          <p>
            Starting from H1, the shortest known distances
            are updated as the algorithm explores the graph.
          </p>


          <div className="dijkstra-table">

            <div className="dijkstra-row dijkstra-header">

              <span>
                Vertex
              </span>

              <span>
                Initial Distance
              </span>

              <span>
                Final Shortest Distance
              </span>

            </div>


            <div className="dijkstra-row">

              <strong>
                H1
              </strong>

              <span>
                0
              </span>

              <strong>
                0 min
              </strong>

            </div>


            <div className="dijkstra-row">

              <strong>
                J1
              </strong>

              <span>
                ∞
              </span>

              <strong>
                4 min
              </strong>

            </div>


            <div className="dijkstra-row">

              <strong>
                J3
              </strong>

              <span>
                ∞
              </span>

              <strong>
                5 min
              </strong>

            </div>


            <div className="dijkstra-row">

              <strong>
                J2
              </strong>

              <span>
                ∞
              </span>

              <strong>
                7 min
              </strong>

            </div>


            <div className="dijkstra-row">

              <strong>
                H2
              </strong>

              <span>
                ∞
              </span>

              <strong>
                9 min
              </strong>

            </div>


            <div className="dijkstra-row">

              <strong>
                S1
              </strong>

              <span>
                ∞
              </span>

              <strong>
                11 min
              </strong>

            </div>

          </div>


          <div className="formula-box">

            <span>
              RELAXATION FORMULA
            </span>

            <strong>
              d(v) = min[d(v), d(u) + w(u,v)]
            </strong>

            <p>
              The distance to a neighbouring vertex is updated
              whenever travelling through the current vertex
              produces a smaller total weight.
            </p>

          </div>

        </div>


        {/* ROAD CLOSURE MATHEMATICS */}

        <div className="math-card math-wide-card">

          <span className="math-card-label">
            09 · DYNAMIC GRAPH
          </span>

          <h3>
            Effect of Road Closures
          </h3>

          <p>
            When a road is closed, its edge is removed from
            the active graph. Dijkstra's algorithm then
            recalculates the route using only available edges.
          </p>


          <div className="comparison-box">

            <div>

              <span>
                ALL ROADS OPEN
              </span>

              <strong>
                H1 → J1 → J2
              </strong>

              <p>
                4 + 3 = 7 minutes
              </p>

            </div>


            <div className="comparison-arrow">
              →
            </div>


            <div>

              <span>
                H1-J1 CLOSED
              </span>

              <strong>
                H1 → J3 → J2
              </strong>

              <p>
                5 + 6 = 11 minutes
              </p>

            </div>

          </div>

        </div>


        {/* REAL WORLD APPLICATION */}

        <div className="application-card">

          <div>

            <span>
              10 · REAL-WORLD APPLICATION
            </span>

            <h3>
              Emergency Response Routing
            </h3>

            <p>
              When an emergency occurs, the system represents
              the available roads as a weighted graph. The
              emergency location becomes the source vertex and
              the destination becomes the target vertex.
              Dijkstra's algorithm calculates the minimum travel
              time using the currently open roads.
            </p>

          </div>


          <div className="application-flow">

            <div>

              <strong>
                Emergency
              </strong>

              <span>
                Incident detected
              </span>

            </div>


            <div className="flow-arrow">
              →
            </div>


            <div>

              <strong>
                Graph
              </strong>

              <span>
                Model road network
              </span>

            </div>


            <div className="flow-arrow">
              →
            </div>


            <div>

              <strong>
                Weights
              </strong>

              <span>
                Travel time
              </span>

            </div>


            <div className="flow-arrow">
              →
            </div>


            <div>

              <strong>
                Dijkstra
              </strong>

              <span>
                Find shortest path
              </span>

            </div>


            <div className="flow-arrow">
              →
            </div>


            <div>

              <strong>
                Dispatch
              </strong>

              <span>
                Send response unit
              </span>

            </div>

          </div>

        </div>

      </div>

    </>
  );
}

export default CityMap;