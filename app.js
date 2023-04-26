const nodemailer = require("nodemailer")
require("dotenv").config()
const admin = require("firebase-admin");
const fs = require('fs')
const dataFile = "./data.json";

async function getBookings(db) {
    const collection = db.collection(process.env.COLLECTION_PATH);
    const snapshot = await collection.get();
    if (snapshot.empty) {
        console.log('No matching documents.');
        return;
    }

    let snapArray = []
    snapshot.forEach(doc => snapArray.push({id: doc.id, ...doc.data()}));
    return snapArray;
}

function getFileContent() {
    let fileContent = [];
    try {
        fileContent = require(dataFile)
    }
    catch (e) {
        console.log("No file found!");
    }
    return fileContent;
}

function readDifferences(data) {
    data = data.map(value => value.id);
    let fileContent = getFileContent();
    return data.filter(x => !fileContent.includes(x));
}

function writeNewData(dataArray) {
    dataArray = dataArray.map(value => value.id);
    let fileContent = getFileContent();

    for (const data of dataArray) {
        if (fileContent.indexOf(data) === -1) {
            fileContent.push(data)
        }
    }

    let dataJsonString = JSON.stringify(fileContent);
    fs.writeFile(dataFile, dataJsonString, function(err, result) {
        if(err) console.log('error', err);
    });
}

function createEmailBody(data) {
    return `
Anfrage erhalten von ${data.name}.
Email: ${data.email}
Datum: ${new Date(data.timestamp)}
Anliegen: ${data.subject}
\n
${data.body}
\n
Dies ist eine automatisch erstellte Email.
Bitte keine Links öffnen welche hier enthalten sind!
`;
}

function sendEmail(body) {
    const transporter = nodemailer.createTransport({
        host: 'mail.gmx.com',
        port: 587,
        tls: {
            ciphers:'SSLv3',
            rejectUnauthorized: false
        },
        debug: true,
        auth: {
            user: process.env.SENDER_USERNAME,
            pass: process.env.SENDER_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.SENDER_USERNAME,
        to: process.env.RECEIVER_EMAIL,
        subject: 'Jemand hat dein Kontaktformular ausgefüllt :D',
        text: body
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

let serviceAccount = require(process.env.FIREBASE_SECRET_LOCATION);

const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIRESTORE_URL
});
const db = admin.firestore(app);

getBookings(db).then(bookings => {
    let differences = readDifferences(bookings);
    if (differences) {
        differences = differences.map(differenceID => bookings.find(booking => booking.id === differenceID));
    }
    else {
        differences = bookings;
    }
    for (const difference of differences) {
        let body = createEmailBody(difference);
        sendEmail(body);
    }
    writeNewData(bookings);
});