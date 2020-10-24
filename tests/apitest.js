const credentials = require("./credentials.json")

const Scratch = require("../index")

const user = new Scratch.User()

const main = async () => {
    let data = await user.login(credentials.user, credentials.pass)
    console.log(data.status, data.json)
    data = await user.comments.commentOnUser("ez claps", "uwv")
    console.log(data.status, data.json)
    data = await user.comments.commentOnProject("nodejs test thing irdk", "419248967")
    console.log(data.status, data.json)
}

main()