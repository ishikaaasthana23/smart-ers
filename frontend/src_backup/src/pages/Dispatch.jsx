import { useState } from "react";
import Header from "../components/Header";
import roads from "../data/roads.js";
function Dispatch() {

  const incidents = [
    {
      id: "E1",
      type: "Cardiac Arrest",
      location: "J1",
      severity: "Critical",
      capability: "ALS"
    },
    {
      id: "E2",
      type: "Building Fire",
      location: "J2",
      severity: "High",
      capability: "Fire Suppression"
    },
    {
      id: "E3",
      type: "Road Accident",
      location: "J2",
      severity: "Medium",
      capability: "BLS"
    }
  ];


  const resources = [
    {
      id: "A1",
      name: "BLS Ambulance",
      location: "H1",
      capabilities: ["BLS"],
      status: "Available",
      responseLimit: 15
    },
    {
      id: "A2",
      name: "ALS / Trauma Ambulance",
      location: "H2",
      capabilities: ["ALS", "Trauma"],
      status: "Available",
      responseLimit: 15
    },
    {
      id: "F1",
      name: "Fire Engine",
      location: "S1",
      capabilities: ["Fire Suppression", "Rescue"],
      status: "Available",
      responseLimit: 20
    },
    {
      id: "P1",
      name: "Police Unit",
      location: "J2",
      capabilities: ["Police"],
      status: "Occupied",
      responseLimit: 15
    }
  ];


  /*
    ROAD GRAPH

    Only these roads are currently open.
  */

  


  const [selectedIncident, setSelectedIncident] =
    useState("E1");


  /*
    SHORTEST PATH
  */

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

    nodes.forEach(node => {
      graph[node] = [];
    });


    roads
  .filter(road => road.open)
  .forEach(road => {

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


    nodes.forEach(node => {
      distance[node] = Infinity;
      previous[node] = null;
    });


    distance[start] = 0;


    while (unvisited.size > 0) {

      let current = null;
      let smallest = Infinity;


      unvisited.forEach(node => {

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


      graph[current].forEach(neighbor => {

        if (!unvisited.has(neighbor.node)) {
          return;
        }


        const newDistance =
          distance[current] + neighbor.time;


        if (
          newDistance <
          distance[neighbor.node]
        ) {

          distance[neighbor.node] =
            newDistance;

          previous[neighbor.node] =
            current;

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


  /*
    CAPABILITY CHECK
  */

  function hasCapability(resource, incident) {

    return resource.capabilities.includes(
      incident.capability
    );

  }


  /*
    ELIGIBILITY ENGINE
  */

  function evaluateResource(resource, incident) {

    const available =
      resource.status === "Available";


    const capable =
      hasCapability(resource, incident);


    const route =
      shortestPath(
        resource.location,
        incident.location
      );


    const reachable =
      route !== null;


    const withinLimit =
      reachable &&
      route.time <= resource.responseLimit;


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
      route
    };

  }


  const incident =
    incidents.find(
      item => item.id === selectedIncident
    );


  const evaluations =
    resources.map(resource => ({
      resource,
      result: evaluateResource(
        resource,
        incident
      )
    }));


  const eligibleResources =
    evaluations.filter(
      item => item.result.eligible
    );


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

            <h2>
              Select Emergency
            </h2>

            <p>
              Test which resources are eligible
            </p>

          </div>

        </div>


        <div className="incident-selector">

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
      onClick={() => setSelectedIncident(item.id)}
    >
      <strong>{item.id}</strong>

      <span>{item.type}</span>

      <small>{item.severity}</small>
    </button>

  ))}

</div>

        </div>

      </div>


      {/* INCIDENT DETAILS */}

      <div className="panel">

        <div className="dispatch-incident">

          <div>

            <span>
              ACTIVE INCIDENT
            </span>

            <h2>
              {incident.id} — {incident.type}
            </h2>

          </div>


          <div className="dispatch-details">

            <div>
              <small>LOCATION</small>
              <strong>{incident.location}</strong>
            </div>

            <div>
              <small>SEVERITY</small>
              <strong>{incident.severity}</strong>
            </div>

            <div>
              <small>REQUIRED CAPABILITY</small>
              <strong>{incident.capability}</strong>
            </div>

          </div>

        </div>

      </div>


      {/* LOGIC */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Eligibility Rule
            </h2>

            <p>
              A resource must satisfy every condition
            </p>

          </div>

        </div>


        <div className="logic-equation">

          <strong>
            Eligible(x,e)
          </strong>

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

            <h2>
              Resource Evaluation
            </h2>

            <p>
              Logical evaluation for {incident.id}
            </p>

          </div>

        </div>


        {evaluations.map(item => {

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

                <span>
                  Available
                </span>

                <strong
                  className={
                    result.available
                      ? "check-yes"
                      : "check-no"
                  }
                >
                  {result.available ? "✓" : "✕"}
                </strong>

              </div>


              <div className="evaluation-check">

                <span>
                  Capable
                </span>

                <strong
                  className={
                    result.capable
                      ? "check-yes"
                      : "check-no"
                  }
                >
                  {result.capable ? "✓" : "✕"}
                </strong>

              </div>


              <div className="evaluation-check">

                <span>
                  Reachable
                </span>

                <strong
                  className={
                    result.reachable
                      ? "check-yes"
                      : "check-no"
                  }
                >
                  {result.reachable ? "✓" : "✕"}
                </strong>

              </div>


              <div className="evaluation-check">

                <span>
                  Time Limit
                </span>

                <strong
                  className={
                    result.withinLimit
                      ? "check-yes"
                      : "check-no"
                  }
                >
                  {result.withinLimit ? "✓" : "✕"}
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

            <h2>
              Eligible Resources
            </h2>

            <p>
              Resources satisfying all logical conditions
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

          eligibleResources.map(item => (

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

                <span>
                  Route
                </span>

                <strong>
                  {item.result.route.path.join(" → ")}
                </strong>

              </div>


              <div>

                <span>
                  Response Time
                </span>

                <strong>
                  {item.result.route.time} min
                </strong>

              </div>

            </div>

          ))

        )}

      </div>

    </>

  );
}

export default Dispatch;