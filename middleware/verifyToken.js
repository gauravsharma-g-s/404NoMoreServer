const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(403).send("Access Denied")
        }

        if (token.startsWith("Bearer ")) {
            token = token.split(" ")[1];
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(400).json(err)
    }
}

module.exports = verifyToken;