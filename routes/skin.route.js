const express = require('express');

const controller = require('../controllers/skin.controller');

const { authenticate } = require('../middlewares/auth');


const router = express.Router();


router.route('/create-edit').post(authenticate, controller.Create);


router.route('/getSingle/:id').get(authenticate, controller.getSingleDetail);



router.route('/index').post(authenticate, controller.index);


router.route('/list/all').post(authenticate, controller.getAllGroups);





module.exports = router;
