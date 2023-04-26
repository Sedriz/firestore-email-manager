module.exports = function createEmailBody(data) {
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