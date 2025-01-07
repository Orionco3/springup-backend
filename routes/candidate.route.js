const express = require('express');
const multer = require('multer');

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, './upload');
    },
    filename(req, file, cb) {
        const fileExtension = file.mimetype.split('/')[1];
        cb(null, `1${Date.now()}.${fileExtension}`);
    },
});

const upload = multer({ storage, dest: './upload' });


const controller = require('../controllers/candidate');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();


router.route('/public/listing').post(controller.index);
router.route('/profile-upload').post(authenticate, upload.single('avatar'), controller.uploadImage);
router.route('/public/user-detail/:id').post(controller.getUserDetail);

//  Get User Detail
router.route('/user-detail').post(authenticate, controller.getUserDetail);
router.route('/upload/cvFile').post(authenticate, upload.single('avatar'), controller.uploadCVFile);
router.route('/create/resume').post(authenticate, controller.CreateResume);

router.route('/complete-profile').post(authenticate, controller.CompleteProfile);



router.route('/apply-job').post(authenticate, controller.applyForJob);


router.route('/apply-job-already').post(authenticate, controller.checkAlreadyApplied);

router.route('/profileVisited/:id').post(controller.profileVisited);



router.route('/total-job-apply').get(authenticate, controller.jobTotalApplied);


// Admin
router.route('/admin/user-listing').post(authenticate, controller.indexAllAdminUser);


module.exports = router;
