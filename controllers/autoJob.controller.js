const AutoApply = require('../models/autoApply');


exports.submitTargetSkill = async (req, res) => {
    try {

        const payload = req.body;
        payload.userId = req.user;
        payload.skills = payload.skills;

        const job = new AutoApply(payload);
        await job.save();

        return res.status(200).json({
            success: true,
            message: 'success',
            data: job,
        });

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error,
        });
    }
};



exports.activateResume = async (req, res) => {
    try {
        const { id } = req.params;
        await AutoApply.updateOne({ _id: id}, { isCompleted:  true, isActivated :  true }, { upsert: true });
        return res.status(200).json({
            success: true,
            message: 'Resume Activated Successfully!',
        });

    } catch (error) {
        return res.status(200).json({
            status: 500,
            message: error,
        });
    }
};

exports.viewAllResume = async (req, res) => {
    try {
      const payload = {};
      payload.userId = req.user;
     
      const result = await AutoApply.find(payload).populate({ path: 'jobId', select: 'title _id createdAt '}).populate({ path: 'jobCreatorId', select: 'email '}).sort( { "_id": -1 } ).exec();
  
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