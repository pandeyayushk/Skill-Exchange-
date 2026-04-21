import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");
  const [users, setUsers] = useState([]);

  const handleSubmit = () => {
    const newUser = {
      name,
      skillOffered,
      skillNeeded,
    };

    setUsers([...users, newUser]);

    setName("");
    setSkillOffered("");
    setSkillNeeded("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>SRM Skill Exchange</h1>

      <input
        placeholder="Your Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Skill You Offer"
        value={skillOffered}
        onChange={(e) => setSkillOffered(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Skill You Need"
        value={skillNeeded}
        onChange={(e) => setSkillNeeded(e.target.value)}
      />
      <br /><br />

      <button onClick={handleSubmit}>Submit</button>

      <h2>Users</h2>

      {users.map((user, index) => (
        <div key={index}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Offers:</strong> {user.skillOffered}</p>
          <p><strong>Needs:</strong> {user.skillNeeded}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;