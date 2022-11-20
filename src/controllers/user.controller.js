const Remote1 = require("../../remoteWS");
const controller = {};

controller.User = async (req, res) => {
  const id = req.params.id_user;
  const LoginData = req.session.LoginSessionInfo;
  const AuthorData = await Remote1.SingleAuthor(id);

  let match = true;

  if (AuthorData.author_id == LoginData.author_id) match = false;
  
  console.log(AuthorData);
  res.render("user", { LoginData, AuthorData, match });
};

module.exports = controller;
