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


const controller = require('../controllers/company.controller');
const { authenticate } = require('../middlewares/auth');
const router = express.Router();

router.route('/create').post(authenticate, controller.create);
router.route('/update').post(authenticate, controller.updateCompany);
// router.route('/all').post(authenticate, controller.index);
router.route('/uploadImage').post(authenticate, upload.single('avatar'), controller.uploadImage);

router.route('/single').get(authenticate, controller.getCompany);


module.exports = router;
