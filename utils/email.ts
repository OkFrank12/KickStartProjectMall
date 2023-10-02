import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { envVariables } from "../config/envVariables";
import { google } from "googleapis";

const baseUrl: string = "http://localhost:5000";

const ID: string = envVariables.G_ID!;
const URL: string = envVariables.G_URL!;
const SECRET: string = envVariables.G_SECRET!;
const REFRESH: string = envVariables.G_REFRESH!;

const oAuth = new google.auth.OAuth2(ID, SECRET, URL);
oAuth.setCredentials({ access_token: REFRESH });

export const sendAccountOpeningMail = async (account: any, tokenID: string) => {
  try {
    const accessToken: any = (await oAuth.getAccessToken()).token;

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "cfoonyemmemme@gmail.com",
        clientId: ID,
        clientSecret: SECRET,
        refreshToken: REFRESH,
        accessToken,
      },
    });

    const passedData = {
      userName: account.userName,
      url: `${baseUrl}/api/${tokenID}/verify-account`,
    };

    const locateFile = path.join(__dirname, "../views/accountMail.ejs");
    const readData = await ejs.renderFile(locateFile, passedData);

    const mailer = {
      from: "Verify Mail <cfoonyemmemme@gmail.com>",
      to: account.email,
      subject: "Verification Mail",
      html: readData,
    };

    transport.sendMail(mailer);
  } catch (error) {
    console.log(error);
  }
};

export const sendResetAccountPasswordMail = async (
  account: any,
  tokenID: string
) => {
  try {
    const accessToken: any = (await oAuth.getAccessToken()).token;
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "cfoonyemmemme@gmail.com",
        clientId: ID,
        clientSecret: SECRET,
        refreshToken: REFRESH,
        accessToken,
      },
    });

    const passedData = {
      url: `${baseUrl}/api/${tokenID}/reset-account-password`,
    };

    const locateFile = path.join(__dirname, "../views/resetMail.ejs");
    const readData = await ejs.renderFile(locateFile, passedData);

    const mailer = {
      from: "Reset Mail <cfoonyemmemme@gmail.com>",
      to: account.email,
      subject: "Reset Password",
      html: readData,
    };

    transport.sendMail(mailer);
  } catch (error) {
    console.log(error);
  }
};
