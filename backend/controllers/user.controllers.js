const jwt = require("jsonwebtoken");
const User = require("../models/users.model");

const JWT_SECRET = process.env.JWT_SECRET || "changeme";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
//fdsfdsfsbhfjasgdjadak
function generateToken(user) {
  return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

exports.register = async (req, res, next) => {
  //gsfsgsfgshfuaifhsdkjhdfkfshfksdfhgfdshksdhfkdsfkdsffkdsfgd
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already used" });

    const user = await User.createWithPassword(email, password);
    console.log(user);
    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);


    //ewsrdfghjgfdssdfgyuytrewaszdxcvghytrewszdxchgytresd
    console.log(token);
    res.json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};


exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}, { passwordHash: 0 });

    res.json(
      users.map((u) => ({
        id: u._id,
        email: u.email,
      }))
    );
  } catch (err) {
    next(err);
  }
};
