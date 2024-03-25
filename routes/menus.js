const express = require('express');

const {getMenu,addMenu,updateMenu,deleteMenu} = require('../controllers/menus');

const router =express.Router({mergeParams:true});

const {protect,authorize} =require('../middleware/auth');

router.route('/').post(protect,authorize('admin'),addMenu);
router.route('/:id').get(getMenu).put(protect,authorize('admin'),updateMenu).delete(protect,authorize('admin'),deleteMenu);

module.exports = router;