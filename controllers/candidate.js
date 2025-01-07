const JOB = require('../models/job');
const User = require('../models/user');
const ApplyJob = require('../models/applyJob');
const CustomResume = require('../models/customResume');

const mongoose = require('mongoose');

const Slots = require('../models/slots');
const { uploadFileToS3Bucket } = require('../_utils/awsS3Bucket');


const { generateHtmlBodyContent } = require('../_utils/AddDataInHtml');
const { SendEmail } = require('../_utils/email_Send');


const { serverURL, baseURL, TOKEN_SECRET } = require('../config/vars');

exports.index = function (req, res) {
  try {
    var pageNumber = req.body.pageNumber - 1;
    var perPage = 20;

    const { title, category, location } = req.body;
    const queryObject = {};

    // queryObject.iscompleted = true;

    queryObject.role = '301';

    queryObject.firstName = { $ne: '' }

    let queryArray = [];

    if (title) {
      queryArray = [
        { firstName: new RegExp(title, 'i') },
        { lastName: new RegExp(title, 'i') },
        { jobTitle: new RegExp(title, 'i') },
        { description: new RegExp(title, 'i') },
        { 'intro.description': new RegExp(title, 'i') },
        { 'expertise.description': new RegExp(title, 'i') },
        { 'long_term_goal.description': new RegExp(title, 'i') },
        { 'five_year_goal.description': new RegExp(title, 'i') },
        { 'friends_feedBack.description': new RegExp(title, 'i') },
        { 'anything_else.description': new RegExp(title, 'i') },
      ];
    }
    if (category) {
      queryArray.push({ jobTitle: new RegExp(category, 'i') });
      queryArray.push({ 'intro.description': new RegExp(category, 'i') });
      queryArray.push({ 'expertise.description': new RegExp(category, 'i') });
      queryArray.push({ 'long_term_goal.description': new RegExp(category, 'i') });
      queryArray.push({ 'five_year_goal.description': new RegExp(category, 'i') });
      queryArray.push({ 'friends_feedBack.description': new RegExp(category, 'i') });
      queryArray.push({ 'anything_else.description': new RegExp(category, 'i') });
    }
    if (location) {
      queryArray.push({ country: new RegExp(location, 'i') });
      queryArray.push({ 'intro.description': new RegExp(location, 'i') });
      queryArray.push({ 'expertise.description': new RegExp(location, 'i') });
      queryArray.push({ 'long_term_goal.description': new RegExp(location, 'i') });
      queryArray.push({ 'five_year_goal.description': new RegExp(location, 'i') });
      queryArray.push({ 'friends_feedBack.description': new RegExp(location, 'i') });
      queryArray.push({ 'anything_else.description': new RegExp(location, 'i') });
    }
    if (title || category || location) {
      queryObject.$or = queryArray;
    }

    User.aggregate(
      [
        {
          $match: queryObject,
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $limit: pageNumber * perPage + 20,
        },
        // {
        //   $skip: pageNumber * perPage,
        // },
      ],
      async function (err, documents) {
        const totalCount = await User.countDocuments(queryObject).exec();

        if (err) {
          return res.status(200).json({
            status: false,
            message: 'Something went wrong !',
          });
        } else {
          return res.status(200).json({ success: true, message: 'Data Retrieve Successfully!', data: documents, totalCount });
        }
      }
    );
  } catch (e) {
    return res.status(200).json({ success: false, message: 'Something went wrong try again later!', e });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    let avatar = '';
    let fileName = '';
    if (req.file) {
      fileName = req.file.filename;
    }
    avatar = `https://spotterverse.s3.amazonaws.com/${fileName}`;
    if (avatar) {
      try {
        const doc = await User.updateOne({ _id: req.user }, { avatar, isAvatarUpdated: true }, { upsert: true }).exec();
        if (!doc) {
          return res.status(400).send({
            success: false,
            message: 'User Not Found!',
          });
        }
        const user = await User.findOne({ _id: req.user }).exec();
        const data = {
          userName: user.userName,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
        };
        if (fileName) await uploadFileToS3Bucket(fileName, 'image/png');
        return res.status(200).send({
          success: true,
          user: data,
          message: 'User Profile Image Updated Successfully!',
        });
      } catch (err) {
        return res.status(404).send({
          success: false,
          message: err.message,
        });
      }
    } else {
      return res.status(400).send({ success: false, message: 'No image was provided to upload!' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserDetail = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await User.findOne({ _id: req.user ? req.user : id }).exec();
    return res.status(200).json({
      success: true,
      message: 'success',
      user: result,
    });
  } catch (e) {
    console.log('Error', e.message);
  }
};

exports.uploadCVFile = async (req, res, next) => {
  try {
    {
      let fileName = '';
      if (req.file) {
        fileName = req.file.filename;
      }
      const avatar = `https://spotterverse.s3.amazonaws.com/${fileName}`;
      const obj = {
        cvPath: avatar,
      };
      if (avatar) {
        try {
          const doc = await User.updateOne({ _id: req.user }, obj, { upsert: true }).exec();
          if (!doc) {
            return res.status(400).send({
              success: false,
              message: 'User Not Found!',
            });
          }
          const user = await User.findOne({ _id: req.user }).exec();
          if (fileName) await uploadFileToS3Bucket(fileName, 'application/pdf');
          return res.status(200).send({
            success: true,
            cvPath: user.cvPath,
            message: 'User CV Updated Successfully!',
          });
        } catch (err) {
          return res.status(404).send({
            success: false,
            message: err.message,
          });
        }
      } else {
        return res.status(400).send({ success: false, message: 'No image was provided to upload!' });
      }
    }
  } catch (e) {
    console.log('Error', e.message);
  }
};

exports.CreateResume = async (req, res, next) => {
  try {
    {
      let payload = req.body;

      const obj = payload;

      await User.updateOne({ _id: req.user }, obj, { upsert: true });

      const result = await User.findOne({
        _id: req.user,
      }).exec();

      return res.status(200).json({
        success: true,
        cvPath: result,
        message: 'Candidate Profile Updated Successfully!',
      });
    }
  } catch (e) {
    console.log('Error', e.message);
  }
};

exports.CompleteProfile = async (req, res) => {
  try {
    const result = await User.findOne({ _id: req.user }).exec();

    var profileCompleted = 0;

    if (result.isAvatarUpdated) {
      profileCompleted = 20;
    } else {
    }

    if (result.firstName && result.lastName && result.gender && result.country && result.states && result.phoneNumber && result.jobTitle && result.authState && result.jobIdeal) {
      profileCompleted += 30;
    } else {
    }

    if (result.cvPath) {
      profileCompleted += 10;
    } else {
    }

    if (result.intro?.videoUrl) {
      profileCompleted += 10;
    } else {
    }

    if (result.expertise?.videoUrl) {
      profileCompleted += 10;
    } else {
    }

    if (result.long_term_goal?.videoUrl) {
      profileCompleted += 5;
    } else {
    }

    if (result.five_year_goal?.videoUrl) {
      profileCompleted += 5;
    } else {
    }

    if (result.friends_feedBack?.videoUrl) {
      profileCompleted += 5;
    } else {
    }

    if (result.anything_else?.videoUrl) {
      profileCompleted += 5;
    } else {
    }

    const queryObjectStatus = {};

    queryObjectStatus.userId = req.user;
    queryObjectStatus.step = 'apply';

    const apply = await ApplyJob.countDocuments(queryObjectStatus).exec();
    queryObjectStatus.step = 'interviewed';
    const interviewed = await ApplyJob.countDocuments(queryObjectStatus).exec();
    queryObjectStatus.step = 'shortlist';
    const shortlist = await ApplyJob.countDocuments(queryObjectStatus).exec();

    const jobStatus = {
      apply,
      interviewed,
      shortlist,
      profileVisited: result.profileVisited,
    };

    return res.status(200).json({
      success: true,
      message: 'success',
      profileCompleted,
      profileVisited: result.profileVisited,
      jobStatus,
    });
  } catch (e) {
    console.log('Error', e.message);
  }
};

exports.profileVisited = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await User.findOne({ _id: id }).exec();

    const obj = {
      profileVisited: result.profileVisited + 1,
    };

    await User.updateOne({ _id: id }, obj, { upsert: true });

    return res.status(200).json({
      success: true,
      message: 'success',
      profileVisited: result.profileVisited,
    });
  } catch (e) {
    console.log('Error', e.message);
  }
};

exports.applyForJob = async (req, res) => {
  try {
    const payload = req.body;

    payload.userId = req.user;
    payload.jobId = payload.jobId;
    
    let customResume = "";

    if(payload.customResumeId){
      customResume = await CustomResume.findOne({ _id: payload.customResumeId }).exec();
      payload.jobId = customResume.jobId
      
    }
  
    const currentJob = await JOB.findOne({ _id: payload.jobId }).exec();
    const result = await ApplyJob.findOne(payload).exec();

    if (result) {
      return res.status(200).json({
        success: false,
        message: 'Already Applied For Job',
      });
    } else {
      payload.jobCreatorId = currentJob.userId;

      const job = new ApplyJob(payload);
      await job.save();

      
      const AppliedPerson =  await User.findOne({ _id: req.user }).exec(); 

      const JobCreator = await User.findOne({ _id: currentJob.userId }).exec(); ;
      
      const Job = currentJob ;

      
      
      sendEmailToApplicantAndJobCreator(AppliedPerson, JobCreator, Job);

      return res.status(200).json({
        success: true,
        message: 'success',
        data: job,
      });
    }
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};


exports.checkAlreadyApplied = async (req, res) => {
  try {
    const payload = req.body;

    payload.userId = req.user;
    payload.jobId = payload.jobId;

    const result = await ApplyJob.findOne(payload).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Already Applied For Job',
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.jobTotalApplied = async (req, res) => {
  try {
    const payload = {};

    payload.userId = req.user;
   
    const result = await ApplyJob.find(payload).populate({ path: 'jobId', select: 'title _id createdAt '}).populate({ path: 'jobCreatorId', select: 'email '}).sort( { "_id": -1 } ).exec();

    return res.status(200).json({
      success: true,
      result,
      message: 'Already Applied For Job',
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};





async function sendEmailToApplicantAndJobCreator(AppliedPerson, JobCreator, Job){

  
  let subject = `Congratulations!  You Successfully applied for: ${Job.title} !`;
  let to = AppliedPerson.email;

  let htmlData = {
    name: AppliedPerson.userName,
    title: Job.title,
    description: Job.description,
    link:`${serverURL}/job-view?id=${Job._id}`

  };
  let htmlBody = await generateHtmlBodyContent('applyForJob.html', htmlData);
  SendEmail(to, subject, htmlBody);



   subject = `${AppliedPerson.userName} Apply for this Job: ${Job.title} !`;
   to = JobCreator.email;
   htmlData = {
    subject: subject,
    name: AppliedPerson.userName,
    jobTitle: AppliedPerson.jobTitle,
    email: AppliedPerson.email,
    title: Job.title,
    link:`${serverURL}/candidates-view?id=${AppliedPerson._id}`,
    description: AppliedPerson.description,
  };
  htmlBody = await generateHtmlBodyContent('candiateProfile.html', htmlData);
  SendEmail(to, subject, htmlBody);

}

exports.indexUser = function (req, res) {
  var pageNumber = req.body.pageNumber - 1;
  var perPage = 20;
  var queryObject = { userId: mongoose.Types.ObjectId(req.user) };
  queryObject.status = true;
  if (req.body.text != '') {
    queryObject.$or = [{ title: new RegExp(req.body.text, 'i') }, { description: new RegExp(req.body.text, 'i') }];
  }

  JOB.aggregate(
    [
      {
        $match: queryObject,
      },
      {
        $sort: {
          _id: -1,
        },
      },
      // {
      //   $limit: pageNumber * perPage + 20,
      // },
      // {
      //   $skip: pageNumber * perPage,
      // },
    ],
    async function (err, documents) {
      if (err) {
        res.json({
          status: 'error',
          message: err,
        });
        return;
      } else {
        return res.status(200).json({ status: 200, data: documents });
      }
    }
  );
};

exports.createJob = async (req, res, next) => {
  try {
    var payload = req.body;
    console.log(payload);
    var avatar = 'placeHolder.png';
    if (req.file) {
      avatar = req.file.filename;
    }
    payload.avatar = avatar;

    payload.userId = req.user;

    const job = new JOB(payload);
    // const x = emailVerification.emailVeriFunction(user._id, user.email);
    var newJob = await job.save();

    return res.status(200).json({
      status: 200,
      data: newJob,
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.jobSheduleAdd = async (req, res, next) => {
  try {
    var payload = req.body;

    JOB.findById(payload.jobId, async function (err, job) {
      if (!job) {
        return res.status(401).send({ status: 'error', message: 'PersonNotFound' });
      } else {
        if (job) {
          job.status = true;
          job.bookedSlotsWithDate = payload.bookedSlotsWithDate;
          var newJob = await job.save();

          bookedSlotsWithDate = payload.bookedSlotsWithDate;

          for (let x = 0; bookedSlotsWithDate.length > x; x++) {
            let date_obj = bookedSlotsWithDate[x].date;
            let slots = bookedSlotsWithDate[x].slots;
            for (let y = 0; slots.length > y; y++) {
              let data = {
                date: date_obj,
                time: slots[y].time,
                jobId: payload.jobId,
                userId: req.user,
              };
              let obj_slot = await new Slots(data);
              await obj_slot.save();
            }
          }

          return res.status(200).json({
            status: 200,
            data: newJob,
          });
        }
        next();
      }
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.getSingleJobUser = async (req, res, next) => {
  try {
    var payload = req.body;

    JOB.findById(payload.jobs, async function (err, job) {
      if (!job) {
        return res.status(401).send({ status: 'error', message: 'PersonNotFound' });
      } else {
        if (job) {
          let bookedSlotsWithDate = job.bookedSlotsWithDate;

          for (let x = 0; bookedSlotsWithDate.length > x; x++) {
            let obj = bookedSlotsWithDate[x];
            let slot = obj.slots;

            for (let xy = 0; slot.length > xy; xy++) {
              let obj1 = slot[xy];
              if (obj1.status === false && obj1.userId) {
                let user = await User.findById(obj1.userId);
                console.log(user);
                obj1.user = user;
                slot[xy] = obj1;
              }
            }
          }

          return res.status(200).json({
            status: 200,
            data: job,
            bookedSlotsWithDate: bookedSlotsWithDate,
          });
        }
        next();
      }
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.getCandidateRemove = async (req, res, next) => {
  try {
    var payload = req.body;
    let { date, slot, userId, jobId } = payload;

    JOB.findById(payload.jobId, async function (err, job) {
      if (!job) {
        return res.status(401).send({ status: 'error', message: 'PersonNotFound' });
      } else {
        if (job) {
          let bookedSlotsWithDate = job.bookedSlotsWithDate;
          for (let x = 0; bookedSlotsWithDate.length > x; x++) {
            let obj = bookedSlotsWithDate[x];
            let slot = obj.slots;
            for (let xy = 0; slot.length > xy; xy++) {
              let obj1 = slot[xy];
              if (obj1.userId == userId) {
                obj1.status = true;
                delete obj1.userId;
                slot[xy] = obj1;
              }
            }
          }
          console.log(bookedSlotsWithDate);
          job.bookedSlotsWithDate = bookedSlotsWithDate;
          var newJob = await JOB.updateOne({ _id: jobId }, { bookedSlotsWithDate: bookedSlotsWithDate }, { upsert: true });
          return res.status(200).json({
            status: 200,
            data: job,
            bookedSlotsWithDate: bookedSlotsWithDate,
          });
        }
        next();
      }
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.approveForInterview = function (req, res) {
  try {
    Slots.find({ bookedUserId: req.user })
      .populate('jobId')
      .then((user) => {
        return res.status(200).json({ status: 200, data: user });
      });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.jobCreated = function (req, res) {
  try {
    JOB.find({ userId: req.user }).then((user) => {
      return res.status(200).json({ status: 200, data: user });
    });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};

exports.CandidateSelectedForInterview = function (req, res) {
  try {
    Slots.find({ userId: req.user, booked: true })
      .populate('jobId')
      .then((user) => {
        return res.status(200).json({ status: 200, data: user });
      });
  } catch (error) {
    return res.status(200).json({
      status: 500,
      message: error,
    });
  }
};



//Admin get All JOB


exports.indexAllAdminUser = async (req, res) => {
  try {
    const payload = req.body;

    const { type } = payload;


    let { pageNumber, rowsPerPage } = payload;

    if (!pageNumber || isNaN(pageNumber) || pageNumber <= 0) {
      pageNumber = 0;
    } else {
      pageNumber = Number(pageNumber) - 1;
    }

    if (!rowsPerPage || isNaN(rowsPerPage) || rowsPerPage < 10 || rowsPerPage > 100) {
      rowsPerPage = 10;
    }

    const queryObject = {};

    queryObject.$or = [{ 'role': '302' }, { 'role': '301' }];

    if (type === "resume") {
      queryObject.isResumeGenerated = true;
    }


    if (type === "user") {
      queryObject.isPaid = false;
    }

    if (type === "paid") {
      queryObject.isPaid = true;
    }

    const pipeline = [
      {
        $match: queryObject,
      },
      { $sort: { _id: -1 } },
      {
        $limit: pageNumber * rowsPerPage + rowsPerPage,
      },
      {
        $skip: pageNumber * rowsPerPage,
      },
    ];

    try {
      const documents = await User.aggregate(pipeline).exec();
      const count = await User.countDocuments(queryObject).exec();
      return res.status(200).json({ success: true, message: 'Task Retrieved Successfully!', documents, count });
    } catch (err) {
      console.error({ err });
      return res.status(404).send({
        success: false,
        message: err,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};