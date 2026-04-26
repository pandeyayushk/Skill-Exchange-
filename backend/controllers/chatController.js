const Message = require("../models/Message");
const User = require("../models/User");

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    
    // Verify they are connected
    const sender = await User.findById(req.user.id);
    if (!sender.connections.includes(receiverId)) {
      return res.status(403).json({ error: "You can only message your connections" });
    }

    const message = new Message({
      sender: req.user.id,
      receiver: receiverId,
      text
    });

    await message.save();

    // Emit real-time message to receiver if they are online
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    const receiverSocketId = userSockets.get(receiverId);

    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }

    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Server error sending message" });
  }
};

// Get messages between current user and a connection
exports.getMessages = async (req, res) => {
  try {
    const { connectionId } = req.params;

    // Verify connection
    const currentUser = await User.findById(req.user.id);
    if (!currentUser.connections.includes(connectionId)) {
      return res.status(403).json({ error: "You can only view messages of your connections" });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: connectionId },
        { sender: connectionId, receiver: req.user.id }
      ]
    }).sort({ createdAt: 1 }); // Oldest to newest

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Server error getting messages" });
  }
};
