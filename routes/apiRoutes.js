const express = require("express");
const { authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getAdminData,
  getShipperData,
  getCarrierData,
} = require("../controllers/protectedController");

const router = express.Router();

router.get("/admin", authorizeRoles("admin"), getAdminData);

router.get("/shipper", authorizeRoles("shipper", "admin"), getShipperData);

router.get("/carrier", authorizeRoles("carrier", "admin"), getCarrierData);

module.exports = router;
