const sql = require("mssql");
const config = require("./config");
const countrys = require("./countrys");
const PixivApi = require("pixiv-api-client");
const pixivImg = require("pixiv-img");
const log = require("log-beautify");
const fs = require("fs");

log.setColors({
  imagelog_: "yellow",
});

log.setSymbols({
  imagelog_: "🖼️ ",
});

const {
  readdirSync,
  statSync,
  writeFileSync,
  readFileSync,
  existsSync,
  mkdirSync,
  renameSync,
} = require("fs");
const dbsettings = {
  user: "taiganode",
  password: "Strelitzia123",
  server: "STRELITZIAPC",
  database: "MeikyuuDB",
  options: {
    encrypt: true, // for azure

    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

class ImageDL {
  constructor() {
    this.pixiv = new PixivApi();

    this.wait = require("util").promisify(setTimeout);
  }
}

async function getConnection() {
  try {
    const pool = await sql.connect(dbsettings);
    return pool;
  } catch (error) {
    console.log(error);
  }
}

async function initPixiv() {
  await imagedl.pixiv
    .refreshAccessToken(config.pixiv_token)
    .then(log.success("Pixiv conectado"))
    .catch((err) => {
      console.log("pixiv ");
    });
}

const imagedl = new ImageDL();

async function insertprueba(pool) {
  const autor_transaction = pool.transaction();
  await autor_transaction.begin(async (err) => {
    log.error(err);
    const request = autor_transaction.request();
  });
}
let pool;
let last_id = 0;
const init = async () => {
  pool = await getConnection();
  await initPixiv();

  //await insertprueba(pool);

  await imagedl.wait(3000);

  let do_intervals = false;

  outside: while (true) {
    log.info(
      "========= PIXIV DB FILL TOOL =========",
      "\nImage Tools",
      "\n     1. Automatico: Ilustraciones, follows y recommended",
      "\n     3. Comprobar imagenes de perfil",
      "\n     4. Comprobar imagenes de thumbnail",
      "\n     5. Comprobar paginas de imagenes",
      "\nData Tools",
      "\n     6. Generar Likes aleatorios",
      "\n         6.1. Generar likes aleatorios repetitivamente",
      "\n     7. Generar Follows aleatorios",
      "\n     8. Generar commission aleatorios",
      "\n     9. Generar LoginInfo aleatorio",
      "\n     10. Generar PostInfo aleatorio",
      "\n     11. Generar FactInfo aleatorio",
      "\n     12. Obtener 10 imagenes de un autor",
      "\n0. salir"
    );
    const prompt = require("prompt-sync")();
    const option = prompt("Ingresa opción: ");
    switch (option) {
      case "100": {
        console.log("\n Estructura json de ejemplo: no nsfw >1 pag");
        const il1 = await imagedl.pixiv.illustDetail(101756003);
        console.log(il1.illust);
        const fechadeillust =
          il1.illust.create_date.replace("T", " ").split("+")[0] + ".000";
        console.log(fechadeillust);
        //console.log(il1.illust.meta_pages);
        console.log("\n Estructura json de ejemplo: nsfw 1 pag");
        const il2 = await imagedl.pixiv.illustDetail(101757749);
        console.log(il2.illust);
        break;
      }
      case "1": {
        console.log("\nIniciando Tareas Automaticas: ");
        do_intervals = true;
        break outside;
      }
      case "3": {
        console.log("\nComprobando Imagenes de Perfil");
        await AuthorProfileUpdater(pool);
        console.log("\nFIN\n");
        break;
      }
      case "4": {
        console.log("\nComprobando Imagenes de Thumbnail");
        await IllustThumbnailUpdater(pool);
        console.log("\nFIN\n");
        break;
      }
      case "5": {
        console.log("\nComprobando Paginas de ilustracion");
        await IllustPageUpdater(pool);
        console.log("\nFIN\n");
        break;
      }
      case "6": {
        console.log("\nGenerando algunos likes");
        await LikesGenerator(pool);
        console.log("\nFIN\n");
        break;
      }
      case "6.1": {
        console.log("\nGenerando algunos likes");
        for (let index = 0; index < 5; index++) {
          await LikesGenerator(pool);
        }
        console.log("\nFIN\n");
        break;
      }
      case "7": {
        console.log("\nGenerando algunos Follows");
        console.log("\nFIN\n");
        break;
      }
      case "8": {
        console.log("\nGenerando commission info");
        await CommissionInfoGenerate(imagedl.pixiv, pool);
        console.log("\nFIN\n");
        break;
      }
      case "9": {
        console.log("\nAgregando login info");
        console.log("\nFIN\n");
        break;
      }
      case "10": {
        console.log("\nAgregando post info");
        console.log("\nFIN\n");
        break;
      }
      case "11": {
        console.log("\nAgregando factinfo");
        await FacturationInfoGenerate(pool);
        console.log("\nFIN\n");
        break;
      }
      case "12": {
        const promptaut = require("prompt-sync")();
        const author_id = promptaut("Ingresa id de autor: ");
        log.imagelog_(`\nAgregando imagenes del autor: ${author_id}`);
        try {
          const result = await imagedl.pixiv.userIllusts(author_id);
          const illusts = result.illusts;
          for (let index = 0; index < 10; index++) {
            log.info(
              `${index + 1}: `,
              illusts[index].id,
              illusts[index].title,
              illusts[index].page_count
            );
            try {
              //const image_dir = await downloadimage(illusts[i]); // desgarga las imagenes y las mueve
              await addtodatabase(illusts[index], pool, index); // agrega datos de la imagen a la bd
              await imagedl.wait(1000); // 1 segundo entre operacion de illust
            } catch (err) {
              log.error("ERROR en RECOMMENDED", err);
              log.show(err);
            }
          }
        } catch (error) {
          log.error("El id de autor esta mal.");
          log.show(error);
        }
        console.log("\nFIN\n");
        break;
      }
      default: {
        pool.close();
        break outside;
      }
    }
  }

  if (do_intervals) {
    //setInterval(initPixiv(), 30 * 60 * 1000); // 30 min
    let times_counter = 1;
    while (true) {
      log.info(`INICIANDO PASADA: ${times_counter}`);
      // await follows(imagedl.pixiv, pool);
      // await imagedl.wait(2 * 1000); // 2 secs
      // obtener imagenes
      await follows(imagedl.pixiv, pool);
      await imagedl.wait(2 * 1000); // 2 secs
      await recommended(imagedl.pixiv, pool);
      await imagedl.wait(2 * 1000); // 2 secs
      // descarga la imagen de autor y lo agrega a bd
      await AuthorProfileUpdater(pool);
      await imagedl.wait(2 * 1000); // 2 secs
      // descarga la imagen de las paginas
      await IllustPageUpdater(pool);
      await imagedl.wait(2 * 1000); // 2 secs
      // descarga la imagen de thumbnail
      await IllustThumbnailUpdater(pool);
      await imagedl.wait(2 * 1000); // 2 secs
      // genera unos views en las imagenes
      await IllustViewGenerator(pool);
      await imagedl.wait(2 * 1000); // 2 secs
      // genera likes
      await LikesGenerator(pool);
      await imagedl.wait(5 * 60 * 1000); // 5 min
      // actualiza el token para pixivapi
      await initPixiv();
      times_counter++;
    }
  }
};

init();
async function CommissionInfoGenerate(pixiv, pool) {
  // mock data de facturacion info
  let rawdata = fs.readFileSync("FactPreData.json");

  let PreFactData = JSON.parse(rawdata);

  // requiere info de illust como follow o recommended, preferencia follow, creo
  const authors_response = await pool.request().execute("spListAllAuthors");
  const result = await pixiv.illustRecommended();
  const illusts = result.illusts;

  if (illusts[0].id != last_id) {
    last_id = illusts[0].id;
    for (let i = 0; i < illusts.length; i++) {
      const requester = authors_response.recordsets[0][i];
      console.log(requester.author_id);

      if (!requester.author_id) break;

      const illust = illusts[i];
      const publish_Iso = new Date(illust.create_date);
      const comm_date = new Date();
      const payment_date = new Date();
      comm_date.setDate(publish_Iso.getDate() - 5);
      payment_date.setDate(publish_Iso.getDate() - 3);
      // deliver_Date = a la fecha de illust :: publish_ISo
      // end_date = a publish_iso
      const price =
        round_number({ number: Math.random(), decimal_places: 3 }) * 100 + 5;
      // agrega la informacion de la illust a la bd
      await addtodatabase(illusts[i], pool);
      // una vez insertado el autor gracias al anterior, se puede proceder

      const author = illusts[i].user;
      let randomInd = Math.floor(Math.random() * 100);
      let datePreString = PreFactData[randomInd].card_date.slice(
        3,
        PreFactData[randomInd].card_date.length
      );

      datePreString = datePreString.split("/20");

      log.info("Agregando prefactinfo: ", PreFactData[randomInd]);

      try {
        const addFactInfo = await pool
          .request()
          .input("card_number", PreFactData[randomInd].card_number)
          .input("card_date", `${datePreString[0]}/${datePreString[1]}`)
          .input("author_id", author.author_id)
          .input("fact_address", PreFactData[randomInd].fact_address)
          .input("fact_postal", PreFactData[randomInd].fact_postal)
          .input("fact_country", PreFactData[randomInd].fact_country)
          .execute("spFactAddTest");
        log.success(`Proc Msg: ${addFactInfo.recordset[0].Mensaje}`);
      } catch (err) {
        log.error("Error al ejecutar el procedure de factinfo: ", err);
      }
      await imagedl.wait(100);

      // --
      const fact_add = await pool
        .request()
        .input("requester_id", requester.author_id)
        .input("author_id", illust.user.id)
        .input("comm_date", comm_date)
        .input("comm_deliver_date", publish_Iso)
        .input("comm_end_date", publish_Iso)
        .input("price", price)
        .input("payment_date", payment_date)
        .input("illust_id", illust.id)
        .execute("spTempCommInfoAdd");
      log.success(
        `Comisión de: ${requester.author_id}, Hacia: ${illust.user.id}`,
        `Trajo el mensaje: ${fact_add.recordset[0].Mensaje}`
      );

      if (i == authors_response.recordsets[0].length - 1) {
        return;
      }
    }
  } else {
    console.log("No hay follows");
  }
}

function round_number(options) {
  const places = 10 ** options.decimal_places;
  const res = Math.round(options.number * places) / places;
  return res;
}

async function FacturationInfoGenerate(pool) {
  // NO VOLVER A LLAMAR SI EL FACTPREDATA:JSON NO SE HA CAMBIADO
  let rawdata = fs.readFileSync("FactPreData.json");

  let PreFactData = JSON.parse(rawdata);

  let accumula = 0;

  try {
    for (let i = 0; i < 10; i++) {
      const authors_response = await pool.request().execute("spListAllAuthors");

      for (let u = 0; u < authors_response.recordsets[0].length; u++) {
        const author = authors_response.recordsets[0][u];

        let datePreString = PreFactData[accumula].card_date.slice(
          3,
          PreFactData[accumula].card_date.length
        );

        datePreString = datePreString.split("/20");

        log.info("Agregando: ", PreFactData[accumula]);

        try {
          const addFactInfo = await pool
            .request()
            .input("card_number", PreFactData[accumula].card_number)
            .input("card_date", `${datePreString[0]}/${datePreString[1]}`)
            .input("author_id", author.author_id)
            .input("fact_address", PreFactData[accumula].fact_address)
            .input("fact_postal", PreFactData[accumula].fact_postal)
            .input("fact_country", author.country)
            .execute("spFactAddTest");
          log.success(`Proc Msg: ${addFactInfo.recordset[0].Mensaje}`);
        } catch (err) {
          log.error("Error al ejecutar el procedure: ", err);
        }
        await imagedl.wait(100);
        accumula++;
      }
    }
  } catch (err) {
    log.error("XD: ", err);
    log.info("Detenido en: ", accumula);
  }
}
async function LikesGenerator(pool) {
  const authors_response = await pool.request().execute("spListAllAuthors");
  const illusts_response = await pool.request().execute("spListarIllust");
  for (let index = 0; index < authors_response.recordsets[0].length; index++) {
    const author = authors_response.recordsets[0][index];
    const illust = illusts_response.recordsets[0][index];

    const add_favorite = await pool
      .request()
      .input("user_id", author.author_id)
      .input("illust_id", illust.id)
      .execute("spAddIllustToAFavorites");
    log.success(
      `${author.author_id} Liked: ${illust.id} MSG: ${add_favorite.recordset[0].Mensaje}`
    );
    await imagedl.wait(100);
  }
}
// similar a recommended solo que en base los follows
async function follows(pixiv, pool) {
  console.log("\nComprobando Follows");
  const result = await pixiv.illustFollow();
  const illusts = result.illusts;
  if (illusts[0].id != last_id) {
    last_id = illusts[0].id;
    for (let i = 0; i < 28; i++) {
      console.log(
        `${i + 1}: `,
        illusts[i].id,
        illusts[i].title,
        illusts[i].page_count
      );
      try {
        //const image_dir = await downloadimage(illusts[i]); // desgarga las imagenes y las mueve
        await addtodatabase(illusts[i], pool); // agrega datos de la imagen a la bd
        await imagedl.wait(1000);
      } catch (err) {
        console.log("ERROR en FOLLOWS", err);
      }
    }
  } else {
    console.log("No hay follows");
  }
}

async function recommended(pixiv, pool) {
  console.log("Comprobando Recommended");
  const result = await pixiv.illustRecommended();
  const illusts = result.illusts;
  for (let i = 0; i < 10; i++) {
    console.log(
      `${i + 1}: `,
      illusts[i].id,
      illusts[i].title,
      illusts[i].page_count
    );
    try {
      //const image_dir = await downloadimage(illusts[i]); // desgarga las imagenes y las mueve
      await addtodatabase(illusts[i], pool); // agrega datos de la imagen a la bd
      await imagedl.wait(1000); // 1 segundo entre operacion de illust
    } catch (err) {
      log.error("ERROR en RECOMMENDED", err);
    }
  }
}

async function IllustViewGenerator(pool) {
  const page_views_responses = await pool
    .request()
    .execute("spAuthorViewPagesUpdate");
  await imagedl.wait(300);
  if (page_views_responses.recordsets[0].length > 0) {
    const illust_responses = await pool.request().execute("spListarIllust");

    function getMultipleRandom(arr, num) {
      const shuffled = [...arr].sort(() => 0.5 - Math.random());

      return shuffled.slice(0, num);
    }
    for (const illust of getMultipleRandom(
      illust_responses.recordsets[0],
      10
    )) {
      log.info("Agregando views a:", illust.id, illust.title);
      const update_illust = await pool
        .request()
        .input("illust_id", illust.id)
        .execute("spSumarViewIllust");
      log.success(illust.id, update_illust.recordset[0].Mensaje);
      await imagedl.wait(500);
    }
  }
}

async function IllustThumbnailUpdater(pool) {
  const thumb_responses = await pool
    .request()
    .execute("spListarIllustSinThumnail");
  await imagedl.wait(500);
  if (thumb_responses.recordsets[0].length > 0) {
    for (const thumbs of thumb_responses.recordsets[0]) {
      //console.log(thumbs);
      const thumbDirectory = await downloadThumb(
        thumbs.thumb_link,
        thumbs.publish_date.toISOString().slice(0, 10)
      );
      const update_result = await pool
        .request()
        .input("illust_id", thumbs.id)
        .input("thumb_dir", thumbDirectory)
        .execute("spActualizarArchivoDeThumbnailIllust");
      log.imagelog_(thumbs.id, update_result.recordset[0].Mensaje);
    }
  }
}
async function IllustPageUpdater(pool) {
  const illust_responses = await pool
    .request()
    .execute("spListarPaginaIllustSinArchivo");
  await imagedl.wait(500);
  if (illust_responses.recordsets[0].length > 0) {
    for (const illust of illust_responses.recordsets[0]) {
      //console.log(illust);
      const pageDirectory = await downloadimage(
        illust.large_link,
        illust.publish_date.toISOString().slice(0, 10)
      );
      const update_result = await pool
        .request()
        .input("illust_id", illust.parent_illust)
        .input("large_dir", pageDirectory)
        .input("page_id", illust.page_id)
        .execute("spActualizarArchivoDePaginaIllust");
      log.imagelog_(
        illust.parent_illust,
        update_result.recordset[0].Mensaje,
        illust.page_id
      );
    }
  }
}

async function createFolder(create_date, image_file) {
  let year;
  let month;
  let day;
  if (create_date) {
    const findate = create_date.split("T");
    const datefin = findate[0];
    const dateparams = datefin.split("-");
    year = dateparams[0];
    month = dateparams[1];
    day = dateparams[2];
  } else {
    const date = new Date();
    year = date.getFullYear();
    month = date.getMonth() + 1;
    day = date.getDate();
  }

  if (!existsSync(`./img/${year}/${month}/${day}`)) {
    try {
      mkdirSync(`./img/${year}`);
    } catch {
      log.warning("   Folder de anio existe");
    }
    try {
      mkdirSync(`./img/${year}/${month}`);
    } catch {
      log.warning("   Folder de mes existe");
    }
    try {
      mkdirSync(`./img/${year}/${month}/${day}`);
    } catch {
      log.warning("   Folder de dia existe");
    }
    try {
      mkdirSync(`./img/${year}/${month}/${day}/square`);
      mkdirSync(`./img/${year}/${month}/${day}/original`);
      mkdirSync(`./img/${year}/${month}/${day}/large`);
    } catch {
      log.warning("   Folder de imagenes existen");
    }
  }

  await renameSync(
    `./${image_file}`,
    `./img/${year}/${month}/${day}/large/${image_file}`,
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );

  return `./img/${year}/${month}/${day}/large/${image_file}`;
}
async function downloadThumb(url, create_date) {
  let thumb_file = await pixivImg(url);
  const findate = create_date.split("T");
  const datefin = findate[0];
  const dateparams = datefin.split("-");
  year = dateparams[0];
  month = dateparams[1];
  day = dateparams[2];
  await renameSync(
    `./${thumb_file}`,
    `./img/${year}/${month}/${day}/square/${thumb_file}`,
    function (err) {
      if (err) {
        console.log(err);
      }
    }
  );
  return `./img/${year}/${month}/${day}/square/${thumb_file}`;
}
async function downloadimage(large, create_date) {
  let imageFile = await pixivImg(large);
  // let thumbFile = await pixivImg(illust.image_urls.square_medium);
  return await createFolder(create_date, imageFile);
}

async function AuthorProfileUpdater(pool) {
  const autor_response = await pool
    .request()
    .execute("spListarArtistasSinImagenDePerfil");
  await imagedl.wait(500);
  if (autor_response.recordsets[0].length > 0) {
    for (const record of autor_response.recordsets[0]) {
      const profileDirectory = await profile(record.profile_pic_link);
      //console.log(record);
      const update_result = await pool
        .request()
        .input("author_id", record.author_id)
        .input("profile_pic_dir", profileDirectory)
        .execute("spActualizarArchivoDePerfilArtista");
      log.success(record.author_id, update_result.recordset[0].Mensaje);
    }
  }
}

async function profile(url) {
  // descarga la imagen de perfil del artista y la mueve a la carpeta
  let profileFile = await pixivImg(url);
  try {
    await renameSync(
      `./${profileFile}`,
      `./img/users/profile/${profileFile}`,
      function (err) {
        if (err) {
          console.log(err);
        }
      }
    );
  } catch {
    console.log("el arhcivo de perfil ya existia");
  }

  return `./img/users/profile/${profileFile}`;
}

async function addtodatabase(illust, pool, author_added = 0) {
  /* 
    primero se agrega el autor
    se generan datos del autor

    se ingresa la illust
    se ingresa la primera imagen descargada
      se ingresa las paginas

    se ingresan los tags
      se correlaciona la illust con los tags

  */
  const dates = getDates(new Date(2000, 01, 22), new Date(2000, 07, 25));

  const autor = illust.user;
  //#region AGREGANDO AUTOR
  if (author_added == 0) {
    const response_autor = await pool
      .request()
      .input("author_id", autor.id)
      .input("nickname", sql.NVarChar, autor.name)
      .input("accountname", `mpx@${autor.account}`)
      .input("email", `${autor.account}@email.com`)
      .input("pass", autor.id) // el id entra como pass
      .input("birthdate", dates.sort(() => 0.5 - Math.random())[0])
      .input("country", countrys.sort(() => 0.5 - Math.random())[0])
      .input("profile_pic_link", autor.profile_image_urls.medium)
      .execute("spAgregarAutor");
    log.info(`${autor.id} - ${response_autor.recordset[0].Mensaje}`);
    await imagedl.wait(200);
  }
  //#endregion

  //#region AGREGANDO ILLUST
  const fechadeillust =
    illust.create_date.replace("T", " ").split("+")[0] + ".000";
  const response_illust = await pool
    .request()
    .input("id", illust.id)
    .input("title", sql.NVarChar, illust.title)
    .input("author_id", autor.id)
    .input("illust_type", illust.type)
    .input("is_nsfw", illust.tags[0].name == "R-18" ? 1 : 0)
    .input("thumb_link", illust.image_urls.square_medium)
    .input("publish_date", fechadeillust)
    .execute("spAgregarIlustracion");
  log.info(
    `${illust.id} - CE: ${response_illust.recordset[0].CodError}, ${response_illust.recordset[0].Mensaje}`
  );
  //#endregion
  await imagedl.wait(200);
  if (response_illust.recordset[0].CodError == 2) {
  }
  //#region AGREGANDO INFO DE PAGINAS
  if (illust.page_count == 1) {
    const response_page = await pool.request();
    response_page.input("parent_illust", illust.id);
    response_page.input("large_link", illust.image_urls.large);
    await response_page.execute("spAgregarPaginas", (err, result) => {
      //if (result.recordsets) console.log(result.recordsets[0]);
    });
  } else {
    for (let i = 0; i < illust.page_count; i++) {
      // las imagenes se descargarán luego
      let large_link;

      if (illust.page_count > 1) {
        large_link = illust.meta_pages[i].image_urls.large;
      } else {
        large_link = illust.image_urls.large;
      }
      const response_page = await pool
        .request()
        .input("parent_illust", illust.id)
        .input("large_link", large_link)
        .execute("spAgregarPaginas");
      log.info(
        `${illust.id} - CE: ${response_page.recordset[0].CodError}, ${response_page.recordset[0].Mensaje}`
      );
      await imagedl.wait(500);
    }
  }

  //#endregion
  await imagedl.wait(200);
  //#region AGREGANDO ETIQUETAS
  const tags = illust.tags;
  for (let i = 0; i < tags.length; i++) {
    const response_tag = await pool.request();
    response_tag.input("tag_name", sql.NVarChar, tags[i].name);
    if (tags[i].translated_name == null) {
      response_tag.input("tag_translate", "");
    } else {
      response_tag.input("tag_translate", tags[i].translated_name);
    }
    await response_tag.execute("spAgregarEtiquetas", (err, result) => {
      //if (result.recordsets) console.log(result.recordsets[0]);
    });
    await imagedl.wait(500);
    const response_tagIllust = await pool
      .request()
      .input("tag_name", sql.NVarChar, tags[i].name)
      .input("illust_id", illust.id)
      .execute("spAgregarEtiquetasArtwork");
    log.info(
      `${illust.id} - CE: ${response_tagIllust.recordset[0].CodError}, ${response_tagIllust.recordset[0].Mensaje}`
    );
  }
  //#endregion
}

function getDates(startDate, endDate) {
  const dates = [];
  let currentDate = startDate;
  const addDays = function (days) {
    const date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  while (currentDate <= endDate) {
    dates.push(currentDate);
    currentDate = addDays.call(currentDate, 1);
  }
  return dates;
}
process.on("uncaughtException", (err) => {
  const errorMsg = err.stack.replace(new RegExp(`${__dirname}/`, "g"), "./");
  console.error("Uncaught Exception: ", errorMsg);
  pool.close();
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Uncaught Promise Error: ", err);
});

process.on("SIGINT", function () {
  pool.close();
  process.exit();
});
