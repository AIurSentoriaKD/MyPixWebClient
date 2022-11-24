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
    if (illusts.length > 15) {
      illusts = illusts.slice(0, 15);
    }
    if (globalranking) {
      if (globalranking.length > 5) {
        globalranking = globalranking.slice(0, 5);
      }
    }
    if (rec_artists.length > 10) {
      rec_artists = rec_artists.slice(0, 10);
    }
    res.render("index", { illusts, LoginData, globalranking, rec_artists });
  } catch (error) {
    console.log("Error en ruta: listFollowingIllust ::", error.message);
    res.redirect("/");
  }
};

controller.commission = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;

  res.render("commission", { LoginData });
};

controller.request = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  res.render("request", { LoginData });
};

module.exports = controller;
