const credentials = require("./credentials.json")

const Scratch = require("../index")

const user = new Scratch.User()

const main = async () => {
    let data = await user.login(credentials.username, credentials.password)
    console.log(data.status, data.json)
    data = await user.comments.commentOnUser("ez claps", "uwv")
    console.log(data.status, data.json)
}

main()