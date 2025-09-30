const adminAuth = async (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (req.user && req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({
        message: "Access denied. Admin privileges required.",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error in admin authentication",
      error: error.message,
    });
  }
};

export default adminAuth;
