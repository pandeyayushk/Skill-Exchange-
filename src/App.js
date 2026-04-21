import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  // 🔍 SEARCH STATE
  const [search, setSearch] = useState("");

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

  const handleSubmit = async () => {
    if (!name || !skillOffered || !skillNeeded) {
      alert("All fields are required");
      return;
    }

    const newUser = { name, skillOffered, skillNeeded };

    try {
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
    } catch (err) {
      console.log(err);
    }

    setName("");
    setSkillOffered("");
    setSkillNeeded("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/delete-user/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔍 FILTER LOGIC
  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.skillOffered.toLowerCase().includes(search.toLowerCase()) ||
      user.skillNeeded.toLowerCase().includes(search.toLowerCase())
    );
  });

  // MATCHING LOGIC
  const matchedUsers = users.filter((user) => {
    if (!currentUser) return false;

    return (
      user.skillOffered
        .toLowerCase()
        .includes(currentUser.skillNeeded.toLowerCase()) &&
      user._id !== currentUser._id
    );
  });

  return (
    <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", padding: "20px" }}>
      <div style={containerStyle}>
        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          🚀 SRM Skill Exchange
        </h1>

        {/* INPUTS */}
        <input
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Skill You Offer"
          value={skillOffered}
          onChange={(e) => setSkillOffered(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Skill You Need"
          value={skillNeeded}
          onChange={(e) => setSkillNeeded(e.target.value)}
          style={inputStyle}
        />

        <button onClick={handleSubmit} style={buttonStyle}>
          {editingUser ? "Update" : "Submit"}
        </button>

        {/* 🔍 SEARCH BAR */}
        <input
          placeholder="Search by name or skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={inputStyle}
        />

        <h2 style={sectionTitle}>Users</h2>

        {/* 🔥 USE FILTERED USERS */}
        {filteredUsers.map((user) => (
          <div key={user._id} style={cardStyle}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Offers:</strong> {user.skillOffered}</p>
            <p><strong>Needs:</strong> {user.skillNeeded}</p>

            <button
              onClick={() => {
                setEditingUser(user);
                setName(user.name);
                setSkillOffered(user.skillOffered);
                setSkillNeeded(user.skillNeeded);
              }}
              style={editBtn}
            >
              Edit
            </button>

            <button
              onClick={() => handleDelete(user._id)}
              style={deleteBtn}
            >
              Delete
            </button>
          </div>
        ))}

        <h2 style={sectionTitle}>Select User</h2>

        <select
          onChange={(e) => setCurrentUser(users[e.target.value])}
          style={selectStyle}
        >
          <option value="">-- Select User --</option>
          {users.map((user, index) => (
            <option key={user._id} value={index}>
              {user.name}
            </option>
          ))}
        </select>

        <h2 style={sectionTitle}>Matches For You</h2>

        {!currentUser && <p>Please select a user</p>}

        {currentUser && matchedUsers.length === 0 && (
          <p>No matches found</p>
        )}

        {matchedUsers.map((user) => (
          <div key={user._id} style={cardStyle}>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Offers:</strong> {user.skillOffered}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// STYLES (same as before)
const containerStyle = {
  maxWidth: "700px",
  margin: "40px auto",
  padding: "25px",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  fontFamily: "Segoe UI, sans-serif",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "linear-gradient(90deg, #007bff, #00c6ff)",
  color: "white",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};

const cardStyle = {
  padding: "15px",
  marginBottom: "12px",
  borderRadius: "8px",
  backgroundColor: "#f9f9f9",
  border: "1px solid #eee",
};

const editBtn = {
  marginTop: "10px",
  marginRight: "5px",
  padding: "6px 12px",
  backgroundColor: "#ff9800",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const deleteBtn = {
  marginTop: "10px",
  padding: "6px 12px",
  backgroundColor: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "5px",
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
};

const sectionTitle = {
  marginTop: "25px",
};

export default App;