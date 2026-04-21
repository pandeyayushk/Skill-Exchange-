import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // 🔥 FETCH USERS FROM BACKEND
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/users");
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // 🔥 SEND DATA TO BACKEND
  const handleSubmit = async () => {
    const newUser = {
      name,
      skillOffered,
      skillNeeded,
    };

    try {
      await axios.post("http://localhost:5000/add-user", newUser);
      fetchUsers(); // refresh users
    } catch (err) {
      console.log(err);
    }

    setName("");
    setSkillOffered("");
    setSkillNeeded("");
  };

  // MATCHING LOGIC
  const matchedUsers = users.filter(
    (user) =>
      currentUser &&
      user.skillOffered.toLowerCase() ===
        currentUser.skillNeeded.toLowerCase() &&
      user.name !== currentUser.name
  );

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

      <h2>Select User</h2>
      <select
        onChange={(e) => setCurrentUser(users[e.target.value])}
      >
        <option value="">-- Select User --</option>
        {users.map((user, index) => (
          <option key={index} value={index}>
            {user.name}
          </option>
        ))}
      </select>

      <h2>Matches For You</h2>

      {!currentUser && <p>Please select a user</p>}

      {currentUser && matchedUsers.length === 0 && (
        <p>No matches found</p>
      )}

      {matchedUsers.map((user, index) => (
        <div key={index}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Offers:</strong> {user.skillOffered}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;