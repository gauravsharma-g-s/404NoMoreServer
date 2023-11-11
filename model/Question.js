const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    
    questionText: {
        type: String,
        min: 10
    },
    questionBody:{
        type:String,
        min:15
    },
    answers: [{
        text: String,
        answerBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        username: String
    }],
    keywords: {
        type:String
    }

}, {
    timestamps: true
})

const Question = mongoose.model("Question", QuestionSchema)
module.exports = Question