import { useState } from "react";
import Header from "../components/Header";

function Communication() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      time: "10:42:15",
      type: "critical",
      sender: "EMERGENCY REPORT",
      text: "MEDICAL EMERGENCY reported at J1."
    },
    {
      id: 2,
      time: "10:42:18",
      type: "info",
      sender: "DISPATCH ENGINE",
      text: "Shortest available route calculated: H1 → J1 (4 min)."
    },
    {
      id: 3,
      time: "10:42:22",
      type: "info",
      sender: "CONTROL ROOM",
      text: "Ambulance A-01 dispatched to Junction J1."
    },
    {
      id: 4,
      time: "10:43:00",
      type: "warning",
      sender: "RESPONSE UNIT A-01",
      text: "Unit A-01 is ON ROUTE to location J1."
    },
    {
      id: 5,
      time: "10:49:30",
      type: "success",
      sender: "RESPONSE UNIT A-01",
      text: "On-scene arrival. Patient stabilized. Incident resolved."
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const now = new Date();
    const timeString = now.toTimeString().split(" ")[0];

    const msg = {
      id: Date.now(),
      time: timeString,
      type: messageType,
      sender: "DISPATCH DISPATCHER",
      text: newMessage
    };

    setMessages([msg, ...messages]);
    setNewMessage("");
  }

  return (
    <>
      <Header
        title="Control Room Communication Network"
        subtitle="Real-time emergency dispatch telemetry, messaging stream, and protocol pipeline"
      />

      {/* COMMUNICATION FLOWCHART */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Dispatch Communication Protocol Flow</h2>
            <p>End-to-end communication sequence during active incident dispatch</p>
          </div>
        </div>

        <div className="comm-flowchart">
          <div className="comm-step">
            <span>STEP 01</span>
            <strong>Emergency Report</strong>
          </div>
          <div className="flow-arrow">→</div>
          <div className="comm-step">
            <span>STEP 02</span>
            <strong>Control Room</strong>
          </div>
          <div className="flow-arrow">→</div>
          <div className="comm-step">
            <span>STEP 03</span>
            <strong>Nearest Available Unit</strong>
          </div>
          <div className="flow-arrow">→</div>
          <div className="comm-step">
            <span>STEP 04</span>
            <strong>Route Assigned</strong>
          </div>
          <div className="flow-arrow">→</div>
          <div className="comm-step">
            <span>STEP 05</span>
            <strong>Live Status</strong>
          </div>
          <div className="flow-arrow">→</div>
          <div className="comm-step">
            <span>STEP 06</span>
            <strong>Incident Resolved</strong>
          </div>
        </div>
      </div>

      {/* BROADCAST MESSAGE FORM */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Broadcast Dispatch Message</h2>
            <p>Send operational alert to field response units and control terminals</p>
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="dispatch-controls">
          <div className="routing-field" style={{ flex: 2 }}>
            <label>MESSAGE TEXT</label>
            <input
              type="text"
              placeholder="e.g. MEDICAL EMERGENCY reported at J1..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
          </div>

          <div className="routing-field">
            <label>PRIORITY LEVEL</label>
            <select
              value={messageType}
              onChange={(e) => setMessageType(e.target.value)}
            >
              <option value="info">Info / Dispatch</option>
              <option value="critical">Critical Emergency</option>
              <option value="warning">On Route Status</option>
              <option value="success">Incident Resolved</option>
            </select>
          </div>

          <button type="submit" className="add-button large-button">
            📡 Transmit Alert
          </button>
        </form>
      </div>

      {/* LIVE MESSAGES STREAM */}
      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Live Dispatch Telemetry Log</h2>
            <p>Timestamped telemetry feed from control room and response units</p>
          </div>
          <span className="badge medium-badge">{messages.length} Messages Logged</span>
        </div>

        <div className="comm-log">
          {messages.map((msg) => (
            <div key={msg.id} className={`comm-message ${msg.type}`}>
              <div className="comm-time">{msg.time}</div>
              <div className="comm-content">
                <strong>{msg.sender}</strong>
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Communication;
