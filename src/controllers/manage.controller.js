const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const countries = require("../public/images/countrys")
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
      codUser: LoginData.author_id,
      rec_type: "SELF",
    }
  }
  let Req_To = await Remote1.TheOnlyMethodUNeed(payload, "RequestsList");
  payload = {
    RequestsList: {
      codUser: LoginData.author_id,
      rec_type: "FROM",
    }
  }
  let Req_From = await Remote1.TheOnlyMethodUNeed(payload, "RequestsList");

  if(Req_To.req_id){
    Req_To.profile_pic_dir = Req_To.profile_pic_dir.slice(1, Req_To.profile_pic_dir.length);
  } else {
    for (let i = 0; i < Req_To.length; i++) {
      Req_To[i].profile_pic_dir = Req_To[i].profile_pic_dir.slice(1, Req_To[i].profile_pic_dir);
    }
  }
  if(Req_From.req_id){
    Req_From.profile_pic_dir = Req_From.profile_pic_dir.slice(1, Req_From.profile_pic_dir.length);
  } else {
    for (let i = 0; i < Req_From.length; i++) {
      Req_From[i].profile_pic_dir = Req_From[i].profile_pic_dir.slice(1, Req_From[i].profile_pic_dir);
    }
  }

  const ReqCommList = { Comms_From, Comms_To, Req_To, Req_From };
  res.render("manage/solicitudes", { LoginData, ReqCommList })

};

controller.perfil = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  console.log("Session: ", LoginData);
  res.render("manage/perfil", { LoginData, countries })
};

module.exports = controller;
