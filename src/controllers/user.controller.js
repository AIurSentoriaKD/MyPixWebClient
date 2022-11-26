const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.User = async (req, res) => {
  const id = req.params.id_user;
  const LoginData = req.session.LoginSessionInfo;

  let payload = { SingleAuthor: { codAuthor: id, }, };

  const AuthorData = await Remote1.TheOnlyMethodUNeed(payload, "SingleAuthor");

  let match = false;

  if (AuthorData.author_id == LoginData.author_id) match = true;

  payload = {
    IsCommissionActive: {
      author_id: AuthorData.author_id,
    },
  };
  const isActive_response = await Remote1.GetBoolean(payload, "IsCommissionActive");

  let comm_bool = isActive_response === "true" ? true : false;
  
  let req_bool = AuthorData.request_open == 1 ? true : false;
  
  console.log(typeof isActive_response);
  
  console.log(comm_bool);

  console.log(req_bool);


  

  payload = {
    GetAlbumList: {
      coduser: AuthorData.author_id,
      usertype: match == true ? "USER" : "AUTHOR",
    },
  };

  let albums_info = await Remote1.TheOnlyMethodUNeed(payload, "GetAlbumList");
  let single_album = false;
  let album_illusts = [];
  try {
    if (albums_info.author_id) single_album = true;
    else single_album = false;
    let length = 1;
    if (!single_album) {
      length = albums_info.length;
    }
    for (let i = 0; i < length; i++) {
      payload = {
        GetAlbumIllustInfo: {
          codalbum: albums_info[0].album_id,
        }
      };
      let illusts = await Remote1.TheOnlyMethodUNeed(payload, "GetAlbumIllustInfo");
      album_illusts.push(illusts);
    }

  } catch (error) {
    console.log(error.message);
  }
  const bool_info = { match, comm_bool, req_bool, single_album };

  res.render("user", { LoginData, AuthorData, bool_info, albums_info, album_illusts, });
};

module.exports = controller;
