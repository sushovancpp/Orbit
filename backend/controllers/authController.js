const User = require('../models/User');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
  try {
    const { username, name, email, password } = req.body;
    if (!username || !name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields required' });
    if (await User.findOne({ $or: [{ email }, { username }] }))
      return res.status(409).json({ success: false, message: 'Email or username already taken' });
    const user = await User.create({ username, name, email, password });
    res.status(201).json({ success: true, token: generateToken(user._id), user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastSeen = Date.now();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, token: generateToken(user._id), user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user.toPublicJSON() });
};

exports.oauthCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/oauth?token=${token}`);
};
