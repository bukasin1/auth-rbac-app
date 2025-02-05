exports.getAdminData = (req, res) => {
  res.status(200).json({ message: "This is admin data!" });
};

exports.getShipperData = (req, res) => {
  res.status(200).json({ message: "This is shipper data!" });
};

exports.getCarrierData = (req, res) => {
  res.status(200).json({ message: "This is carrier data!" });
};
