const CoordinatorModel = require("../model/coordinatorModel");
const { StatusCodes: codes } = require("http-status-codes");
const generateToken = require("../utils/generateToken");

// Create a new coordinator

const createCoordinator = async (req, res) => {
  const { name, email, phoneNumber, department, year } = req.body;
  const isExisting = await CoordinatorModel.find({ email });
  if (isExisting.length) {
    return res
      .status(codes.BAD_REQUEST)
      .json({ message: "Coordinator already exists" });
  }
  if (!name || !email || !phoneNumber || !department || !year) {
    return res
      .status(codes.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }
  const coordinator = await CoordinatorModel.create({
    name,
    email,
    phoneNumber,
    department,
    year,
  });
  res.status(codes.CREATED).json({ coordinator });
};

const loginCoordinator = async (req, res) => {
  const { email, secretKey, name } = req.body;
  if (!email || !secretKey || !name) {
    return res
      .status(codes.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }
  const coordinator = await CoordinatorModel.findOne({ email, name });
  if (secretKey !== process.env.COORDINATOR_SECRET_KEY) {
    return res.status(codes.UNAUTHORIZED).json({ message: "Unauthorized" });
  }
  if (!coordinator) {
    ī;
    return res
      .status(codes.NOT_FOUND)
      .json({ message: "Coordinator not found" });
  }

  const token = generateToken({
    coordinatorId: coordinator._id,
    email: coordinator.email,
  });

  res.cookie("token", token, {
    httpOnly: true, // prevents JS access
    secure: process.env.NODE_ENV === "production", // only HTTPS in prod
  });
  res.status(codes.OK).json({ coordinator, token });
};

const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    domain:
      process.env.NODE_ENV === "production" ? ".yourdomain.com" : undefined,
    path: "/",
  });

  res.status(200).json({ message: "Logged out successfully" });
};
module.exports = {
  createCoordinator,

  loginCoordinator,
  logout,
};
