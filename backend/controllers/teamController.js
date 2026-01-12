const EventModel = require("../model/eventModel");
const TeamModel = require("../model/teamModel");
const { StatusCodes: codes } = require("http-status-codes");
const generateToken = require("../utils/generateToken");
const QRCode = require("qrcode");

// Create a new team for an event
const createTeam = async (req, res) => {
  const { eventId } = req.params;
  console.log(eventId);
  const { leaderName, email, department, year, phoneNumber, teamName } =
    req.body;
  console.log(req.body);
  if (
    !leaderName ||
    !email ||
    !department ||
    !year ||
    !phoneNumber ||
    !teamName
  ) {
    return res
      .status(codes.BAD_REQUEST)
      .json({ message: "Please provide all required fields" });
  }
  const event = await EventModel.findById(eventId);
  if (!event) {
    return res.status(codes.NOT_FOUND).json({ message: "Event not found" });
  }

  const team = await TeamModel.create({
    eventId,
    leaderName,
    email,
    department,
    year,
    phoneNumber,
    teamName,
  });
  const token = generateToken({ eventId, teamId: team._id });
  team.qrToken = token;
  await team.save();

  //  QR Code as Buffer
  const qrData = {
    teamId: team._id.toString(),
    eventId: eventId,
    token: token,
  };

  const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData), {
    width: 400,
    height: 400,
    margin: 2,
    errorCorrectionLevel: "H",
  });

  const qrBase64 = qrBuffer.toString("base64");

  res.status(codes.CREATED).json({
    team,
    qrBuffer: qrBase64,
    qrFileName: `qr-${teamName.replace(/\s+/g, "-")}-${team._id}.png`,
  });
};

const getAllTeams = async (req, res) => {
  const teams = await TeamModel.find({});
  res.status(codes.OK).json({ teams, count: teams.length });
};

const getSingleTeam = async (req, res) => {
  const { id } = req.params;
  const team = await TeamModel.findById(id);
  if (!team) {
    return res.status(codes.NOT_FOUND).json({ message: "Team not found" });
  }
  res.status(codes.OK).json({ team });
};

module.exports = {
  createTeam,
  getAllTeams,
  getSingleTeam,
};
