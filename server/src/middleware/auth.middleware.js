// TODO: Implement authentication middleware (stretch)

const auth = (req, res, next) => {
  // TODO: Verify JWT and attach req.user
  next();
};

export default auth;
