const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const corsOption = require('./config/corsOption');
const multer = require('multer');
const { sendOTPVerificationEmail } = require('./controllers/auth');

/* CONFIGURATION */
dotenv.config();
const app = express();
const PORT = process.env.PORT || 6001;

/* MIDDLEWARE SETUP */
app.use(cors(corsOption));
app.use(express.json());
app.use(bodyParser.json({ limit: "30mb", extended: true }))
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }))

const storage = multer.memoryStorage(); 
// Create a multer instance with the storage configuration
const upload = multer({ storage: storage });

/* ROUTES */
app.post("/auth/sendOTP",upload.none(),sendOTPVerificationEmail)
app.use("/auth",require('./routes/auth'));
app.use("/question",require('./routes/question'));

/* MONGOOSE SETUP */
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on PORT ${PORT}`)
    })
}).catch(err => console.log(`${err} cannot connect`))