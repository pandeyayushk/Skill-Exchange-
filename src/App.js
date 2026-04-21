import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");

  const handleSubmit = () => {
    console.log({
      name,
      skillOffered,
      skillNeeded,
    });
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
    </div>
  );
}

export default App;