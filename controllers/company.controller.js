const mongoose = require('mongoose');
const Company = require('../models/company');
const { uploadFileToS3Bucket } = require('../_utils/awsS3Bucket');

exports.create = async (req, res) => {
  try {
    const exist_company = await Company.findOne({ userId: req.user }).exec();

    const { name, domain, industry, companySize, conutry, states, location, city, description } = req.body;

    if (!name || !domain || !industry || !companySize) {
      return res.status(400).send({ success: false, message: 'Please enter all required Field!' });
    }

    let company = '';

    if (exist_company) {

      const newCompany = {
        userId: req.user,
        name,
        domain,
        industry,
        companySize,
        location,
        city,
        states,
        conutry,
        isCompleted: true,
        description
      };

      company = await Company.updateOne({ userId: req.user }, newCompany, { upsert: true }).exec();

    } else {
      const newCompany = {
        userId: req.user,
        name,
        domain,
        industry,
        companySize,
        location,
        city,
        states,
        conutry,
        isCompleted: true
      };
      // user company detail
      company = await Company.create(newCompany);
    }
    // Return successful signup response to the user
    return res.status(201).send({ success: true, message: 'Company Created Successfully!', company });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.uploadImage = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user }).exec();

    let avatar = '';
    let fileName = '';
    if (req.file) {
      fileName = req.file.filename;
    }
    avatar = `https://spotterverse.s3.amazonaws.com/${fileName}`;
    if (!avatar) {
      return res.status(200).send({ success: false, message: 'No image file was found in request payload!' });
    }

    try {
      let doc;

      if (company) {
        doc = await Company.updateOne({ userId: req.user }, { avatar }, { upsert: true }).exec();
      } else {
        const newCompany = {
          userId: req.user,
          avatar,
        };
        // user company detail
        doc = await Company.create(newCompany);
      }

      if (!doc) {
        return res.status(200).send({
          success: false,
          message: 'Company Not Found!',
        });
      }

      if (fileName) await uploadFileToS3Bucket(fileName);

      const companyObj = await Company.findOne({ userId: req.user }).exec();

      return res.status(200).send({
        success: true,
        companyObj,
        message: 'Company Logo Updated Successfully!',
      });
    } catch (err) {
      return res.status(404).send({
        success: false,
        message: err.message,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { companyName, companyDomain, industry, noEmployee, location, state, city, companyId } = req.body;

    if (!companyName || !companyDomain || !industry || !noEmployee) {
      return res.status(400).send({ success: false, message: 'Please enter all required Field!' });
    }

    // Check if company with given name, or company with given domain already exists
    const companyWithName = await Company.findOne({ _id: { $ne: companyId }, companyName }).exec();
    const companyWithDomain = await Company.findOne({ _id: { $ne: companyId }, companyDomain }).exec();

    if (companyWithName || companyWithDomain) {
      const errorObj = {};
      if (companyWithName) {
        errorObj.companyName = 'Company Name Already Exist!';
      }
      if (companyWithDomain) {
        errorObj.companyDomain = 'Domain Already Exist!';
      }

      return res.status(200).send({ success: false, message: 'Already exists', errorObj });
    }

    // Proceed to update company details
    const companyObj = {
      companyName,
      companyDomain,
      industry,
      noEmployee,
      location,
      state,
      city,
    };

    // update company details
    try {
      const doc = await Company.updateOne({ _id: companyId }, companyObj, { upsert: true }).exec();

      if (!doc) {
        return res.status(404).send({
          success: false,
          message: 'Company Not Found!',
        });
      }

      const company = await Company.findOne({ _id: companyId }).exec();
      return res.status(200).send({
        success: true,
        company,
        message: 'Company Profile Updated Successfully!',
      });
    } catch (err) {
      return res.status(404).send({
        success: false,
        message: err.message,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.getCompany = async (req, res) => {
  try {
    const company = await Company.findOne({ userId: req.user }).exec();
    // Else, return company details
    return res.status(200).send({
      success: true,
      company,
      message: 'Company Successfully!',
    });
  } catch (e) {
    return res.status(400).json({ success: false, message: 'Company Not Found!' });
  }
};

exports.updateStatus = async (req, res) => {
  // admin check apply when we have role management done react side.
  try {
    const { companyId } = req.params;
    const oldCompany = await Company.findOne({ _id: companyId }).exec();

    if (!oldCompany) {
      return res.status(404).send({
        success: false,
        message: 'Company Not Found!',
      });
    }

    const updateCompanyDocument = { isActive: !oldCompany.isActive };

    try {
      const doc = await Company.updateOne({ _id: companyId }, updateCompanyDocument, { upsert: true }).exec();

      if (!doc) {
        return res.status(404).send({
          success: false,
          message: 'Company Not Found!',
        });
      }

      const newCompany = await Company.findOne({ _id: companyId }).exec();
      return res.status(200).send({
        success: true,
        company: newCompany,
        message: 'Company Profile Updated Successfully!',
      });
    } catch (err) {
      return res.status(404).send({
        success: false,
        message: err.message,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

// Company Details
exports.companyDetail = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).send({ success: false, message: 'companyId is required!' });
    }

    const company = await Company.findOne({ _id: companyId }).exec();
    if (!company) {
      return res.status(400).send({ success: false, message: 'Company not found!' });
    }

    const queryObject = { _id: mongoose.Types.ObjectId(companyId) };
    const pipeline = [
      {
        $match: queryObject,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'parentId',
          as: 'totalUser',
        },
      },
      {
        $lookup: {
          from: 'users',
          pipeline: [{ $match: { role: '303', parentId: company.userId } }],
          as: 'totalEmployee',
        },
      },
      {
        $lookup: {
          from: 'users',
          pipeline: [{ $match: { role: '302', parentId: company.userId } }],
          as: 'totalManager',
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'userId',
          foreignField: 'userId',
          as: 'totalDepartment',
        },
      },
      {
        $lookup: {
          from: 'appintegrateds',
          localField: 'userId',
          foreignField: 'userId',
          as: 'totalintegrated',
        },
      },
      {
        $project: {
          dignoScore: 1,
          userId: 1,
          totalUser: { $size: '$totalUser' },
          totalEmployee: { $size: '$totalEmployee' },
          totalManager: { $size: '$totalManager' },
          totalDepartment: { $size: '$totalDepartment' },
          totalIntegrated: { $size: '$totalintegrated' },
        },
      },
    ];

    try {
      const documents = await Company.aggregate(pipeline).exec();
      return res.status(200).json({ success: true, message: 'Company statistics Successfully!', data: documents });
    } catch (err) {
      return res.status(404).send({
        success: false,
        message: err,
      });
    }
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};
