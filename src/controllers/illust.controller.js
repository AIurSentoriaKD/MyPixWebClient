const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.getOneIllust = async (req, res, next) => {
  const id = req.params.id;
  const LoginData = req.session.LoginSessionInfo;
  let payload = {
    GetIllust: {
      illust_id: id,
    },
  };
  const illust_data = await Remote1.TheOnlyMethodUNeed(payload, "GetIllust");
  payload = {
    GetIllustPages: {
      illust_id: id,
    },
  };
  const illust_pages = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetIllustPages"
  );
  payload = {
    GetIllustsTags: {
      illust_id: id,
    },
  };
  const illust_tags = await Remote1.TheOnlyMethodUNeed(
    payload,
    "GetIllustsTags"
  );

  payload = { SingleAuthor: { codAuthor: illust_data.author_id, }, };

  const AuthorData = await Remote1.TheOnlyMethodUNeed(payload, "SingleAuthor");

  payload = {
    GetCommentsFrom: {
      origin_id: illust_data.id,
      type_require: 'ILLUST'
    },
  };
  const illust_comments = await Remote1.TheOnlyMethodUNeed(payload, "GetCommentsFrom");

  const data = { AuthorData, illust_data, illust_pages, illust_tags, illust_comments };
  // illust_data.then((oneIllust) => {
  //   res.render("illust", {LoginData, oneIllust,})
  // })

  // illust_pages.then(())

  res.render("illust", { data, LoginData });
};

//#region Submit Illust
controller.addIllust = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;

  res.render("submit/addIllust", { LoginData });
};


//#endregion

module.exports = controller;
