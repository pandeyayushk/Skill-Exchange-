import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:5000/users");
    setUsers(res.data);
  };

  const handleSubmit = async () => {
    if (!name || !skillOffered || !skillNeeded) {
      alert("All fields are required");
      return;
    }

    const newUser = { name, skillOffered, skillNeeded };

    if (editingUser) {
      await axios.put(
        `http://localhost:5000/update-user/${editingUser._id}`,
        newUser
      );
      setEditingUser(null);
    } else {
      await axios.post("http://localhost:5000/add-user", newUser);
    }

    fetchUsers();

    setName("");
    setSkillOffered("");
    setSkillNeeded("");
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/delete-user/${id}`);
    fetchUsers();
  };

  // 🔍 SEARCH
  const filteredUsers = users.filter((user) =>
    (user.name + user.skillOffered + user.skillNeeded)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // 🔥 SMART MATCHING
  const parseSkills = (skills) =>
    skills.toLowerCase().split(",").map((s) => s.trim());

  const matchedUsers = users.filter((user) => {
    if (!currentUser) return false;

    const offered = parseSkills(user.skillOffered);
    const needed = parseSkills(currentUser.skillNeeded);

    return (
      offered.some((skill) => needed.includes(skill)) &&
      user._id !== currentUser._id
    );
  });

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>🚀 SRM Skill Exchange</h1>

        {/* FORM */}
        <div style={formStyle}>
          <input
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Skills You Offer (comma separated)"
            value={skillOffered}
            onChange={(e) => setSkillOffered(e.target.value)}
            style={inputStyle}
          />

          <input
            placeholder="Skills You Need (comma separated)"
            value={skillNeeded}
            onChange={(e) => setSkillNeeded(e.target.value)}
            style={inputStyle}
          />

          <button onClick={handleSubmit} style={buttonStyle}>
            {editingUser ? "Update" : "Submit"}
          </button>
        </div>

        {/* SEARCH */}
        <input
          placeholder="🔍 Search by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        {/* USERS */}
        <h2 style={sectionTitle}>Users</h2>

        {filteredUsers.map((user) => (
          <div key={user._id} style={cardStyle}>
            <p><strong>{user.name}</strong></p>
            <p>Offers: {user.skillOffered}</p>
            <p>Needs: {user.skillNeeded}</p>

            <button
              style={editBtn}
              onClick={() => {
                setEditingUser(user);
                setName(user.name);
                setSkillOffered(user.skillOffered);
                setSkillNeeded(user.skillNeeded);
              }}
            >
              Edit
            </button>

            <button
              style={deleteBtn}
              onClick={() => handleDelete(user._id)}
            >
              Delete
            </button>
          </div>
        ))}

        {/* SELECT USER */}
        <h2 style={sectionTitle}>Select User</h2>

        <select
          onChange={(e) => setCurrentUser(users[e.target.value])}
          style={inputStyle}
        >
          <option value="">-- Select User --</option>
          {users.map((user, index) => (
            <option key={user._id} value={index}>
              {user.name}
            </option>
          ))}
        </select>

        {/* MATCHES */}
        <h2 style={sectionTitle}>Matches</h2>

        {!currentUser && <p>Select a user to see matches</p>}

        {matchedUsers.map((user) => (
          <div key={user._id} style={cardStyle}>
            <p><strong>{user.name}</strong></p>
            <p>Offers: {user.skillOffered}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STYLES

const pageStyle = {
  backgroundColor: "#f4f6f9",
  minHeight: "100vh",
  padding: "20px",
};

const containerStyle = {
  maxWidth: "700px",
  margin: "auto",
  padding: "25px",
  borderRadius: "12px",
  backgroundColor: "white",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
};

const inputStyle = {
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const buttonStyle = {
  padding: "12px",
  background: "linear-gradient(90deg, #007bff, #00c6ff)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "15px",
};

const cardStyle = {
  padding: "15px",
  marginBottom: "10px",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  border: "1px solid #eee",
};

const editBtn = {
  marginRight: "10px",
  padding: "6px 12px",
  backgroundColor: "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const deleteBtn = {
  padding: "6px 12px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const sectionTitle = {
  marginTop: "25px",
};

export default App;