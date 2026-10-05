import { useState, useEffect } from "react";
import Header from "../components/Header";

function Dispatch() {
  const [incidents, setIncidents] = useState([]);
  const [resources, setResources] = useState([]);
  const [roads, setRoads] = useState([]);

  const [selectedIncident, setSelectedIncident] = useState("");
  const [dispatching, setDispatching] = useState(null);
  const [message, setMessage] = useState("");

  // ---------------------------------------
  // LOAD BACKEND DATA
  // ---------------------------------------

  async function fetchData() {
    try {
      const [incidentsRes, resourcesRes, roadsRes] = await Promise.all([
        fetch("/api/incidents"),
        fetch("/api/resources"),
        fetch("/api/roads")
      ]);

      if (!incidentsRes.ok || !resourcesRes.ok || !roadsRes.ok) {
        throw new Error("Failed to load dispatch data");
      }

      const incidentsData = await incidentsRes.json();
      const resourcesData = await resourcesRes.json();
      const roadsData = await roadsRes.json();

      setIncidents(incidentsData);
      setResources(resourcesData);
      setRoads(roadsData);

      if (incidentsData.length > 0 && !selectedIncident) {
        setSelectedIncident(incidentsData[0].id);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load dispatch data.");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // ---------------------------------------
  // CAPABILITY MAPPING
  // ---------------------------------------

  function getIncidentCapability(incident) {
    if (incident.type === "Accident") {
      return "BLS";
    }

    if (incident.type === "Fire") {
      return "Fire Suppression";
    }

    if (incident.type === "Medical") {
      return "ALS";
    }

    if (incident.type === "Rescue") {
      return "Rescue";
    }

    return "General";
  }

  function getResourceCapabilities(resource) {
    if (resource.type === "Ambulance") {
      if (resource.name.toLowerCase().includes("als")) {
        return ["ALS", "Trauma", "BLS"];
      }

      return ["BLS"];
    }

if (resource.type === "Fire Truck") {
  return ["Fire Suppression", "Rescue"];
}

if (resource.type === "Police Vehicle") {
  return ["Police"];
}

    return [];
  }

  function getResponseLimit(resource) {
    if (resource.type === "Ambulance") {
      return 15;
    }

if (resource.type === "Fire Truck") {
  return 20;
}

if (resource.type === "Police Vehicle") {
  return 15;
}

    return 20;
  }

  // ---------------------------------------
  // SHORTEST PATH - DIJKSTRA
  // ---------------------------------------

  function shortestPath(start, destination) {
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

    const distance = {};
    const previous = {};
    const unvisited = new Set(nodes);

    nodes.forEach((node) => {
      distance[node] = Infinity;
      previous[node] = null;
    });

    distance[start] = 0;

    while (unvisited.size > 0) {
      let current = null;
      let smallest = Infinity;

      unvisited.forEach((node) => {
        if (distance[node] < smallest) {
          smallest = distance[node];
          current = node;
        }
      });

      if (current === null) {
        break;
      }

      unvisited.delete(current);

      if (current === destination) {
        break;
      }

      graph[current].forEach((neighbor) => {
        if (!unvisited.has(neighbor.node)) {
          return;
        }

        const newDistance =
          distance[current] + neighbor.time;

        if (newDistance < distance[neighbor.node]) {
          distance[neighbor.node] = newDistance;
          previous[neighbor.node] = current;
        }
      });
    }

    if (distance[destination] === Infinity) {
      return null;
    }

    const path = [];
    let current = destination;

    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return {
      path,
      time: distance[destination]
    };
  }

  // ---------------------------------------
  // RESOURCE ELIGIBILITY
  // ---------------------------------------

  function evaluateResource(resource, incident) {
    const available =
      resource.status === "Available";

    const capabilities =
      getResourceCapabilities(resource);

    const requiredCapability =
      getIncidentCapability(incident);

    const capable =
      capabilities.includes(requiredCapability);

    const route =
      shortestPath(
        resource.location,
        incident.location
      );

    const reachable =
      route !== null;

    const responseLimit =
      getResponseLimit(resource);

    const withinLimit =
      reachable &&
      route.time <= responseLimit;

    const eligible =
      available &&
      capable &&
      reachable &&
      withinLimit;

    return {
      available,
      capable,
      reachable,
      withinLimit,
      eligible,
      route,
      responseLimit,
      requiredCapability
    };
  }

  // ---------------------------------------
  // CURRENT INCIDENT
  // ---------------------------------------

  const incident =
    incidents.find(
      (item) => item.id === selectedIncident
    );

  // ---------------------------------------
  // EVALUATIONS
  // ---------------------------------------

  const evaluations = incident
    ? resources.map((resource) => ({
        resource,
        result: evaluateResource(
          resource,
          incident
        )
      }))
    : [];

  const eligibleResources =
    evaluations.filter(
      (item) => item.result.eligible
    );

  // ---------------------------------------
  // DISPATCH RESOURCE
  // ---------------------------------------

  async function dispatchResource(resource, route) {
    if (!incident || !route) {
      return;
    }

    setDispatching(resource.id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/dispatches",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            incidentId: incident.id,
            resourceId: resource.id,
            estimatedArrival: route.time,
            route: route.path.join(" → "),
            notes:
              `Automatic dispatch using Dijkstra shortest path. Route: ${route.path.join(
                " → "
              )}`
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Dispatch failed"
        );
      }

      setMessage(
        `✓ ${resource.id} successfully dispatched to ${incident.id}`
      );

      await fetchData();
    } catch (error) {
      console.error(error);
      setMessage(`✕ ${error.message}`);
    } finally {
      setDispatching(null);
    }
  }

  // ---------------------------------------
  // UI
  // ---------------------------------------

  return (
    <>
      <Header
        title="Dispatch Eligibility Engine"
        subtitle="Logical filtering of resources against emergency requirements"
      />

      {/* INCIDENT SELECTOR */}

      <div className="panel dispatch-selector">
        <div className="panel-header">
          <div>
            <h2>Select Emergency</h2>
            <p>
              Test which resources are eligible
            </p>
          </div>

          <button
            className="add-button"
            onClick={fetchData}
          >
            ↻ Refresh
          </button>
        </div>

        <div className="incident-selector">
          {incidents.map((item) => (
            <button
              key={item.id}
              type="button"
              className={
                selectedIncident === item.id
                  ? "incident-select active"
                  : "incident-select"
              }
              onClick={() =>
                setSelectedIncident(item.id)
              }
            >
              <strong>{item.id}</strong>

              <span>{item.type}</span>

              <small>{item.severity}</small>
            </button>
          ))}
        </div>
      </div>

      {!incident ? (
        <div className="panel">
          <h2>No incidents available</h2>
          <p>
            Create an incident from the Incident
            Management page first.
          </p>
        </div>
      ) : (
        <>
          {/* INCIDENT DETAILS */}

          <div className="panel">
            <div className="dispatch-incident">
              <div>
                <span>ACTIVE INCIDENT</span>

                <h2>
                  {incident.id} — {incident.type}
                </h2>
              </div>

              <div className="dispatch-details">
                <div>
                  <small>LOCATION</small>
                  <strong>
                    {incident.location}
                  </strong>
                </div>

                <div>
                  <small>SEVERITY</small>
                  <strong>
                    {incident.severity}
                  </strong>
                </div>

                <div>
                  <small>REQUIRED CAPABILITY</small>
                  <strong>
                    {getIncidentCapability(
                      incident
                    )}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* MESSAGE */}

          {message && (
            <div className="panel">
              <strong>{message}</strong>
            </div>
          )}

          {/* LOGIC */}

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Eligibility Rule</h2>

                <p>
                  A resource must satisfy every
                  condition
                </p>
              </div>
            </div>

            <div className="logic-equation">
              <strong>Eligible(x,e)</strong>

              <span>=</span>

              <div className="logic-condition">
                Available
              </div>

              <span>∧</span>

              <div className="logic-condition">
                Capable
              </div>

              <span>∧</span>

              <div className="logic-condition">
                Reachable
              </div>

              <span>∧</span>

              <div className="logic-condition">
                Within Limit
              </div>
            </div>
          </div>

          {/* RESOURCE EVALUATION */}

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Resource Evaluation</h2>

                <p>
                  Logical evaluation for{" "}
                  {incident.id}
                </p>
              </div>
            </div>

            {evaluations.map((item) => {
              const {
                resource,
                result
              } = item;

              return (
                <div
                  className={
                    result.eligible
                      ? "evaluation eligible"
                      : "evaluation rejected"
                  }
                  key={resource.id}
                >
                  <div className="evaluation-resource">
                    <strong>
                      {resource.id}
                    </strong>

                    <span>
                      {resource.name}
                    </span>
                  </div>

                  <div className="evaluation-check">
                    <span>Available</span>

                    <strong
                      className={
                        result.available
                          ? "check-yes"
                          : "check-no"
                      }
                    >
                      {result.available
                        ? "✓"
                        : "✕"}
                    </strong>
                  </div>

                  <div className="evaluation-check">
                    <span>Capable</span>

                    <strong
                      className={
                        result.capable
                          ? "check-yes"
                          : "check-no"
                      }
                    >
                      {result.capable
                        ? "✓"
                        : "✕"}
                    </strong>
                  </div>

                  <div className="evaluation-check">
                    <span>Reachable</span>

                    <strong
                      className={
                        result.reachable
                          ? "check-yes"
                          : "check-no"
                      }
                    >
                      {result.reachable
                        ? "✓"
                        : "✕"}
                    </strong>
                  </div>

                  <div className="evaluation-check">
                    <span>Time Limit</span>

                    <strong
                      className={
                        result.withinLimit
                          ? "check-yes"
                          : "check-no"
                      }
                    >
                      {result.withinLimit
                        ? "✓"
                        : "✕"}
                    </strong>
                  </div>

                  <div className="evaluation-result">
                    {result.eligible
                      ? "ELIGIBLE"
                      : "REJECTED"}
                  </div>
                </div>
              );
            })}
          </div>

          {/* ELIGIBLE RESOURCES */}

          <div className="panel">
            <div className="panel-header">
              <div>
                <h2>Eligible Resources</h2>

                <p>
                  Resources satisfying all logical
                  conditions
                </p>
              </div>

              <strong className="eligible-count">
                {eligibleResources.length}
              </strong>
            </div>

            {eligibleResources.length === 0 ? (
              <div className="no-resource">
                No eligible resource available.
              </div>
            ) : (
              eligibleResources.map((item) => (
                <div
                  className="eligible-resource"
                  key={item.resource.id}
                >
                  <div>
                    <strong>
                      {item.resource.id}
                    </strong>

                    <span>
                      {item.resource.name}
                    </span>
                  </div>

                  <div>
                    <span>Route</span>

                    <strong>
                      {item.result.route.path.join(
                        " → "
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Response Time</span>

                    <strong>
                      {item.result.route.time} min
                    </strong>
                  </div>

                  <div>
                    <button
                      className="add-button"
                      disabled={
                        dispatching ===
                        item.resource.id
                      }
                      onClick={() =>
                        dispatchResource(
                          item.resource,
                          item.result.route
                        )
                      }
                    >
                      {dispatching ===
                      item.resource.id
                        ? "DISPATCHING..."
                        : "DISPATCH RESOURCE"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </>
  );
}

export default Dispatch;