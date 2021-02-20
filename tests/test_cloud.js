(async () => {
    const credentials = require("./credentials.json")

    const Scratch = require("../index")

    const user = new Scratch.User()

    await user.login(credentials.user, credentials.pass)

    const cloudSession = user.cloud.createSession(487914544)
    cloudSession.on("handshake", () => {
        console.log(`Performing handshake`)
    })
    cloudSession.on("set", (name, value) => {
        console.log(name, value)
        cloudSession.set("☁ testing var", 10)
    })
})()