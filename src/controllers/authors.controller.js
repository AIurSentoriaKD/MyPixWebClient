const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

//Remote.LoginIn('selitzia@email.com','12345');
// const data = Remote1.LoginIn('selitzia@email.com','12345');

controller.loginAuthor = async (req, res) => {
  const mail = req.body.login_mail;
  const passw = req.body.login_pass;
  console.log(mail, passw);
  try {
    let payload = {
      LoginIn: {
        mail: mail,
        passw: passw,
      },
    };
    const logData = await Remote1.TheOnlyMethodUNeed(payload, "LoginIn");
    if (logData) {
      req.session.LoginSessionInfo = logData;
      res.redirect("/DashBoard");
    } else {
      res.render("login", { log: 2 });
    }
  } catch (err) {
    console.log("ERROR EN AuthorsController.Login: ", err);
  }
};

controller.registerAuthor = async (req, res) => {
  let payload = {
    Agregar: {
      authorid: 1,
      nickname: req.body.register_nick,
      accountname: `${req.body.register_nick}@mpx`,
      email: req.body.register_correo,
      pass: req.body.register_pass,
      birthdate: req.body.register_birth,
      country: req.body.register_country,
    },
  };
  console.log(payload);
  // TODO
};

controller.logOut = async (req, res) => {
  req.session.destroy(function (err) {
    if (err) throw new Error(err.message);
    res.redirect("/");
  });
};

module.exports = controller;
