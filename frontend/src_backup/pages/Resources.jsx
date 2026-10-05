import { useState, useEffect } from "react";
import Header from "../components/Header";

function Resources() {
  const [resources, setResources] = useState([]);
  const [filter, setFilter] = useState("All");

  const fetchResources = async () => {
    try {
      const res = await fetch('/api/resources');
      if (res.ok) setResources(await res.json());
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  async function toggleStatus(id) {
    const resource = resources.find(r => r.id === id);
    if (!resource) return;
    const newStatus = resource.status === "Available" ? "Occupied" : "Available";
    
    try {
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchResources();
      }
    } catch (e) {
      console.error(e);
    }
  }


  const filteredResources =
    filter === "All"
      ? resources
      : resources.filter(
          resource => resource.status === filter
        );


  return (

    <>

      <Header
        title="Resource Management"
        subtitle="Monitor response units, capabilities and availability"
      />


      {/* SUMMARY */}

      <section className="stats">

        <div className="stat-card">
          <span>TOTAL RESOURCES</span>
          <strong>{resources.length}</strong>
          <small>Registered response units</small>
        </div>

        <div className="stat-card">
          <span>AVAILABLE</span>
          <strong>
            {
              resources.filter(
                r => r.status === "Available"
              ).length
            }
          </strong>
          <small>Ready for dispatch</small>
        </div>

        <div className="stat-card">
          <span>OCCUPIED</span>
          <strong>
            {
              resources.filter(
                r => r.status === "Occupied"
              ).length
            }
          </strong>
          <small>Currently assigned</small>
        </div>

        <div className="stat-card">
          <span>CAPABILITY CLASSES</span>
          <strong>6</strong>
          <small>Supported capabilities</small>
        </div>

      </section>


      {/* RESOURCE LIST */}

      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Response Resources</h2>

            <p>
              Resources available to the dispatch system
            </p>
          </div>


          {/* FILTER */}

          <select
            className="resource-filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value)
            }
          >

            <option value="All">
              All Resources
            </option>

            <option value="Available">
              Available
            </option>

            <option value="Occupied">
              Occupied
            </option>

          </select>

        </div>


        {filteredResources.map(resource => (

          <div
            className="resource resource-large"
            key={resource.id}
          >

            {/* ICON */}

            <div className="resource-icon">

              {resource.type === "Ambulance" && "🚑"}

              {resource.type === "Fire Unit" && "🚒"}

              {resource.type === "Police" && "👮"}

            </div>


            {/* MAIN INFO */}

            <div className="resource-info">

              <strong>
                {resource.id} — {resource.name}
              </strong>

              <span>
                📍 Station / Location: {resource.location}
              </span>

              <div className="capability-list">

                {(resource.capabilities || []).map(
                  capability => (

                    <span
                      className="capability"
                      key={capability}
                    >
                      {capability}
                    </span>

                  )
                )}

              </div>

            </div>


            {/* RESPONSE LIMIT */}

            <div className="resource-limit">

              <span>Response Limit</span>

              <strong>
                {resource.responseLimit} min
              </strong>

            </div>


            {/* STATUS */}

            <div className="resource-status">

              <span
                className={
                  resource.status === "Available"
                    ? "available"
                    : "occupied"
                }
              >
                ● {resource.status}
              </span>


              <button
                className="status-button"
                onClick={() =>
                  toggleStatus(resource.id)
                }
              >
                Change Status
              </button>

            </div>

          </div>

        ))}

      </div>


      {/* MATHEMATICAL MODEL */}

      <div className="panel resource-model">

        <div className="panel-header">

          <div>

            <h2>
              Capability Relation
            </h2>

            <p>
              Resource → Capability relation used by the dispatch engine
            </p>

          </div>

        </div>


        <div className="relation-display">

          <div className="relation-item">
            <strong>A1</strong>
            <span>→</span>
            <p>BLS</p>
          </div>

          <div className="relation-item">
            <strong>A2</strong>
            <span>→</span>
            <p>ALS, Trauma</p>
          </div>

          <div className="relation-item">
            <strong>F1</strong>
            <span>→</span>
            <p>Fire Suppression, Rescue</p>
          </div>

          <div className="relation-item">
            <strong>P1</strong>
            <span>→</span>
            <p>Police</p>
          </div>

        </div>

      </div>

    </>

  );
}

export default Resources;