const express = require("express");

const router = express.Router();

const { addCoupon, getCoupons, getCouponById, updateCouponById, deleteCouponById } = require("../controllers/couponController");

router.post("/addCoupon", addCoupon);
router.get("/getCoupons", getCoupons);
router.get("/getCouponById/:id", getCouponById);
router.put("/updateCouponById/:id", updateCouponById);
router.delete("/deleteCouponById/:id", deleteCouponById);

module.exports = router;
