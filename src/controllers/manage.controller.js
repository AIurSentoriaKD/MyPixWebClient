const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.req_comm = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  let payload = {
    GetCommissionRequestsList: {
      codUser: LoginData.author_id,
    },
  };
  let Req_Comms = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetCommissionRequestsList"
  );
  payload = {
    GetCommissionsList: {
      codUser: LoginData.author_id,
    },
  };
  let Comms_Invoice = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetCommissionsList"
  );
  
res.render("manage/solicitudes")

};

controller.perfil = async (req, res) => {
  res.render("manage/perfil")
};

module.exports = controller;
