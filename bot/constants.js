"use strict";

const { readFileSync } = require('fs');
const { join } = require('path');
let faq = readFileSync(join(__dirname, 'faq.txt')).toString().replace(/[\r\n]/g, '').replace(/   /g, ' ');
const faqVariables = {
    serverAdvertisingChannel: "<#700040209705861120>",
    botAdvertisingChannel: "<#724454726908772373>",
    owner: "null#8626"
}

for (const variable of Object.keys(faqVariables))
    faq = faq.replace(new RegExp(`\\{${variable}\\}`, 'g'), faqVariables[variable]);

module.exports = {
    color: 0x7289DA,
    errorColor: 0x5865F2,
    mainServerID: "688373853889495044",
    modlogWebhook: process.env.LOGGERS_WEBHOOK,
    mimicWebhook: process.env.WEBHOOK_URL,
    owners: [
        "661200758510977084"
    ],
    advertisingChannelIDs: [
        "700040209705861120",
        "724454726908772373"
    ],
    moderatorRoleIDs: [
        "688375633637933202",
        "849192188351873064"
    ],
    autoroleID: "704088104327315557",
    muteRoleID: "766999393094074379",
    autoMessageRoles: {
        "700040209705861120": "700042707468550184",
        "724454726908772373": "701586228000325733"
    },
    faq: faq.split('Q: ').slice(1).map(x => x.split('A: '))
};