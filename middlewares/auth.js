const jwt = require('jsonwebtoken');

const User = require('../models/user');
const AccessToken = require('../models/accessToken');

const { TOKEN_SECRET } = require('../config/vars');

exports.authenticate = async (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).send({ success: false, message: 'Token Missing' });
        }
        let token = req.headers.authorization;

        token = token.split('Bearer');
        token = token[1];
        token = token.replace(/\s/g, '');

        const decoded = jwt.verify(token, TOKEN_SECRET);

        if (decoded) {
            const userId = decoded.user;
            const accessToken = await AccessToken.findOne({ accessToken: token });
            const userObj = await User.findOne({ _id: userId }).exec();
        

            if (accessToken && userObj) {
                req.user = userObj.id;
                req.role = userObj.role;
                req.accessToken = token;

                return next();
            }
        }

        return res.status(401).json({ success: false, message: 'Token Invalid' });
    } catch (err) {
        return res.status(401).send({ success: false, message: 'Something went wrong!' });
    }
};
