const credentials = require("./credentials.json")

const Scratch = require("../index"),
    fs = require("fs"),
    path = require("path")

const user = new Scratch.User()

const main = async () => {
    await user.login(credentials.user, credentials.pass)

    //sets your icon to the default
    //all limits still apply (max 500x500, and 10mb limit)
    await user.profile.setProfilePicture(fs.readFileSync(path.join(__dirname, "default.png")), "image/png")
}

main()