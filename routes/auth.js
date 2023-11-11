const express = require('express');
const router = express.Router();
const {getUser,register,login,getAllUsers,updateUser} = require('../controllers/auth');
const verifyToken = require('../middleware/verifyToken')

router.post("/register",register);
router.post("/login",login);
router.post("/updateUser/:userId",updateUser);

/* GET */
router.get("/getAllUsers",verifyToken,getAllUsers);
router.get("/:userId",verifyToken,getUser)

module.exports = router;