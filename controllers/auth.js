const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const User = require("../models/user");
const RegisterUser = require("../models/registerUser");
const RACE = require("../models/race");
const RACEHISTORY = require("../models/raceHistory");
const RACEROUTES = require("../models/raceRoutes");

const AccessToken = require("../models/accessToken");

const { setRole } = require("../_helper/permissions");
const { validateEmail } = require("../_helper/validation");
const roles = require("../_helper/roles");

const { serverURL, baseURL, TOKEN_SECRET } = require("../config/vars");
const { generateHtmlBodyContent } = require("../_utils/AddDataInHtml");
const { SendEmail } = require("../_utils/email_Send");

const generateDefaultUserProfileImage = require("../_helper/generateDefaultUserProfileImage");

const saltRounds = 10;

exports.userRegister = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(200)
        .send({ success: false, message: "Email is required!" });
    }
    if (!validateEmail(email)) {
      return res
        .status(200)
        .send({ success: false, message: "Please enter valid email address!" });
    }

    // Check if user with given email, company with given name, or company with given domain already exists
    const userWithEmail = await RegisterUser.findOne({ email }).exec();

    if (userWithEmail) {
      const errorObj = {};

      if (userWithEmail) {
        errorObj.email = "Email Already Exists!";
      }

      return res
        .status(200)
        .send({ success: false, message: "Email Already Exists!", errorObj });
    }

    // create user
    const createdUser = await RegisterUser.create(req.body);

    // Return successful signup response to the user
    return res.status(200).send({
      success: true,
      message: "Register Successfully!",
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong try again later!",
      error: e,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { email, userName, password, type } = req.body;

    if (!email) {
      return res
        .status(200)
        .send({ success: false, message: "Email is required!" });
    }
    if (!validateEmail(email)) {
      return res
        .status(200)
        .send({ success: false, message: "Please enter valid email address!" });
    }
    if (!userName || !password) {
      return res
        .status(200)
        .send({ success: false, message: "Please enter all required Field!" });
    }

    // Check if user with given email, company with given name, or company with given domain already exists
    const userWithEmail = await User.findOne({ email }).exec();

    if (userWithEmail) {
      const errorObj = {};

      if (userWithEmail) {
        errorObj.email = "Email Already Exists!";
      }

      return res
        .status(200)
        .send({ success: false, message: "Email Already Exists!", errorObj });
    }

    // Validation checks successful, proceed to create new user and company
    const salt = await bcrypt.genSalt(parseInt(saltRounds));
    const hash = await bcrypt.hash(password, salt);
    const avatar = await generateDefaultUserProfileImage(userName);

    let assignRole = "";

    if (type) {
      Object.keys(roles).some((role) => {
        const condition =
          type.toLowerCase() === roles[role].value.toLowerCase();
        if (condition) {
          assignRole = roles[role].key;
        }
        return condition;
      });
    }

    console.log(assignRole);

    const userObj = {
      email,
      userName,
      avatar,
      role: assignRole,
      password: hash,
    };

    // create user
    const createdUser = await User.create(userObj);

    // Fetch the user's permissions from the roles constants file
    const accessControlInfo = await setRole(createdUser);

    await User.updateOne(
      { _id: createdUser._id },
      { parentId: createdUser._id },
      { upsert: true }
    ).exec();

    // Send account verification email to the user
    sendAccountVerificationEmail(createdUser);

    // Return successful signup response to the user
    return res.status(200).send({
      success: true,
      message: "Please check your email to verify your account!",
      data: userObj,
      permission: accessControlInfo,
      subscription,
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong try again later!",
      error: e,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let checkIn =  false;

    if (!email || !password) {
      return res
        .status(200)
        .send({ success: false, message: "Please enter all required Field!" });
    }

    try {
      const user = await User.findOne({ email: email.toLowerCase() }).exec();

      if (!user) {
        return res.status(200).send({
          success: false,
          message: "User not found",
        });
      }

      // Check if user entered incorrect password
      if (!user.verifyPassword(password)) {
        return res
          .status(200)
          .send({ success: false, message: "Invalid email or password" });
      }

      // Check if user is not verified
      if (!user.isVerified) {
        return res.status(200).send({
          success: false,
          message: "Your Email Address is not verified yet!",
        });
      }

      if (!user.isActive) {
        return res.status(200).send({
          success: false,
          message: "Account Disable Contact with Company Support!",
        });
      }

      if(user.role == '301'){
        const raceId = await RACE.findOne({ _id: user.raceId }).exec();

        const currentDate = new Date();
        var startDate = new Date(raceId.startDate);
        var endDate = new Date(raceId.endDate);
  
        if (currentDate <= startDate ) {
          return res.status(200).send({
            success: false,
            message: `Race is Not Started Yet till ${raceId.startDate}!`,
          });
        }  else if ( currentDate >= endDate){
          return res.status(200).send({
            success: false,
            message: `Race is Already End at ${raceId.endDate}!`,
          });
        }


        const checkInResult = await RACEHISTORY.findOne({
          userId: user._id,
          raceId: user.raceId,
        }).exec();
        
        if(checkInResult){
          checkIn = true;
        }
        
      }
     
      
      // Create and save a new access token for the user
      const accessToken = jwt.sign({ user: user.id }, TOKEN_SECRET, {
        expiresIn: "2d",
      });
      const accessTokenDocument = {
        accessToken,
        userId: user.id,
        activeUserRole: user.role,
      };
      await AccessToken.create(accessTokenDocument);

      // Fetch the user's permissions from the roles constants file
      const accessControlInfo = await setRole(user);
      const queryObject = { _id: mongoose.Types.ObjectId(user._id) };
      User.aggregate(
        [
          {
            $match: queryObject,
          },
          {
            $lookup: {
              from: "raceroutes",
              localField: "raceRouteId",
              foreignField: "_id",
              as: "routes",
            },
          },
        ],
        async function (err, documents) {
          if (err) {
            return res.status(200).json({
              status: false,
              message: "Something went wrong !",
            });
          } else {
            // Construct the response data objects
            console.log("sad");
            const userData = {
              userName: user.userName,
              email: user.email,
              avatar: user.avatar,
              role: user.role,
              createdAt: user.createdAt,
              id: user._id,
              raceId: user.raceId,
              routes: documents[0].routes,
              captainName: user.captainName,
            };

            return res.status(200).send({
              accessToken,
              success: true,
              checkIn,
              user: userData,
              permission: accessControlInfo,
              message: "Logged In successfully!",
            });
          }
        }
      );
    } catch (err) {
      return res.status(400).send({
        success: false,
        message: err.message,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.emailVerification = async (req, res) => {
  const token = req.params.emailToken;
  const decoded = jwt.verify(token, TOKEN_SECRET);
  const { userId } = decoded;
  try {
    var result = await User.updateOne(
      { _id: userId },
      { $set: { isVerified: true } }
    );
    if (result) {
      return res.redirect(`${baseURL}login`);
    }
    return res.redirect(`${baseURL}`);
  } catch (err) {
    res.send("error");
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { password, confirmPassword, currentPassword } = req.body;
    const user = await User.findOne({ _id: req.user }).exec();

    if (!user) {
      return res.status(200).json({ success: false, message: "Invalid user" });
    }
    if (!currentPassword) {
      return res
        .status(200)
        .json({ success: false, message: "Current password is required" });
    }
    if (!user.verifyPassword(currentPassword)) {
      return res
        .status(200)
        .json({ success: false, message: "Current password is incorrect" });
    }
    if (user.verifyPassword(password)) {
      return res.status(200).json({
        success: false,
        message: "New password is same as old Password",
      });
    }
    if (!password) {
      return res
        .status(200)
        .json({ success: false, message: "Password is required" });
    }
    if (!confirmPassword) {
      return res
        .status(200)
        .json({ success: false, message: "Please confirm password" });
    }
    if (password !== confirmPassword) {
      return res.status(200).json({
        success: false,
        message: "Password and confirm password does not match",
      });
    }
    if (password.length < 6 || password.length > 15) {
      return res.status(200).json({
        success: false,
        message:
          "Password can not be less than 6 and greater and 15 characters",
      });
    }

    // Save the new password
    const salt = await bcrypt.genSalt(parseInt(saltRounds));
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(200).json({
        success: false,
        message: "Email is required to reset password!",
      });
    }

    const userWithEmail = await User.findOne({
      email: email.toLowerCase(),
    }).exec();
    if (!userWithEmail) {
      return res.status(200).json({
        success: false,
        message: `Sorry, the address ${email} is not Exist!.`,
      });
    }

    // Send the password reset email to the user
    sendPasswordResetEmail(
      userWithEmail._id,
      userWithEmail.email,
      userWithEmail.userName
    );

    // Let the uer know about the email sent
    return res.status(200).json({
      success: true,
      message: `Instructions for resetting your password have been sent to ${email} OR Contact the admin or organizer for your password !`,
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (!confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please confirm password required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }
    if (password.length < 6 || password.length > 15) {
      return res.status(400).json({
        success: false,
        message:
          "Password can not be less than 6 and greater and 15 characters",
      });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);
    if (decoded) {
      const { userId } = decoded;
      const userObj = await User.findOne({ _id: userId }).exec();

      if (userObj) {
        if (userObj.verifyPassword(password)) {
          return res.status(200).send({
            success: false,
            message: "Your new password cannot be the same as old!",
          });
        }

        // Hash the new password and save it
        const salt = await bcrypt.genSalt(parseInt(saltRounds));
        const hash = await bcrypt.hash(password, salt);

        try {
          const user = await User.updateOne(
            { _id: userId },
            { $set: { isVerified: true, emailToken: "", password: hash } }
          ).exec();

          if (!user) {
            return res.status(200).json({
              success: false,
              message: "Change Password Link Expired!",
            });
          }

          return res
            .status(200)
            .json({ success: true, message: "Password Changed Successfully!" });
        } catch (err) {
          return res.status(400).send({
            success: false,
            message: err.message,
          });
        }
      } else {
        return res
          .status(200)
          .json({ success: false, message: "Change Password Link Expire !" });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Change Password Link Expire !" });
    }
  } catch (e) {
    return res
      .status(200)
      .json({ success: false, message: "Change Password Link Expire !" });
  }
};

exports.setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Password is required" });
    }
    if (!confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Please confirm password required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirm password do not match",
      });
    }
    if (password.length < 6 || password.length > 15) {
      return res.status(400).json({
        success: false,
        message:
          "Password can not be less than 6 and greater and 15 characters",
      });
    }

    const decoded = jwt.verify(token, TOKEN_SECRET);
    if (decoded) {
      const { userId } = decoded;
      const userObj = await User.findOne({ _id: userId }).exec();

      if (userObj) {
        if (userObj.verifyPassword(password)) {
          return res.status(200).send({
            success: false,
            message: "Your new password cannot be the same as old!",
          });
        }

        // Hash the new password and save it
        const salt = await bcrypt.genSalt(parseInt(saltRounds));
        const hash = await bcrypt.hash(password, salt);

        try {
          const user = await User.updateOne(
            { _id: userId },
            { $set: { isVerified: true, emailToken: "", password: hash } }
          ).exec();

          if (!user) {
            return res.status(200).json({
              success: false,
              message: "Change Password Link Expired!",
            });
          }

          return res
            .status(200)
            .json({ success: true, message: "Password changed successfully!" });
        } catch (err) {
          return res.status(400).send({
            success: false,
            message: err.message,
          });
        }
      } else {
        return res
          .status(200)
          .json({ success: false, message: "Change Password Link Expire !" });
      }
    } else {
      return res
        .status(200)
        .json({ success: false, message: "Change Password Link Expire !" });
    }
  } catch (e) {
    return res
      .status(200)
      .json({ success: false, message: "Change Password Link Expire !" });
  }
};

exports.requestConsultation = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user }).exec();
    const { email, userName, description } = req.body;

    const userObj = {
      email,
      userName,
      description,
    };

    sendEmailToContactUs(userObj, true);

    return res
      .status(200)
      .json({ success: true, message: "Request Generated Successfully!" });
  } catch (e) {
    return res.status(200).json({ success: false, message: "" });
  }
};

