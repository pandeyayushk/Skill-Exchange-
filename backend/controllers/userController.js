const User = require("../models/User");

// Update Profile (Skills)
exports.updateProfile = async (req, res) => {
  try {
    const { skillsOffered, skillsNeeded } = req.body;
    
    // Convert strings to arrays, lowercasing them to prevent mismatch errors
    const formatSkills = (skills) => {
      if (Array.isArray(skills)) return skills.map(s => s.toLowerCase());
      if (typeof skills === "string") return skills.split(",").map(s => s.trim().toLowerCase()).filter(s => s);
      return [];
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        skillsOffered: formatSkills(skillsOffered),
        skillsNeeded: formatSkills(skillsNeeded)
      },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error updating profile" });
  }
};

// Get Matches
exports.getMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    if (!currentUser) return res.status(404).json({ error: "User not found" });

    // Map needed skills to case-insensitive regular expressions
    const neededSkillsRegex = currentUser.skillsNeeded.map(s => new RegExp(`^${s}$`, 'i'));

    // Find users who offer at least one skill that the current user needs
    // Exclude the current user from results
    // Exclude users already connected
    // Exclude users we have already sent a request to
    const matches = await User.find({
      _id: { 
        $ne: req.user.id,
        $nin: [...currentUser.connections]
      },
      connectionRequests: { $ne: req.user.id }, // Exclude users where our ID is in their requests
      skillsOffered: { $in: neededSkillsRegex }
    }).select("name email skillsOffered skillsNeeded connectionRequests");

    // Also exclude users who have already sent US a request
    const filteredMatches = matches.filter(
      match => !currentUser.connectionRequests.includes(match._id)
    );

    res.json(filteredMatches);
  } catch (err) {
    res.status(500).json({ error: "Server error getting matches" });
  }
};

// Send Connection Request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (targetUserId === req.user.id) return res.status(400).json({ error: "Cannot connect with yourself" });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    if (targetUser.connections.includes(req.user.id) || targetUser.connectionRequests.includes(req.user.id)) {
      return res.status(400).json({ error: "Already connected or request pending" });
    }

    targetUser.connectionRequests.push(req.user.id);
    await targetUser.save();

    res.json({ message: "Connection request sent" });
  } catch (err) {
    res.status(500).json({ error: "Server error sending request" });
  }
};

// Get Pending Requests
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("connectionRequests", "name skillsOffered");
    res.json(user.connectionRequests);
  } catch (err) {
    res.status(500).json({ error: "Server error getting requests" });
  }
};

// Accept Connection Request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { requestUserId } = req.body;

    if (!currentUser.connectionRequests.includes(requestUserId)) {
      return res.status(400).json({ error: "No connection request from this user" });
    }

    const requestingUser = await User.findById(requestUserId);
    if (!requestingUser) return res.status(404).json({ error: "User not found" });

    // Remove from requests and add to connections for both users
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      id => id.toString() !== requestUserId
    );
    currentUser.connections.push(requestUserId);
    requestingUser.connections.push(req.user.id);

    await currentUser.save();
    await requestingUser.save();

    res.json({ message: "Connection accepted" });
  } catch (err) {
    res.status(500).json({ error: "Server error accepting connection" });
  }
};

exports.rejectConnectionRequest = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { requestUserId } = req.body;

    if (!currentUser.connectionRequests.includes(requestUserId)) {
      return res.status(400).json({ error: "No connection request from this user" });
    }

    // Remove from requests
    currentUser.connectionRequests = currentUser.connectionRequests.filter(
      id => id.toString() !== requestUserId
    );

    await currentUser.save();

    res.json({ message: "Connection rejected" });
  } catch (err) {
    res.status(500).json({ error: "Server error rejecting connection" });
  }
};

exports.disconnectUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);
    const { targetUserId } = req.body;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ error: "User not found" });

    // Remove from both
    currentUser.connections = currentUser.connections.filter(id => id.toString() !== targetUserId);
    targetUser.connections = targetUser.connections.filter(id => id.toString() !== req.user.id);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: "Disconnected successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error disconnecting user" });
  }
};

// Get Connected Users
exports.getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("connections", "name email skillsOffered skillsNeeded");
    res.json(user.connections);
  } catch (err) {
    res.status(500).json({ error: "Server error getting connections" });
  }
};
