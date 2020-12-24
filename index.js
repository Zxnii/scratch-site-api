const { EventEmitter } = require("events")

const fetch = require("node-fetch"),
    util = require("util"),
    FormData = require("form-data"),
    WebSocket = require("ws")

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
        const session = res.headers.get("set-cookie").match(/\"(.*)\"/g)[0]
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

            const sessionData = await this.getSession().json

            this.joinDate = new Date(sessionData.user.dateJoined)
            this.email = sessionData.user.email
            this.banned = sessionData.user.email
            this.admin = sessionData.permissions.admin
            this.scratcher = sessionData.permissions.scratcher
        }
        return { body, status, json }
    }

    async signOut() {
        if (this.session.length > 0) {
            const form = new FormData()

            form.append("csrfmiddlewaretoken", "a")
            const res = await fetch(`https://scratch.mit.edu/accounts/logout/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/`
                },
                body: form,
                method: "POST"
            })

            const status = res.status
            const body = await res.text()

            if (status == 200) {
                this.session = ""
                this.username = ""
                this.admin = false
                this.banned = false
                this.email = ""
                this.id = 0
                this.joinDate = 0
                this.scratcher = false
            }

            return { body, status }
        }
    }

    async getSession() {
        if (this.session.length > 0) {
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
    }

    async changeCountry(country) {
        if (this.session.length > 0) {
            const form = new FormData()

            form.append("country", country)

            form.append("csrfmiddlewaretoken", "a")
            const res = await fetch(`https://scratch.mit.edu/accounts/settings/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/`
                },
                body: form,
                method: "POST"
            })

            const status = res.status
            const body = await res.text()

            return { body, status }
        }
    }

    async changePassword(oldPassword, newPassword) {
        if (this.session.length > 0) {
            const form = new FormData()

            form.append("old_password", oldPassword)
            form.append("new_password1", newPassword)
            form.append("new_password2", newPassword)

            form.append("csrfmiddlewaretoken", "a")
            const res = await fetch(`https://scratch.mit.edu/accounts/password_change/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/`
                },
                body: form,
                method: "POST"
            })

            const status = res.status
            const body = await res.text()

            return { body, status }
        }
    }

    async changeEmail(email, password) {
        if (this.session.length > 0) {
            const form = new FormData()

            form.append("email_address", email)
            form.append("password", password)

            form.append("csrfmiddlewaretoken", "a")
            const res = await fetch(`https://scratch.mit.edu/accounts/email_change/`, {
                headers: {
                    "x-csrftoken": "a",
                    "x-requested-with": "XMLHttpRequest",
                    "Cookie": `scratchcsrftoken=a;scratchlanguage=en;scratchsessionsid=${this.session};`,
                    "referer": `https://scratch.mit.edu/`
                },
                body: form,
                method: "POST"
            })

            const status = res.status
            const body = await res.text()

            return { body, status }
        }
    }

    messages = {
        getMessages: async (offset, limit) => {
            if (this.session.length > 0) {
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
            }
        },
        getCount: async () => {
            if (this.session.length > 0) {
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
    }

    profile = {
        toggleComments: async () => {
            if (this.session.length > 0) {
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
            }
        },
        setStatus: async (content) => {
            if (this.session.length > 0) {
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
            }
        },
        setBio: async (content) => {
            if (this.session.length > 0) {
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
            }
        },
        setProfilePicture: async (data, mime) => {
            if (this.session.length > 0) {
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
    }

    comments = {
        commentOnUser: async (content, user, parent_id = "", commentee_id = "") => {
            if (this.session.length > 0) {
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
            }
        },
        commentOnProject: async (content, id, parent_id = "", commentee_id = "") => {
            if (this.session.length > 0) {
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

    cloud = {
        createSession(project_id) {
            if (this.session.length > 0)
                return new CloudSession(this, project_id)
        }
    }
}

class CloudSession extends EventEmitter {
    constructor(user, project_id) {
        super()
        this.session = user.session
        this.username = user.username
        this.id = project_id
        this._attemptedPackets = []
        this._connect()
        this._connection.on("open", () => {
            this.emit("open")
        })
    }

    _connect() {
        this._connection = new WebSocket("wss://clouddata.scratch.mit.edu/", {
            headers: {
                "Cookie": `scratchsessionsid=${this.session};`,
                "origin": "https://scratch.mit.edu"
            }
        })
        this._connection.on("open", () => {
            this._performHandshake()
            for (const packet of this._attemptedPackets) {
                this._sendPacket(packet)
            }
            this._attemptedPackets = []
        })

        let stream = ""
        this._connection.on("message", (chunk) => {
            stream += chunk
            const packets = stream.split("\n")
            for (const packet of packets) {
                try {
                    this._handlePacket(JSON.parse(packet))
                } catch (err) {
                    console.warn(`Invalid packet ${packet}`)
                }
            }
        })
        this._connection.on("close", () => {
            this._connect()
        })
    }

    _handlePacket(packet) {
        this.emit("packet", packet)
        switch (packet.method) {
            case "set":
                this.emit("set", packet.name, packet.value)
            default:
                console.warn(`Method not implemented ${packet.method}, if you think this is a meant to be implemented create an issue at https://github.com/Zxnii/scratch-site-api/issues`)
        }
    }

    _send(method, data) {
        const packet = {
            method,
            user: this.username,
            project_id: this.id.toString()
        }
        for (const key of Object.keys(data)) {
            packet[key] = data[key]
        }
        if (this._connection.readyState == WebSocket.OPEN)
            this._sendPacket(JSON.stringify(packet))
        else
            this._attemptedPackets.push(JSON.stringify(packet))
        this.emit("outgoing", packet)
    }

    _sendPacket(packet) {
        this._connection.send(packet)
    }

    _performHandshake() {
        this.emit("handshake")
        this._send("handshake", {})
    }
}

module.exports.User = User
module.exports.CloudSession = CloudSession