async function sendEmailToContactUs(AppliedPerson, check) {
  let subject = `Contact Us By: ${AppliedPerson.userName}!`;
  if (check) {
    subject = `Request a Consultation!`;
  }
  let to = ["xinfotechsoft@gmail.com", "yasminek@spotterverse.com"];

  let htmlData = {
    subject: subject,
    name: AppliedPerson.userName,
    email: AppliedPerson.email,
    description: AppliedPerson.description,
  };

  let htmlBody = await generateHtmlBodyContent("contactUs.html", htmlData);
  SendEmail(to, subject, htmlBody);
}

async function sendPasswordResetEmail(id, email, name) {
  const token = jwt.sign({ userId: id }, TOKEN_SECRET, { expiresIn: "30m" });
  const subject = "Reset Password Spring Hunts";
  const to = {
    email,
  };

  const resetPasswordUrl = `${baseURL}reset-password/${token}`;
  const htmlData = {
    name,
    resetPasswordUrl,
  };

  const htmlBody = await generateHtmlBodyContent(
    "reset-password.html",
    htmlData
  );
  SendEmail(to, subject, htmlBody);
}

async function sendAccountVerificationEmail(userObj) {
  const token = jwt.sign({ userId: userObj._id }, TOKEN_SECRET, {
    expiresIn: "14d",
  });
  const subject = "Please verify your Spring Hunts account !";
  const to = {
    email: userObj.email,
    name: userObj.captainName,
  };
  const verificationUrl = `${serverURL}/api/auth/emailVerification/${token}`;
  const htmlData = {
    verificationUrl,
    name: userObj.captainName,
  };

  const htmlBody = await generateHtmlBodyContent("welcome.html", htmlData);
  SendEmail(to, subject, htmlBody);
}

