const User = require('../models/user');

const generateDefaultUserProfileImage = require('../_helper/generateDefaultUserProfileImage');
const {  TOKEN_SECRET } = require('../config/vars');
const AccessToken = require('../models/accessToken');
const jwt = require('jsonwebtoken');


exports.CreateUser = async (data) => {
    try {

        const { email, userName } = data;

        if (!validateEmail(email)) {
            return { success: false, message: 'Please enter valid email address!' };
        }

        const avatar = await generateDefaultUserProfileImage(userName);

        const userObj = {
            email,
            userName,
            avatar,
        };

        // create user
        const createdUser = await User.create(userObj);

        if (createdUser) {
            return { success: true, message: 'Success Created!' };
        }


    } catch (error) {
       
        return { success: false, message: error };
    }
};


exports.GenerateAccessToken = async (data) => {
    try {

         // Create and save a new access token for the user
      const accessToken = jwt.sign({ user: data.id }, TOKEN_SECRET, { expiresIn: '2d' });
      const accessTokenDocument = { accessToken, userId: data.id, activeUserRole: data.role };
      await AccessToken.create(accessTokenDocument);

      return accessToken

    } catch (error) {
       
        return { success: false, message: error };
    }
};



