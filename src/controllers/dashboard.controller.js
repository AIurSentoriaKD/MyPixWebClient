const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};

controller.listFollowingIllust = async (req, res) => {
  try {
    const LoginData = req.session.LoginSessionInfo;

    let payload = {
      DashboardFollowsIllust: {
        codUser: LoginData.author_id,
      },
    };

    let illusts = await Remote1.TheOnlyMethodUNeed(
      payload,
      "DashboardFollowsIllust"
    );
    
    payload = {
      DashboardRankings: {},
    };
    let globalranking = await Remote1.TheOnlyMethodUNeed(
      payload,
      "DashboardRankings"
    );
    payload = {
      DashboardRecommendedArtists: {
        codUser: LoginData.author_id,
      },
    };
    let rec_artists = await Remote1.TheOnlyMethodUNeed(
      payload,
      "DashboardRecommendedArtists"
    );

    payload = {
      DashboardRecommendedIllusts: {
        codUser: LoginData.author_id,
      },
    };
    let rec_illusts = await Remote1.TheOnlyMethodUNeed(
      payload,
      "DashboardRecommendedIllusts"
    );

    payload = {
      DashboardFollowingPosts: {
        codUser: LoginData.author_id,
      },
    };
    let following_posts = await Remote1.TheOnlyMethodUNeed(
      payload,
      "DashboardFollowingPosts"
    );

    if (illusts.length > 18) {
      illusts = illusts.slice(0, 18);
    }
    if (globalranking) {
      if (globalranking.length > 5) {
        globalranking = globalranking.slice(0, 5);
      }
    }
    if (rec_artists.length > 10) {
      rec_artists = rec_artists.slice(0, 10);
    }
    if (rec_illusts.length > 10) {
      rec_illusts = rec_illusts.slice(0, 10);
    }
    if (following_posts.length > 5) {
      following_posts = rec_illusts.slice(0, 10);
    }

    res.render("index", {
      illusts,
      LoginData,
      globalranking,
      rec_artists,
      rec_illusts,
      following_posts,
    });
  } catch (error) {
    console.log("Error en ruta: listFollowingIllust ::", error.message);
    res.redirect("/");
  }
};

controller.commission = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  let payload = {
    CommissionDashboardIllustsList: {},
  };
  let C_Illust = await Remote1.TheOnlyMethodUNeed(
    payload,
    "CommissionDashboardIllustsList"
  );
  payload = {
    CommissionDashboardArtistsList: {},
  };
  let C_Author_L = await Remote1.TheOnlyMethodUNeed(
    payload,
    "CommissionDashboardArtistsList"
  );
  payload = {
    CommissionDashboardFollowingRecents: {
      codUser: LoginData.author_id,
    },
  };
  let C_Illust_F = await Remote1.TheOnlyMethodUNeed(
    payload,
    "CommissionDashboardFollowingRecents"
  );
  payload = {
    CommissionDashboardFollowingList: {
      codUser: LoginData.author_id,
    },
  };
  let C_Author_Fol = await Remote1.TheOnlyMethodUNeed(
    payload,
    "CommissionDashboardFollowingList"
  );

  if (C_Illust.length > 10) {
    C_Illust = C_Illust.slice(0, 10);
  }
  if (C_Author_L.length > 6) {
    C_Author_L = C_Author_L.slice(0, 6);
  }
  try {
    if (C_Illust_F.length > 10) {
      C_Illust_F = C_Illust_F.slice(0, 10);
    }
  } catch (err) {
    console.log("Error con C_Illust_F: ", err.message);
    C_Illust_F = null;
  }
  try {
    if (C_Author_Fol.length > 10) {
      C_Author_Fol = C_Author_Fol.slice(0, 10);
    }
  } catch (error) {
    console.log("Error con C_Author_Fol: ", error.message);
    C_Author_Fol = null;
  }
  const CommData = {
    C_Illust,
    C_Author_L,
    C_Illust_F,
    C_Author_Fol,
  };
  res.render("commission", { LoginData, CommData });
};

controller.request = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  res.render("request", { LoginData });
};

module.exports = controller;
