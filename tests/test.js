const credentials = require("./credentials.json")

const Scratch = require("../index")

const user = new Scratch.User()

const main = async () => {
    await user.login(credentials.user, credentials.pass)

    const session = await user.getSession()

    if (session.status != 200) {
        throw new Error("Something is broken!")
    }
}

main()