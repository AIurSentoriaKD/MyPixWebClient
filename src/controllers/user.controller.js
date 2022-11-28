const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.User = async (req, res) => {
  const id = req.params.id_user;
  const LoginData = req.session.LoginSessionInfo;
  if (LoginData) {

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

    payload = {
      GetAlbumList: {
        coduser: AuthorData.author_id,
        usertype: match == true ? "USER" : "AUTHOR",
      },
    };

    let albums_info = await Remote1.TheOnlyMethodUNeed(payload, "GetAlbumList");
    //console.log(albums_info)
    let single_album = false;
    let album_illusts = [];
    let has_illusts = [];

    try {
      if (albums_info.owner_id) {
        single_album = true;
        albums_info.thumb = albums_info.thumb.slice(1,albums_info.thumb.length);
      } else {
        single_album = false;
        for (let i = 0; i < illusts.length; i++) {
          illusts[i].thumb = illusts[i].thumb.slice(1, illusts[i].thumb.length);
        }
      }
      console.log("Un solo album: ", single_album);
      if (single_album) {
        if (albums_info.il_count > 0) has_illusts.push(true);
        else has_illusts.push(false);

        payload = {
          GetAlbumIllustInfo: {
            codalbum: albums_info.album_id,
          }
        };

        let illusts = await Remote1.TheOnlyMethodUNeed(payload, "GetAlbumIllustInfo");

        // editar la cadena del thumbnail
        album_illusts = illusts;
      } else {
        for (let i = 0; i < albums_info.length; i++) {
          if (albums_info[i].il_count > 0) has_illusts.push(true);
          else has_illusts.push(false)
        }
        for (let i = 0; i < albums_info.length; i++) {
          payload = {
            GetAlbumIllustInfo: {
              codalbum: albums_info[0].album_id,
            }
          };

          let illusts = await Remote1.TheOnlyMethodUNeed(payload, "GetAlbumIllustInfo");

          // editar la cadena de los thumbnail
          
          album_illusts.push(illusts);
        }
      }
      console.log("Albumes tienen illusts?: ", has_illusts);
    } catch (error) {
      console.log("Error del album: ", error);
    }


    payload = {
      GetUserIllusts: {
        author_id: AuthorData.author_id,
      }
    }

    const AuthorIllusts = await Remote1.TheOnlyMethodUNeed(payload, "GetUserIllusts");
    let has_only_one_il = false;
    if (AuthorIllusts) {
      if (AuthorIllusts.id)
        has_only_one_il = true;
    }

    if (has_only_one_il) {
      AuthorIllusts.thumb_dir = AuthorIllusts.thumb_dir.slice(1, AuthorIllusts.thumb_dir.length);
    } else {
      if (AuthorIllusts) {
        for (let i = 0; i < AuthorIllusts.length; i++) {
          AuthorIllusts[i].thumb_dir = AuthorIllusts[i].thumb_dir.slice(1, AuthorIllusts[i].thumb_dir.length);
        }
      }
    }

    const bool_info = { match, comm_bool, req_bool, single_album, has_only_one_il };
    console.log(album_illusts);
    res.render("user", { LoginData, AuthorData, AuthorIllusts, bool_info, albums_info, album_illusts, has_illusts });
  } else {
    console.log("Error, venció la sesión");
    res.redirect("/");
  }
};

module.exports = controller;
