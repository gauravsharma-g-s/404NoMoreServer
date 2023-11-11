const Question = require("../model/Question");
const User = require("../model/User");

const submitQuestion = async (req, res) => {
    try {
        const { userId, questionText, keywords,questionBody } = req.body;
        const user = await User.findById(userId);
        const username = user.firstName + " " + user.lastName;
        const newQuestion = new Question({
            userId,
            questionText,
            username,
            keywords,
            questionBody
        })

        await newQuestion.save();
        const allQuestions = await Question.find();
        res.status(201).json(allQuestions);
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}


const submitAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { text, answerBy, username } = req.body;

        const submitAnswerResponse = await Question.findByIdAndUpdate(
            questionId,
            { $push: { answers: { text, answerBy,username } } },
            { new: true }
        )
        if (!submitAnswerResponse) {
            return res.status(404).json({ message: "Question doesn't exists!" })
        }
        res.status(200).json(submitAnswerResponse)
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}


const deleteQuestion = async (req, res) => {
    try {
        const { questionId } = req.params;
        const response = await Question.findByIdAndRemove(questionId)
        if(!response){
            res.status(404).json("Question doesnt exist")
        }
        res.status(200).json("Deleted Successfully")
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}


const deleteAnswer = async (req, res) => {
    try {
        const { questionId } = req.params;
        const { answerId } = req.body;

        const updatedQuestionRes = await Question.findByIdAndUpdate(
            questionId,
            {
                $pull: { answers: { _id: answerId } }
            },
            { new: true }
        )
        if(!updatedQuestionRes){
            res.status(404).json({message:"Question not found"})
        }

        res.status(200).json(updatedQuestionRes);
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}


const getAllQuestions = async (req, res) => {
    try {
        const allQuestions = await Question.find();
        res.status(200).json(allQuestions);
    }
    catch (err) {
        res.status(400).json({ message: err.message })
    }
}


module.exports = { submitAnswer, submitQuestion, deleteAnswer, deleteQuestion, getAllQuestions }