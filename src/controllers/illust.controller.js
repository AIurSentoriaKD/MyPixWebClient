const Remote1 = require("../../helpers/soapConsumer/remoteWS");
const controller = {};
const {
  existsSync,
  mkdirSync,
  renameSync,
} = require("fs");
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

//#region new Illust
controller.addIllust = async (req, res) => {
  const LoginData = req.session.LoginSessionInfo;
  let payload = {
    AcceptedRequestsList: {
      codUser: LoginData.author_id,
    }
  }
  const requests = await Remote1.TheOnlyMethodUNeed(payload, "AcceptedRequestsList");
  payload = {
    AcceptedCommissionsList: {
      codUser: LoginData.author_id,
    }
  }
  const commissions = await Remote1.TheOnlyMethodUNeed(payload, "AcceptedCommission");
  res.render("submit/addIllust", { LoginData, requests, commissions });
};

controller.submitIllust = async (req, res) => {
  if (!req.files) {
    res.send({
      status: false,
      message: 'no files were uploaded'
    });
  } else {
    let pages = req.files.multi_files;
    let image_dir;
    if (pages.name) {
      await pages.mv('./' + pages.name);
      image_dir = await createThumb(pages);
    } else {
      for (let i = 0; i < pages.length; i++) {
        const element = pages[i];
        await element.mv('./' + element.name);
      }
      image_dir = await createThumb(pages[0]);
    }

    const title = req.body.illust_title;
    const description = req.body.illust_desc;
    let etiquetas = req.body.etiquetas;
    etiquetas = etiquetas.split("==");
    etiquetas.shift();
    const is_nsfw = req.body.is_nsfw;
    const ai_dataset = req.body.ai_dataset;
    const printable = req.body.printable;
    const beeg_file = req.body.beeg_file;
    const peticion = req.body.peticion;

    if (peticion == "req") {
      const peticion_id = req.body.peticion_id;
    } else {
      let payload = {
        NewIllustPublish: {
          id: pages.name.split('_')[0],
          title: title,
          sanity: 0,
          author: req.session.LoginSessionInfo.author_id,
          il_type: 'ILLUST',
          is_nsfw: 0,
          thumb_dir: image_dir[1],
          ugoira_dir: 'NULL'
        }
      };
      const newPublish = await Remote1.GetBoolean(payload, "NewIllustPublish");
      // etiquetas PONER SIEMPRE MAS DE 1
      for (let i = 0; i < etiquetas.length; i++) {
        let payload = {
          AttachTagNewIllust: {
            tag_name: etiquetas[i],
            illust_id: pages.name.split('_')[0]
          }
        }
        const newTag = await Remote1.GetBoolean(payload, "AttachTagNewIllust");
      }
      // paginas, siempre 1
      payload = {
        AttachPageNewIllust: {
          parent: pages.name.split('_')[0],
          page_num: 1,
          large_dir: image_dir[0]
        }
      }
      const newPage = await Remote1.GetBoolean(payload, "AttachPageNewIllust");
    }
    res.redirect("/DashBoard");
  }
};

async function createThumb(page) {
  const sharp = require('sharp');
  const { promisify } = require('util')
  const sizeOf = promisify(require('image-size'))
  // creando la thumbnail
  let large_image = './' + page.name;
  let thumbnail = './square_' + page.name;

  const dimensions = await sizeOf(large_image);
  console.log(dimensions.height, dimensions.width);
  let width;
  if (dimensions.height > dimensions.width)
    width = dimensions.width
  else width = dimensions.height;
  await sharp(large_image).resize({ width: 540, height: 540 }).toFile(thumbnail)
    .then(function (new_file_info) {
      console.log("Image cropped and saved");
    })
    .catch(function (err) {
      console.log("An error occured");
      console.log(err);
    });

  // creando el directorio de hoy para la imagen
  let year;
  let month;
  let day;
  const date = new Date();
  year = date.getFullYear();
  month = date.getMonth() + 1;
  day = date.getDate();
  console.log(year, month, day);
  if (!existsSync(`./src/public/images/img/${year}/${month}/${day}`)) {
    try {
      mkdirSync(`./src/public/images/img/${year}`);
    } catch (error) {
      console.log("   Folder de anio existe");
      // console.log(error)
    }
    try {
      mkdirSync(`./src/public/images/img/${year}/${month}`);
    } catch (error) {
      console.log("   Folder de mes existe");
      // console.log(error)
    }
    try {
      mkdirSync(`./src/public/images/img/${year}/${month}/${day}`);
    } catch (error) {
      console.log("   Folder de dia existe");
      // console.log(error)
    }
    try {
      mkdirSync(`./src/public/images/img/${year}/${month}/${day}/square`);
      mkdirSync(`./src/public/images/img/${year}/${month}/${day}/original`);
      mkdirSync(`./src/public/images/img/${year}/${month}/${day}/large`);
    } catch (error) {
      console.log("   Folder de imagenes existen");
      // console.log(error)
    }
  }
  renameSync(`./${page.name}`,
    `./src/public/images/img/${year}/${month}/${day}/large/${page.name}`);
  renameSync(thumbnail,
    `./src/public/images/img/${year}/${month}/${day}/square/square_${page.name}`);
  return [`./img/${year}/${month}/${day}/large/${page.name}`, `./img/${year}/${month}/${day}/square/square_${page.name}`];
}
//#endregion

module.exports = controller;
