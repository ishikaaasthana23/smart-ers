import { useState } from "react";
import Header from "../components/Header";

function Priority() {

  const [incidents] = useState([
    {
      id: "E1",
      type: "Cardiac Arrest",
      location: "J1",
      severity: "Critical",
      severityValue: 4,
      people: 1,
      waiting: 8,
      specialist: true
    },
    {
      id: "E2",
      type: "Building Fire",
      location: "J2",
      severity: "High",
      severityValue: 3,
      people: 12,
      waiting: 5,
      specialist: true
    },
    {
      id: "E3",
      type: "Road Accident",
      location: "H2",
      severity: "Medium",
      severityValue: 2,
      people: 2,
      waiting: 12,
      specialist: false
    },
    {
      id: "E4",
      type: "Traffic Obstruction",
      location: "J3",
      severity: "Low",
      severityValue: 1,
      people: 3,
      waiting: 18,
      specialist: false
    }
  ]);


  /*
    PRIORITY SCORE

    Severity has the largest influence.
    Waiting time and affected people provide
    additional priority information.
  */

  function calculateScore(incident) {

    return (
      incident.severityValue * 10 +
      Math.min(incident.people, 20) +
      Math.min(incident.waiting, 20) +
      (incident.specialist ? 5 : 0)
    );

  }


  /*
    Compare two incidents.

    An incident dominates another if it has:
    - equal or greater severity
    - equal or greater waiting time
    - equal or greater affected people
    - and is strictly greater in at least one
  */

  function dominates(a, b) {

    const conditions = [
      a.severityValue >= b.severityValue,
      a.waiting >= b.waiting,
      a.people >= b.people
    ];

    const strictlyGreater = [
      a.severityValue > b.severityValue,
      a.waiting > b.waiting,
      a.people > b.people
    ];

    return (
      conditions.every(Boolean) &&
      strictlyGreater.some(Boolean)
    );

  }


  function relation(a, b) {

    if (dominates(a, b)) {
      return "Higher priority";
    }

    if (dominates(b, a)) {
      return "Lower priority";
    }

    return "Incomparable";

  }


  const scoredIncidents = incidents
    .map(incident => ({
      ...incident,
      score: calculateScore(incident)
    }))
    .sort((a, b) => b.score - a.score);


  return (
    <>

      <Header
        title="Emergency Priority Engine"
        subtitle="Partial-order model for competing emergency incidents"
      />


      {/* PRIORITY MODEL */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Priority Model
            </h2>

            <p>
              Incidents are evaluated using multiple criteria
            </p>

          </div>

        </div>


        <div className="priority-formula">

          <div className="formula-title">
            Priority Score
          </div>

          <div className="formula">
            Severity × 10 + Affected People + Waiting Time + Specialist Requirement
          </div>

        </div>

      </div>


      {/* INCIDENT TABLE */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Active Incidents
            </h2>

            <p>
              Current priority characteristics
            </p>

          </div>

        </div>


        <div className="priority-table-header">

          <span>INCIDENT</span>
          <span>SEVERITY</span>
          <span>PEOPLE</span>
          <span>WAITING</span>
          <span>SPECIALIST</span>
          <span>SCORE</span>

        </div>


        {scoredIncidents.map((incident, index) => (

          <div
            className="priority-row"
            key={incident.id}
          >

            <div className="priority-incident">

              <strong>
                {incident.id}
              </strong>

              <span>
                {incident.type}
              </span>

            </div>


            <div>

              <span
                className={
                  `severity severity-${incident.severity.toLowerCase()}`
                }
              >
                {incident.severity}
              </span>

            </div>


            <div className="priority-value">
              {incident.people}
            </div>


            <div className="priority-value">
              {incident.waiting} min
            </div>


            <div className="priority-value">

              {incident.specialist
                ? "Required"
                : "No"}

            </div>


            <div className="priority-score">

              {incident.score}

            </div>

          </div>

        ))}

      </div>


{/* PARTIAL ORDER */}

<div className="panel poset-panel">

  <div className="panel-header">

    <div>
      <h2>Partial-Order Relationships</h2>
      <p>Comparing incidents across multiple criteria</p>
    </div>

    <div className="poset-status">
      <span className="poset-status-dot"></span>
      RELATION ANALYSIS
    </div>

  </div>


  {/* Explanation */}

  <div className="poset-intro">

    <div className="poset-intro-icon">
      ∥
    </div>

    <div>
      <strong>Incomparability Matrix</strong>
      <p>
        Incidents are compared using priority, severity, waiting time,
        and specialist requirements. A parallel symbol indicates that
        neither incident dominates the other.
      </p>
    </div>

  </div>


  {/* Relation Matrix */}

  <div className="poset-matrix-wrapper">

    <table className="poset-matrix">

      <thead>

        <tr>

          <th>
            INCIDENT
          </th>

          {incidents.map(incident => (
            <th key={incident.id}>
              <div className="matrix-id">
                {incident.id}
              </div>

              <div className="matrix-type">
                {incident.type}
              </div>
            </th>
          ))}

        </tr>

      </thead>


      <tbody>

        {incidents.map(a => (

          <tr key={a.id}>

            <th className="matrix-row-label">

              <div className="matrix-id">
                {a.id}
              </div>

              <div className="matrix-type">
                {a.type}
              </div>

            </th>


            {incidents.map(b => {

              const relationship =
                a.id === b.id
                  ? "—"
                  : relation(a, b) === "Higher priority"
                    ? ">"
                    : relation(a, b) === "Lower priority"
                      ? "<"
                      : "∥";

              const relationClass =
                relationship === "∥"
                  ? "incomparable"
                  : relationship === "—"
                    ? "self"
                    : "ordered";

              return (

                <td
                  key={`${a.id}-${b.id}`}
                  className={`matrix-cell ${relationClass}`}
                >

                  {relationship}

                </td>

              );

            })}

          </tr>

        ))}

      </tbody>

    </table>

  </div>


  {/* Legend */}

  <div className="poset-legend">

    <div className="legend-item">
      <span className="legend-symbol incomparable-symbol">
        ∥
      </span>

      <div>
        <strong>Incomparable</strong>
        <small>
          Neither incident has higher priority than the other
        </small>
      </div>
    </div>


    <div className="legend-item">
      <span className="legend-symbol higher-symbol">
        &gt;
      </span>

      <div>
        <strong>Higher Priority</strong>
        <small>
          Row incident has greater priority
        </small>
      </div>
    </div>


    <div className="legend-item">
      <span className="legend-symbol lower-symbol">
        &lt;
      </span>

      <div>
        <strong>Lower Priority</strong>
        <small>
          Row incident has lower priority
        </small>
      </div>
    </div>

  </div>


  {/* Mathematical Summary */}

  <div className="poset-summary">

    <div className="summary-item">

      <span className="summary-value">
        {incidents.length}
      </span>

      <span className="summary-label">
        INCIDENTS
      </span>

    </div>


    <div className="summary-divider"></div>


    <div className="summary-item">

      <span className="summary-value">
        {incidents.length * (incidents.length - 1) / 2}
      </span>

      <span className="summary-label">
        UNIQUE PAIRS
      </span>

    </div>


    <div className="summary-divider"></div>


    <div className="summary-item">

      <span className="summary-value">
        {incidents.length * incidents.length}
      </span>

      <span className="summary-label">
        MATRIX RELATIONS
      </span>

    </div>

  </div>

</div>


      {/* HASSE DIAGRAM CONCEPT */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Poset Interpretation
            </h2>

            <p>
              Mathematical representation of incident priority
            </p>

          </div>

        </div>


        <div className="hasse-diagram">

          <div className="hasse-level">

            <div className="hasse-node critical">
              E1
              <span>Critical</span>
            </div>

          </div>


          <div className="hasse-line">
            ↓
          </div>


          <div className="hasse-level">

            <div className="hasse-node high">
              E2
              <span>High</span>
            </div>

            <div className="hasse-node medium">
              E3
              <span>Medium</span>
            </div>

          </div>


          <div className="hasse-line">
            ↓
          </div>


          <div className="hasse-level">

            <div className="hasse-node low">
              E4
              <span>Low</span>
            </div>

          </div>

        </div>


        <div className="poset-note">

          <strong>
            ∥ = Incomparable
          </strong>

          <p>
            Two incidents may be incomparable when neither
            dominates the other across all selected criteria.
            The dispatch system can then use additional
            operational rules such as resource availability
            or waiting-time thresholds.
          </p>

        </div>

      </div>

    </>
  );
}

export default Priority;