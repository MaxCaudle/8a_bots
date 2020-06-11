const admin = require("firebase-admin");
const slack = require("./slack");
const axios = require("axios");

admin.initializeApp();

// TOGGLE FOR LOCAL ACCESS TO PROD FIREBASE DB
// const serviceAccount = require('../service-account.json');
// const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
// adminConfig.credential = admin.credential.cert(serviceAccount);
// admin.initializeApp(adminConfig);

const db = admin.database();

////////////////////////
// helpers
////////////////////////
const getCurrentYear = () => {return new Date().getFullYear()};
const dbSportRef = (userName, year) => {return `users/${userName}/${year}`}; 
const dbBoulderRef = (userName, year) => {return `users/${userName}/boulders/${year}`}; 

const liveSportCounter = async (userName) => {
    const url = `https://www.8a.nu/api/users/${userName}/ascents/years?categoryFilter=sportclimbing`;
    const ascentYears = await axios.get(url).then((response) => response.data);
    // 8a does nto return a year with 0 sends
    const latestYear = ascentYears["years"][0]
    if (latestYear["year"] !== getCurrentYear()) {
        return 0
    }
    const latestAscentCount = latestYear["totalAscents"] || 0
    return latestAscentCount
}

const liveBoulderCounter = async(userName) => {
    const url = `https://www.8a.nu/api/users/${userName}/ascents/years?categoryFilter=bouldering`;
    const ascentYears = await axios.get(url).then((response) => response.data);
    // 8a does nto return a year with 0 sends
    const latestYear = ascentYears["years"][0]
    if (latestYear["year"] !== getCurrentYear()) {
        return 0
    }
    const latestAscentCount = latestYear["totalAscents"] || 0
    return latestAscentCount
}

////////////////////////
// Check for sends
////////////////////////

// TODO: add bouldering checks

const checkAllUsers = async (req, res) => {
    const currentYear = getCurrentYear()
    const users = (
        await db.ref("users").once("value")
      ).val()
    Object.keys(users).forEach(async (user) => {
        var currentSportSends = users[user][currentYear]
        var currentBoulderSends = users[user]["boulders"][currentYear]
        await postSportSends(user, currentSportSends, currentYear)
        await postBoulderSends(user, currentBoulderSends, currentYear)
    })
    if (res !== null) {
        return res.end();
    } else {
        return null;
    }
}

const makeSendMessage = (sendData) => {
    const msg = `User: ${sendData.userName}
Route: ${sendData.zlaggableName}
Crag: ${sendData.cragName}
Area: ${sendData.areaName}
Difficulty: ${sendData.difficulty}
Comment: ${sendData.comment}`
    return msg
}

const postSportSends = async (userName, dbSendCount, year) => {
    const liveSportCount = await liveSportCounter(userName);
    // < makes this safe for users that havent sent for current year
    if (dbSendCount < liveSportCount ) {
        var latestAscents = await axios
        .get(
            `https://www.8a.nu/api/users/${userName}/ascents?categoryFilter=sportclimbing&sortfield=date_desc`
        )
        .then((response) => response.data);
        latestAscents = latestAscents["ascents"];
        const newSends = latestAscents.slice(0,liveSportCount - dbSendCount) || [];
        newSends.forEach(async (sendData) => {
            msg = makeSendMessage(sendData)
            await slack.sends({
                text:
                  `${msg}`,
              });
        });
        await db.ref(dbSportRef(userName, year)).set(liveSportCount)
      }
};

const postBoulderSends = async (userName, dbSendCount, year) => {
    const liveBoulderCount = await liveBoulderCounter(userName);
    
    // < makes this safe for users that havent sent for current year
    if (dbSendCount < liveBoulderCount) {
        var latestAscents = await axios
        .get(
            `https://www.8a.nu/api/users/${userName}/ascents?category=bouldering&pageSize=10&sortfield=date_desc&timeFilter=12`
        )
        .then((response) => response.data);
        latestAscents = latestAscents["ascents"];
        const newSends = latestAscents.slice(0,liveSportCount - dbSendCount) || [];
        newSends.forEach(async (sendData) => {
            msg = makeSendMessage(sendData)
            await slack.sends({
                text:
                  `${msg}`,
              });
        });
        await db.ref(dbBoulderRef(userName, year)).set(liveSportCount)
      }
}

////////////////////////
// interact with jens
////////////////////////

const slashCommand = async (req, res) => {
    console.log("slash command started");
    const params = req.body.text || "";
    if (params.toLowerCase().includes("add")) {
        addUser(req, res);
    } else if (params.toLowerCase().includes("list")) {
        getUserList(req, res);
    } else if (params.toLowerCase().includes("check")) {
        checkAllUsers(req, res);
    } else {
        res.send(`I can't do that yet`);
    }
}

const addUser = async (req, res) => {
    const params = req.body.text || "";
    const userName = params.split(" ")[1];
    const currentYear = getCurrentYear();

    currentUser = await (await db.ref(dbSportRef(userName, currentYear)).once("value")).val();
    if (currentUser === null) {
        var SportAscents = await liveSportCounter(userName);
        var BoulderAscents = await liveBoulderCounter(userName);
        await db.ref(dbSportRef(userName, currentYear)).set(SportAscents);
        await db.ref(dbBoulderRef(userName, currentYear)).set(BoulderAscents);
        await slack.sends({text: `${userName} was added to the notification list`});
    } else {
        await res.send(`${userName} already in the notification list`);
    }
    return res.end();
}

const getUserList = async (req, res) => {
    const users = (
        await db.ref("users").once("value")
      ).val()
    // TODO cleanup list of users to make readable
    await res.send(`Current users = ${Object.keys(users)}`);
    return res.end();
}


module.exports = {
    checkAllUsers,
    slashCommand
}