exports.createSingleTeam = async (req, res) => {
  try {
    const { email, teamName, teamNo, testUser, raceId, bulk } = req.body;

    const raceRoutes = await RACEROUTES.find({ raceId: raceId }).exec();
    if (raceRoutes.length == 0) {
      return res
        .status(200)
        .send({ success: false, message: " Race Routes are required!" });
    }

    if (bulk) {
      const userBulkCount = parseInt(teamNo);
      const raceObj = await RACE.findOne({ _id: raceId }).exec();

      if (raceObj && raceObj.domain && !isNaN(parseInt(teamNo))) {
        for (let x = 0; userBulkCount > x; x++) {
          // lastCount
          const Obj = await User.find({ raceId: raceId, testUser }).exec();
          console.log(Obj);
          const count = Obj.length + 1;
          const initial = raceObj.domain + count;
          console.log(count);
          const email =
            (testUser ? "test" : "team") +
            count +
            "@" +
            raceObj.domain +
            ".com";

          const password = (testUser ? "test" : "team") + count;
          // Validation checks successful, proceed to create new user and company
          const salt = await bcrypt.genSalt(parseInt(saltRounds));
          const hash = await bcrypt.hash(password, salt);

          const raceRoutesId = await assignRoutes(raceId);
          console.log(email);
          const userObj = {
            email,
            teamName: password,
            teamNo: count,
            testUser,
            passwordText: password,
            password: hash,
            type: "Race",
            raceId,
            raceRouteId: raceRoutesId,
            role: "301",
            isVerified: true,
          };
          console.log(userObj);
          await User.create(userObj);
          await RACE.updateOne({ _id: raceId }, { $set: { lastCount: count } });
        }
        // Return successful signup response to the user
        return res.status(200).send({
          success: true,
          message: "User Created Successfully!",
        });
      } else {
        return res.status(200).send({
          success: false,
          message: "Please enter valid domain or team number!",
        });
      }
    } else {
      if (!email) {
        return res
          .status(200)
          .send({ success: false, message: "Email is required!" });
      }
      if (!validateEmail(email)) {
        return res.status(200).send({
          success: false,
          message: "Please enter valid email address!",
        });
      }

      // Check if user with given email, company with given name, or company with given domain already exists
      const userWithEmail = await User.findOne({ email }).exec();

      if (userWithEmail) {
        const errorObj = {};

        if (userWithEmail) {
          errorObj.email = "Email Already Exists In Another Race!";
        }

        return res.status(200).send({
          success: false,
          message: "Email Already Exists Or Email is a part of other Race!",
          errorObj,
        });
      }

      const password = email.split("@");
      // Validation checks successful, proceed to create new user and company
      const salt = await bcrypt.genSalt(parseInt(saltRounds));
      const hash = await bcrypt.hash(password[0], salt);

      const raceRoutesId = await assignRoutes(raceId);

      const Obj = await User.find({ raceId: raceId, testUser }).exec();
      const count = Obj.length + 1;
      const userObj = {
        email,
        teamName,
        teamNo: count,
        testUser,
        passwordText: password[0],
        password: hash,
        type: "Race",
        raceId,
        raceRouteId: raceRoutesId,
        role: "301",
        isVerified: true,
      };

      // create user
      await User.create(userObj);

      // Return successful signup response to the user
      return res.status(200).send({
        success: true,
        message: "User Created Successfully!",
        data: userObj,
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong try again later!",
      error: e,
    });
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = req.body.rowsPerPage;

    const { raceId, testUser } = req.body;

    const queryObject = { raceId: mongoose.Types.ObjectId(raceId) };

    if (!testUser) {
      queryObject.testUser = false;
    }

    User.aggregate(
      [
        {
          $match: queryObject,
        },
        {
          $lookup: {
            from: "raceroutes",
            localField: "raceRouteId",
            foreignField: "_id",
            as: "routes",
          },
        },
        // {
        //   $sort: {
        //     _id: -1,
        //   },
        // },
        {
          $limit: pageNumber * perPage + 20,
        },
      ],
      async function (err, documents) {
        const totalCount = await User.countDocuments(queryObject).exec();

        if (err) {
          return res.status(200).json({
            status: false,
            message: "Something went wrong !",
          });
        } else {
          return res.status(200).json({
            success: true,
            message: "Data Retrieve Successfully!",
            data: documents,
            totalCount,
          });
        }
      }
    );
  } catch (e) {
    return res.status(200).json({
      success: false,
      message: "Something went wrong try again later!",
      e,
    });
  }
};

async function assignRoutes(raceId) {
  let selectedRoutes = "";

  const raceRoutes = await RACEROUTES.find({ raceId: raceId }).exec();

  if (raceRoutes.length === 0) {
    return selectedRoutes;
  }

  const raceUsers = await User.find({ raceId: raceId }).exec();
  const lastUser = raceUsers[raceUsers.length - 1];

  if (raceUsers.length == 0) {
    return (selectedRoutes = raceRoutes[0].id);
  }

  for (let x = 0; raceRoutes.length > x; x++) {
    const obj = raceRoutes[x];
    if (lastUser.raceRouteId == obj.id) {
      if (x + 1 == raceRoutes.length) {
        selectedRoutes = raceRoutes[0];
      } else {
        selectedRoutes = raceRoutes[x + 1];
      }
    }
  }

  return selectedRoutes;
}

exports.signUpNewUser = async (req, res) => {
  try {
    const { email, password, raceId, captainName } = req.body;

    const raceRoutes = await RACEROUTES.find({ raceId: raceId }).exec();
    if (raceRoutes.length == 0) {
      return res
        .status(200)
        .send({ success: false, message: " Race Routes are required!" });
    }
    {
      if (!email) {
        return res
          .status(200)
          .send({ success: false, message: "Email is required!" });
      }
      if (!validateEmail(email)) {
        return res.status(200).send({
          success: false,
          message: "Please enter valid email address!",
        });
      }

      // Check if user with given email, company with given name, or company with given domain already exists
      const userWithEmail = await User.findOne({
        email
      }).exec();

      if (userWithEmail) {
        const errorObj = {};

        if (userWithEmail) {
          errorObj.email = "Email Already Exists!";
        }

        return res
          .status(200)
          .send({ success: false, message: "Email Already Exists!", errorObj });
      }

      // Validation checks successful, proceed to create new user and company
      const salt = await bcrypt.genSalt(parseInt(saltRounds));
      const hash = await bcrypt.hash(password, salt);

      const raceRoutesId = await assignRoutes(raceId);

      const userObj = {
        email,
        // teamName,
        // teamNo,
        // testUser,
        passwordText: password,
        password: hash,
        type: "Race",
        raceId,
        raceRouteId: raceRoutesId,
        role: "301",
        captainName: captainName,
      };

      // create user
      const createdUser = await User.create(userObj);

      sendAccountVerificationEmail(createdUser);

      // Return successful signup response to the user
      return res.status(200).send({
        success: true,
        message: "Please check your email to verify your account!",
        data: userObj,
      });
    }
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong try again later!",
      error: e,
    });
  }
};
