const Formatter = require("./formatter");
const axios = require("axios");
const Parser = require("./parser");
const https = require("https");

const ApiClient = axios.create({
  timeout: 60000,
  httpsAgent: new https.Agent({ keepAlive: true }),
});

const someeWS = `https://localhost:44325/wsMyPix.asmx?WSDL`;
// const someeWS = `http://www.dais-w-02.somee.com/wsAuthor.asmx?WSDL`;

// SSL sign certificated
// comentar para some, sin comentar para local
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const remoteWS = {};

function methodParser(funcName, parsedRes) {
  const data =
    parsedRes["soap:Body"][`${funcName}Response`][
      `${funcName}Result`
    ]["diffgr:diffgram"].DocumentElement.Table;
  return data;
}

remoteWS.TheOnlyMethodUNeed = async (payload, functionName) => {
  const headers = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `http://tempuri.org/${functionName}`,
    },
  };
  try {
    let args = Formatter.convertJsonToSoapRequest(payload);
    let res = await ApiClient.post(someeWS, args, headers);
    const parsedRes = await Parser.convertXMLToJSON(res.data);
    const resData = methodParser(functionName, parsedRes);
    return resData;
  } catch (err) {
    console.log("Error llamando el metodo: ", functionName, ", en remoteWS", err.message);
    return null;
  }
}

function methodBoolParser(funcName, parsedRes) {
  const data =
    parsedRes["soap:Body"][`${funcName}Response`][`${funcName}Result`]
  return data;
}

remoteWS.GetBoolean = async (payload, functionName) => {
  // se llama getboolean pero sirve para traer un unico valor de los metodos
  const headers = {
    headers: {
      "Content-Type": "text/xml; charset=utf-8",
      SOAPAction: `http://tempuri.org/${functionName}`,
    },
  };
  try {
    let args = Formatter.convertJsonToSoapRequest(payload);
    let res = await ApiClient.post(someeWS, args, headers);
    const parsedRes = await Parser.convertXMLToJSON(res.data);
    const resData = methodBoolParser(functionName, parsedRes);
    return resData;
  } catch (err) {
    console.log("Error llamando el metodo: ", functionName, ", en remoteWS", err);
    return null;
  }
}

module.exports = remoteWS;