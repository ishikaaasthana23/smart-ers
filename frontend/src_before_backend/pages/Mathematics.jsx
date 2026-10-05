import Header from "../components/Header";

function Mathematics() {
  return (
    <>
      <Header
        title="Discrete Mathematics & Graph Theory"
        subtitle="Mathematical formulation of emergency network, graph topology, and Dijkstra's algorithm"
      />

      <div className="panel math-panel">
        <div className="panel-header">
          <div>
            <h2>Mathematical Foundation</h2>
            <p>Graph theory model governing dispatch decisions and route optimization</p>
          </div>
        </div>

        {/* 1. GRAPH REPRESENTATION & 2. GRAPH PROPERTIES */}
        <div className="math-grid">
          <div className="math-card">
            <span className="math-card-label">01 · GRAPH REPRESENTATION</span>
            <h3>G = (V, E)</h3>
            <p>
              The city road network is formulated as a formal graph structure G where 
              vertices V correspond to physical facilities and junctions, and edges E represent connecting roadways.
            </p>

            <div className="math-definition">
              <div>
                <strong>V</strong>
                <span>Set of Vertices</span>
                <p>{"V = {H1, H2, J1, J2, J3, S1}"}</p>
                <small>6 key nodes in emergency network</small>
              </div>

              <div>
                <strong>E</strong>
                <span>Set of Edges</span>
                <p>{"E = {(H1,J1), (J1,J2), (H1,J3), (J3,J2), (J2,H2), (S1,J2)}"}</p>
                <small>6 weighted road segments</small>
              </div>
            </div>
          </div>

          <div className="math-card">
            <span className="math-card-label">02 · GRAPH PROPERTIES</span>
            <h3>Network Topology</h3>
            <p>
              Formal mathematical classification of the SMART-ERS road network graph structure:
            </p>

            <div className="property-list">
              <div>
                <span>Vertices |V|</span>
                <strong>6 Nodes</strong>
              </div>
              <div>
                <span>Edges |E|</span>
                <strong>6 Roads</strong>
              </div>
              <div>
                <span>Graph Type</span>
                <strong>Undirected</strong>
              </div>
              <div>
                <span>Edge Weight</span>
                <strong>Travel Time</strong>
              </div>
              <div>
                <span>Connectivity</span>
                <strong>Connected Graph</strong>
              </div>
              <div>
                <span>Cycle Count</span>
                <strong>1 Fundamental Cycle</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 3. WEIGHTED GRAPH */}
        <div className="math-card math-wide-card">
          <span className="math-card-label">03 · WEIGHTED GRAPH</span>
          <h3>Edge Weight Mapping w(e)</h3>
          <p>
            Every edge e ∈ E is assigned a non-negative weight w(e) ∈ ℝ⁺ representing estimated travel time in minutes under normal conditions.
          </p>

          <div className="weight-list">
            <div>
              <span>(H1, J1) — Hospital to Junction</span>
              <strong>w = 4 min</strong>
            </div>
            <div>
              <span>(J1, J2) — Junction to Junction</span>
              <strong>w = 3 min</strong>
            </div>
            <div>
              <span>(H1, J3) — Hospital to Junction</span>
              <strong>w = 5 min</strong>
            </div>
            <div>
              <span>(J3, J2) — Junction to Junction</span>
              <strong>w = 6 min</strong>
            </div>
            <div>
              <span>(J2, H2) — Junction to Hospital</span>
              <strong>w = 2 min</strong>
            </div>
            <div>
              <span>(S1, J2) — Fire Station to Junction</span>
              <strong>w = 4 min</strong>
            </div>
          </div>
        </div>

        {/* 4. VERTEX DEGREE */}
        <div className="math-card math-wide-card">
          <span className="math-card-label">04 · VERTEX DEGREE</span>
          <h3>Degree Sequence deg(v)</h3>
          <p>
            The degree deg(v) of vertex v equals the number of incident edges. High-degree vertices (e.g. J2) act as critical network hubs.
          </p>

          <div className="degree-grid">
            <div>
              <strong>H1 (Hospital 1)</strong>
              <span>deg(H1) = 2</span>
              <small>Incident to J1, J3</small>
            </div>
            <div>
              <strong>J1 (Junction 1)</strong>
              <span>deg(J1) = 2</span>
              <small>Incident to H1, J2</small>
            </div>
            <div>
              <strong>J2 (Central Hub)</strong>
              <span>deg(J2) = 4</span>
              <small>Incident to J1, J3, H2, S1</small>
            </div>
            <div>
              <strong>J3 (Junction 3)</strong>
              <span>deg(J3) = 2</span>
              <small>Incident to H1, J2</small>
            </div>
            <div>
              <strong>H2 (Hospital 2)</strong>
              <span>deg(H2) = 1</span>
              <small>Incident to J2</small>
            </div>
            <div>
              <strong>S1 (Fire Station)</strong>
              <span>deg(S1) = 1</span>
              <small>Incident to J2</small>
            </div>
          </div>
        </div>

        {/* 5. ADJACENCY REPRESENTATION */}
        <div className="math-card math-wide-card">
          <span className="math-card-label">05 · ADJACENCY REPRESENTATION</span>
          <h3>Adjacency List Adj[v]</h3>
          <p>
            Array of linked lists where Adj[v] contains pairs (u, w(v,u)) for all vertices u adjacent to v:
          </p>

          <div className="adjacency-list">
            <div>
              <strong>Adj[H1]</strong>
              <span>(J1, 4), (J3, 5)</span>
            </div>
            <div>
              <strong>Adj[J1]</strong>
              <span>(H1, 4), (J2, 3)</span>
            </div>
            <div>
              <strong>Adj[J2]</strong>
              <span>(J1, 3), (J3, 6), (H2, 2), (S1, 4)</span>
            </div>
            <div>
              <strong>Adj[J3]</strong>
              <span>(H1, 5), (J2, 6)</span>
            </div>
            <div>
              <strong>Adj[H2]</strong>
              <span>(J2, 2)</span>
            </div>
            <div>
              <strong>Adj[S1]</strong>
              <span>(J2, 4)</span>
            </div>
          </div>
        </div>

        {/* 6. SHORTEST PATH */}
        <div className="algorithm-card">
          <div className="algorithm-heading">
            <div className="algorithm-number">06</div>
            <div>
              <span>PATH OPTIMIZATION ANALYSIS</span>
              <h3>Shortest Path Calculation: H1 → J2</h3>
            </div>
          </div>

          <p className="algorithm-description">
            Comparing candidate simple paths connecting primary hospital H1 to central dispatch node J2:
          </p>

          <div className="path-calculation">
            <div className="calculation-option">
              <span>PRIMARY PATH P1</span>
              <strong>H1 → J1 → J2</strong>
              <p>w(H1,J1) + w(J1,J2) = 4 + 3 = <b>7 minutes</b></p>
            </div>

            <div className="calculation-option">
              <span>ALTERNATE PATH P2</span>
              <strong>H1 → J3 → J2</strong>
              <p>w(H1,J3) + w(J3,J2) = 5 + 6 = <b>11 minutes</b></p>
            </div>
          </div>

          <div className="math-result-box">
            <span>OPTIMAL ROUTE RESULT</span>
            <strong>H1 → J1 → J2 (7 minutes)</strong>
            <p>Path P1 yields min-cost response trajectory with 4 min efficiency advantage over P2.</p>
          </div>
        </div>

        {/* 7. DIJKSTRA ALGORITHM */}
        <div className="algorithm-card">
          <div className="algorithm-heading">
            <div className="algorithm-number">07</div>
            <div>
              <span>ALGORITHMIC SPECIFICATION</span>
              <h3>Dijkstra's Shortest Path Algorithm</h3>
            </div>
          </div>

          <p className="algorithm-description">
            Greedy single-source shortest path algorithm operating on weighted graphs with non-negative edge weights:
          </p>

          <div className="algorithm-steps">
            <div className="algorithm-step">
              <strong>1</strong>
              <div>
                <h4>Initialize Distances</h4>
                <p>Set d[source] = 0 and d[v] = ∞ for all v ≠ source. Mark all vertices unvisited.</p>
              </div>
            </div>

            <div className="algorithm-step">
              <strong>2</strong>
              <div>
                <h4>Select Minimum Node</h4>
                <p>Extract unvisited vertex u with minimum distance d[u].</p>
              </div>
            </div>

            <div className="algorithm-step">
              <strong>3</strong>
              <div>
                <h4>Relax Edge Neighbors</h4>
                <p>For each neighbor v of u: if d[u] + w(u,v) &lt; d[v], update d[v] = d[u] + w(u,v).</p>
              </div>
            </div>

            <div className="algorithm-step">
              <strong>4</strong>
              <div>
                <h4>Mark Visited</h4>
                <p>Mark vertex u as visited (settled). It will not be reprocessed.</p>
              </div>
            </div>

            <div className="algorithm-step">
              <strong>5</strong>
              <div>
                <h4>Iterate</h4>
                <p>Repeat steps 2–4 until destination is marked visited or unvisited set is empty.</p>
              </div>
            </div>

            <div className="algorithm-step">
              <strong>6</strong>
              <div>
                <h4>Reconstruct Path</h4>
                <p>Backtrack from target using predecessor pointers predecessor[v] to yield optimal route.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 8. DIJKSTRA DISTANCE TABLE */}
        <div className="math-card math-wide-card">
          <span className="math-card-label">08 · DIJKSTRA DISTANCE TABLE</span>
          <h3>Iteration State Table (Source: H1)</h3>
          <p>
            Trace of minimum distance d[v] settling across algorithm execution starting at source node H1:
          </p>

          <div className="dijkstra-table">
            <div className="dijkstra-row dijkstra-header">
              <span>Node v</span>
              <span>Initial d[v]</span>
              <span>Final Settled d[v]</span>
            </div>

            <div className="dijkstra-row">
              <strong>H1 (Source)</strong>
              <span>0</span>
              <strong>0 min</strong>
            </div>

            <div className="dijkstra-row">
              <strong>J1</strong>
              <span>∞</span>
              <strong>4 min (via H1)</strong>
            </div>

            <div className="dijkstra-row">
              <strong>J3</strong>
              <span>∞</span>
              <strong>5 min (via H1)</strong>
            </div>

            <div className="dijkstra-row">
              <strong>J2</strong>
              <span>∞</span>
              <strong>7 min (via J1)</strong>
            </div>

            <div className="dijkstra-row">
              <strong>H2</strong>
              <span>∞</span>
              <strong>9 min (via J2)</strong>
            </div>

            <div className="dijkstra-row">
              <strong>S1</strong>
              <span>∞</span>
              <strong>11 min (via J2)</strong>
            </div>
          </div>

          <div className="formula-box">
            <span>EDGE RELAXATION FORMULA</span>
            <strong>d[v] = min( d[v], d[u] + w(u,v) )</strong>
            <p>Guarantees optimal shortest-path tree generation in O((|V| + |E|) log |V|) time using priority queues.</p>
          </div>
        </div>

        {/* 9. DYNAMIC GRAPH */}
        <div className="math-card math-wide-card">
          <span className="math-card-label">09 · DYNAMIC GRAPH RECONFIGURATION</span>
          <h3>Dynamic Road Closure Impact</h3>
          <p>
            When a road segment is closed due to traffic or hazards, its edge is removed from active graph G' = (V, E \ {"{e_closed}"}). Dijkstra dynamically recalculates shortest paths.
          </p>

          <div className="comparison-box">
            <div>
              <span>ALL ROADS OPEN</span>
              <strong>H1 → J1 → J2</strong>
              <p>4 + 3 = 7 minutes</p>
            </div>

            <div className="comparison-arrow">→</div>

            <div>
              <span>ROAD H1-J1 CLOSED</span>
              <strong>H1 → J3 → J2</strong>
              <p>5 + 6 = 11 minutes (+4 min delay)</p>
            </div>
          </div>
        </div>

        {/* 10. REAL-WORLD APPLICATION */}
        <div className="application-card">
          <span>10 · REAL-WORLD SYSTEM PIPELINE</span>
          <h3>End-to-End Emergency Pipeline</h3>
          <p>
            Mathematical abstraction integrated into live control room software:
          </p>

          <div className="application-flow">
            <div>
              <strong>Emergency</strong>
              <span>Incident reported</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Location</strong>
              <span>Node identified</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Graph</strong>
              <span>Active topology</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Dijkstra</strong>
              <span>Path computation</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Shortest Route</strong>
              <span>Optimal path</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Response Unit</strong>
              <span>Unit assigned</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>ETA</strong>
              <span>Calculated arrival</span>
            </div>
            <div className="flow-arrow">→</div>
            <div>
              <strong>Response</strong>
              <span>On-scene arrival</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Mathematics;
