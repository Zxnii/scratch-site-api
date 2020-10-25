const fetch = require("node-fetch")
const FormData = require("form-data")

class User {
    id = 0
    token = ""
    session = ""
    username = ""
    email = ""
    admin = false
    joinDate = 0
    banned = false
    scratcher = false

    constructor() {

    }

    async login(username, password) {
        const res = await fetch("https://scratch.mit.edu/login/", {
            headers: {
                "x-csrftoken": "a",
                "x-requested-with": "XMLHttpRequest",
                "Cookie": "scratchcsrftoken=a;scratchlanguage=en;",
                "referer": "https://scratch.mit.edu"
            },
            body: JSON.stringify({ username, password, useMessages: true }),
            method: "POST"
        })
        const session = res.headers.get("set-cookie").match(/\"(.*)\"/g)
        const status = res.status
        const body = await res.text()
        let json = {}
        try {
            json = JSON.parse(body)
        } catch (ex) {
            /*
                What are the chances of this happening?
            */
        }

        if (res.ok && json[0].success == 1) {
            this.session = session
            this.token = json[0].token
            this.id = json[0].id
            this.username = json[0].username

            const sessionData = await (await this.getSession()).json

            this.joinDate = new Date(sessionData.user.dateJoined)
            this.email = sessionData.user.email
            this.banned = sessionData.user.email
            this.admin = sessionData.permissions.admin
            this.scratcher = sessionData.permissions.scratcher
        }
        return { body, status, json }
    }

    async getSession() {
        const res = await fetch(`https://scratch.mit.edu/session/`, {
            headers: {
                "x-csrftoken": "a",
                "x-requested-with": "XMLHttpRequest",
                "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                "referer": `https://scratch.mit.edu/`
            },
            method: "GET"
        })

        const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
    }

    messages = {
        getMessages: async (offset, limit) => {
            const res = await fetch(`https://api.scratch.mit.edu/users/${this.username}/messages?limit=${limit}&offset=${offset}`, {
                headers: {
                    "x-requested-with": "XMLHttpRequest",
                    "origin": "https://scratch.mit.edu/",
                    "referer": `https://scratch.mit.edu/`,
                    "x-token": this.token
                },
                method: "GET"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        },
        getCount: async () => {
            const res = await fetch(`https://api.scratch.mit.edu/users/${this.username}/messages/count/`, {
                headers: {
                    "referer": `https://scratch.mit.edu/`
                },
                method: "GET"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {

            }

            return { body, status, json }
        }
    }

    profile = {
        toggleComments: async () => {
            const res = await fetch(`https://scratch.mit.edu/site-api/comments/user/${this.username}/toggle-comments/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/users/${this.username}`
                },
                method: "POST"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        },
        setStatus: async (content) => {
            const res = await fetch(`https://scratch.mit.edu/site-api/users/all/${this.username}/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/users/${this.username}`
                },
                body: JSON.stringify({
                    userId: this.id,
                    id: this.username,
                    username: this.username,
                    status: content
                }),
                method: "PUT"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        },
        setBio: async (content) => {
            const res = await fetch(`https://scratch.mit.edu/site-api/users/all/${this.username}/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/users/${this.username}`
                },
                body: JSON.stringify({
                    userId: this.id,
                    id: this.username,
                    username: this.username,
                    bio: content
                }),
                method: "PUT"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        },
        setProfilePicture: async (data, mime) => {
            const form = new FormData()

            form.append("file", data, {
                contentType: mime,
                name: "file",
                filename: "pfp.png"
            })
            const res = await fetch(`https://scratch.mit.edu/site-api/users/all/${this.username}/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/users/${this.username}`
                },
                body: form,
                method: "POST"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        }
    }

    comments = {
        commentOnUser: async (content, user, parent_id = "", commentee_id = "") => {
            const res = await fetch(`https://scratch.mit.edu/site-api/comments/user/${user}/add/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/users/${user}`
                },
                body: JSON.stringify({ content, parent_id, commentee_id }),
                method: "POST"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        },
        commentOnProject: async (content, id, parent_id = "", commentee_id = "") => {
            const res = await fetch(`https://api.scratch.mit.edu/proxy/comments/project/${id}/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchsessionsid=${this.session};`,
                    "origin": "https://scratch.mit.edu/",
                    "referer": `https://scratch.mit.edu/`,
                    "x-token": this.token,
                },
                body: JSON.stringify({ content, parent_id, commentee_id }),
                method: "POST"
            })

            const status = res.status
            const body = await res.text()
            let json = {}
            try {
                json = JSON.parse(body)
            } catch (ex) {
                /*
                    What are the chances of this happening?
                */
            }

            return { body, status, json }
        }
    }
}

class CloudSession {
    constructor(user) {

    }
}

module.exports.User = User