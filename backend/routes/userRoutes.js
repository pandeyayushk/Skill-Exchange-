const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

router.put("/profile", auth, userController.updateProfile);
router.get("/matches", auth, userController.getMatches);
router.post("/connect", auth, userController.sendConnectionRequest);
router.get("/requests", auth, userController.getPendingRequests);
router.post("/accept", auth, userController.acceptConnectionRequest);
router.post("/reject", auth, userController.rejectConnectionRequest);
router.post("/disconnect", auth, userController.disconnectUser);
router.get("/connections", auth, userController.getConnections);

module.exports = router;
