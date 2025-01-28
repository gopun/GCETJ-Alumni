const successHandler = (req, res, next) => {
  res.success = (data, message = "Success") => {
    res.status(200).json({
      success: true,
      message: message,
      data: data,
    });
  };
  next();
};

module.exports = successHandler;
