import { useState, useEffect } from "react";
import Header from "../components/Header";

function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/incidents');
      if (res.ok) setIncidents(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const [form, setForm] = useState({
    id: "",
    type: "",
    location: "",
    severity: "Medium",
    capability: "BLS",
    people: 1
  });

  function handleChange(event) {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value
    });
  }

  async function addIncident(event) {
    event.preventDefault();

    if (!form.type || !form.location) {
      alert("Please fill all required fields.");
      return;
    }

    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${form.type} Emergency`,
          type: form.type,
          severity: form.severity,
          location: form.location,
          description: `Requires ${form.capability}. People affected: ${form.people}`
        })
      });

      if (res.ok) {
        fetchIncidents();
        setForm({
          id: "",
          type: "",
          location: "",
          severity: "Medium",
          capability: "BLS",
          people: 1
        });
        setShowForm(false);
      } else {
        alert("Failed to create incident");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to create incident");
    }
  }

  async function removeIncident(id) {
    try {
      const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchIncidents();
      }
    } catch (e) {
      console.error(e);
    }
  }


  function getPriority(severity) {

    if (severity === "Critical") return 1;

    if (severity === "High") return 2;

    if (severity === "Medium") return 3;

    return 4;

  }


  return (

    <>

      <Header
        title="Incident Management"
        subtitle="Receive, validate and monitor emergency incidents"
      />


      {/* ACTION BAR */}

      <div className="page-actions">

        <button
          className="add-button large-button"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm
            ? "✕ Close Form"
            : "+ Add Incident"}
        </button>

      </div>


      {/* ADD INCIDENT FORM */}

      {showForm && (

        <div className="panel incident-form-panel">

          <div className="panel-header">

            <div>

              <h2>
                Create Emergency Incident
              </h2>

              <p>
                Enter information used by the dispatch engine.
              </p>

            </div>

          </div>


          <form onSubmit={addIncident}>

            <div className="form-grid">


              {/* ID */}

              <div className="form-group">

                <label>
                  Incident ID *
                </label>

                <input
                  name="id"
                  value={form.id}
                  onChange={handleChange}
                  placeholder="Example: E4"
                />

              </div>


              {/* TYPE */}

              <div className="form-group">

                <label>
                  Emergency Type *
                </label>

                <input
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  placeholder="Example: Medical Emergency"
                />

              </div>


              {/* LOCATION */}

              <div className="form-group">

                <label>
                  Location *
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Example: J3"
                />

              </div>


              {/* SEVERITY */}

              <div className="form-group">

                <label>
                  Severity
                </label>

                <select
                  name="severity"
                  value={form.severity}
                  onChange={handleChange}
                >

                  <option value="Critical">
                    Critical
                  </option>

                  <option value="High">
                    High
                  </option>

                  <option value="Medium">
                    Medium
                  </option>

                  <option value="Low">
                    Low
                  </option>

                </select>

              </div>


              {/* CAPABILITY */}

              <div className="form-group">

                <label>
                  Required Capability
                </label>

                <select
                  name="capability"
                  value={form.capability}
                  onChange={handleChange}
                >

                  <option value="BLS">
                    BLS
                  </option>

                  <option value="ALS">
                    ALS
                  </option>

                  <option value="Trauma">
                    Trauma
                  </option>

                  <option value="Fire Suppression">
                    Fire Suppression
                  </option>

                  <option value="Rescue">
                    Rescue
                  </option>

                  <option value="Police">
                    Police
                  </option>

                </select>

              </div>


              {/* PEOPLE */}

              <div className="form-group">

                <label>
                  People Affected
                </label>

                <input
                  type="number"
                  min="1"
                  name="people"
                  value={form.people}
                  onChange={handleChange}
                />

              </div>


            </div>


            <button
              type="submit"
              className="submit-button"
            >
              Create Incident
            </button>

          </form>

        </div>

      )}


      {/* INCIDENT LIST */}

      <div className="panel">

        <div className="panel-header">

          <div>

            <h2>
              Active Incidents
            </h2>

            <p>
              {incidents.length} incidents currently registered
            </p>

          </div>

        </div>


        {incidents
          .sort(
            (a, b) =>
              getPriority(a.severity) -
              getPriority(b.severity)
          )
          .map((incident) => (

            <div
              className="incident"
              key={incident.id}
            >

              {/* ICON */}

              <div className="incident-icon">
                🚨
              </div>


              {/* INFORMATION */}

              <div className="incident-info">

                <div className="incident-title">

                  <strong>
                    {incident.id} — {incident.type}
                  </strong>

                  <span
                    className={`badge ${incident.severity.toLowerCase()}-badge`}
                  >
                    {incident.severity.toUpperCase()}
                  </span>

                </div>


                <p>
                  📍 {incident.location}
                </p>


                <small>
                  Required: {incident.capability}
                  {" • "}
                  People affected: {incident.people}
                </small>

              </div>


              {/* WAITING */}

              <div className="incident-time">

                <strong>
                  P{getPriority(incident.severity)}
                </strong>

                <span>
                  priority
                </span>

              </div>


              {/* DELETE */}

              <button
                className="delete-button"
                onClick={() =>
                  removeIncident(incident.id)
                }
              >
                ✕
              </button>

            </div>

          ))}

      </div>

    </>

  );
}

export default Incidents;