const express = require('express');
const router = express.Router();
const {submitAnswer,submitQuestion,deleteAnswer,deleteQuestion,getAllQuestions} = require('../controllers/question')
const verifyToken = require('../middleware/verifyToken')

/* UPDATE */
router.post("/submitQuestion",verifyToken,submitQuestion);
router.post("/:questionId/submitAnswer",verifyToken,submitAnswer);
router.delete("/:questionId",verifyToken,deleteQuestion);
router.delete("/:questionId/deleteAnswer",verifyToken,deleteAnswer)

/* READ */
router.get("/allQuestions",verifyToken,getAllQuestions);

module.exports = router;