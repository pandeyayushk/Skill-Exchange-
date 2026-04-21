import axios from "axios";
import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [skillOffered, setSkillOffered] = useState("");
  const [skillNeeded, setSkillNeeded] = useState("");
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

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
        // UPDATE
        await axios.put(
          `http://localhost:5000/update-user/${editingUser._id}`,
          newUser
        );
        setEditingUser(null);
      } else {
        // CREATE
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
    <div style={containerStyle}>
      <h1>SRM Skill Exchange</h1>

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

      <h2>Users</h2>

      {users.map((user) => (
        <div key={user._id} style={cardStyle}>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Offers:</strong> {user.skillOffered}</p>
          <p><strong>Needs:</strong> {user.skillNeeded}</p>

          {/* EDIT BUTTON */}
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

          {/* DELETE BUTTON */}
          <button
            onClick={() => handleDelete(user._id)}
            style={deleteBtn}
          >
            Delete
          </button>
        </div>
      ))}

      <h2>Select User</h2>

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

      <h2>Matches For You</h2>

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
  );
}

// STYLES
const containerStyle = {
  maxWidth: "600px",
  margin: "40px auto",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  fontFamily: "Arial",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginBottom: "20px",
};

const cardStyle = {
  padding: "10px",
  marginBottom: "10px",
  border: "1px solid #ddd",
  borderRadius: "5px",
};

const editBtn = {
  marginTop: "10px",
  marginRight: "5px",
  padding: "5px 10px",
  backgroundColor: "orange",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const deleteBtn = {
  marginTop: "10px",
  padding: "5px 10px",
  backgroundColor: "red",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

const selectStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
};

export default App;