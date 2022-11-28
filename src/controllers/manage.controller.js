const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.req_comm = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  let payload = {
    GetCommissionRequestsList: {
      codUser: LoginData.author_id,
    },
  };
  let Comms_From = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetCommissionRequestsList"
  );
  payload = {
    GetCommissionsList: {
      codUser: LoginData.author_id,
    },
  };
  let Comms_To = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetCommissionsList"
  );
  payload = {
    RequestsList: {
      author_id: LoginData.author_id,
      rec_type: "SELF",
    }
  }
  let Req_To = await Remote1.TheOnlyMethodUNeed(payload, "RequestsList");
  payload = {
    RequestsList: {
      author_id: LoginData.author_id,
      rec_type: "FROM",
    }
  }
  let Req_From = await Remote1.TheOnlyMethodUNeed(payload, "RequestsList");

  const ReqCommList = { Comms_From, Comms_To, Req_To, Req_From };
  res.render("manage/solicitudes", { LoginData, ReqCommList })

};

controller.perfil = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  console.log("Session: ",LoginData);
  res.render("manage/perfil", { LoginData })
};

module.exports = controller;
