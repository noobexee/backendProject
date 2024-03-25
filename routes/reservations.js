const express = require('express');

const {getReservations,getReservation,addReservation,updateReservation,deleteReservation,orderFood,removeFood} = require('../controllers/reservation');

const router =express.Router({mergeParams:true});

const {protect,authorize} =require('../middleware/auth');

router.route('/').get(protect,getReservations).post(protect,authorize('admin','user'),addReservation);
router.route('/:id').get(protect,getReservation).put(protect,authorize('admin','user'),updateReservation).delete(protect,authorize('admin','user'),deleteReservation);
router.route('/:id').post(protect,authorize('admin','user'),orderFood);
router.route('/:id/:food').delete(protect,authorize('admin','user'),removeFood);

module.exports = router;