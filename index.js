const { EventEmitter } = require("events")

const fetch = require("node-fetch"),
    util = require("util"),
    FormData = require("form-data"),
    WebSocket = require("ws")

/**
 * Class with methods for user operations (Commenting, changing account settings, etc..)
 */
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

    /**
     * Login with a username and password
     * @param {String} username 
     * @param {String} password 
     */
    login = async (username, password) => {
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
        if (res.status == 200) {
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

                const sessionData = await this.getSession()

                this.joinDate = new Date(sessionData.user.dateJoined)
                this.email = sessionData.user.email
                this.banned = sessionData.user.email
                this.admin = sessionData.permissions.admin
                this.scratcher = sessionData.permissions.scratcher
            }
            json["body"] = body
            json["status"] = status
            return json
        } else throw new Error("Something went wrong while logging in")
    }

    getCSRFToken = async () => {

    }

    /**
     * Sign out and invalidate current session
     */
    signOut = async () => {
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

    /**
     * Get information about session, such as email
     */
    getSession = async () => {
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

            json["body"] = body
            json["status"] = status
            return json
        }
    }

    /**
     * Change account country
     * @param {String} country 
     */
    changeCountry = async (country) => {
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

    /**
     * Change account password
     * @param {String} oldPassword 
     * @param {String} newPassword 
     */
    changePassword = async (oldPassword, newPassword) => {
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

    /**
     * Change account email
     * @param {String} email 
     * @param {String} password 
     */
    changeEmail = async (email, password) => {
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
        /**
         * Get account messages
         * @param {Number} offset 
         * @param {Number} limit 
         */
        getMessages: async (offset = 0, limit = 40) => {
            if (this.session.length > 0) {
                const res = await fetch(`https://api.scratch.mit.edu/users/${this.username}/messages?limit=${limit}&offset=${offset}`, {
                    headers: {
                        "x-requested-with": "XMLHttpRequest",
                        "origin": "https://scratch.mit.edu",
                        "referer": `https://scratch.mit.edu/`,
                        "x-token": this.token,
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

                json["body"] = body
                json["status"] = status
                return json
            }
        },
        /**
         * Get message count
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        }
    }

    profile = {
        /**
         * Toggle comments on profile
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        },
        /**
         * Set contents of user's WIWO
         * @param {String} content 
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        },
        /**
         * Set contents of user's bio
         * @param {String} content 
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        },
        /**
         * Set a user's profile picture
         * @param {Buffer} data 
         * @param {String} mime 
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        }
    }

    comments = {
        /**
         * Comment on a user's profile. Note: `parent_id` & `commentee_id` are required for replying
         * @param {String} content 
         * @param {String} user 
         * @param {String} parent_id 
         * @param {String} commentee_id 
         */
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

                json["body"] = body
                json["status"] = status
                return json
            }
        },
        /**
         * WIP
         * @param {String} content 
         * @param {String} id 
         * @param {String} parent_id 
         * @param {String} commentee_id 
         */
        commentOnProject: async (content, id, parent_id = "", commentee_id = "") => {
            if (this.session.length > 0) {
                const res = await fetch(`https://api.scratch.mit.edu/proxy/comments/project/${id}`, {
                    headers: {
                        "x-csrftoken": "a",
                        "Cookie": `scratchcsrftoken=a;scratchsessionsid=${this.session};`,
                        "origin": "https://scratch.mit.edu",
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

                json["body"] = body
                json["status"] = status
                return json
            }
        }
    }

    cloud = {
        /**
         * Create a cloud session with a project
         * @param {Number} project_id
         * @returns {CloudSession}
         */
        createSession: (project_id) => {
            if (this.session.length > 0)
                return new CloudSession(this, project_id)
        }
    }
}

/**
 * Class containing methods for working with cloud
 */
class CloudSession extends EventEmitter {
    /**
     * Create a cloud session with optional custom server
     * @param {User} user 
     * @param {Number} project_id 
     * @param {String} server
     */
    constructor(user, project_id, server = "clouddata.scratch.mit.edu") {
        super()
        this.session = user.session
        this.server = server
        this.username = user.username
        this.id = project_id
        this.variables = new Map()
        this._attemptedPackets = []
        this._connect()
        let stream = ""
        this._connection.on("open", () => {
            this._performHandshake()
        })
        this._connection.on("message", (chunk) => {
            stream += chunk
            const packets = stream.split("\n")
            for (const packet of packets) {
                try {
                    this._handlePacket(JSON.parse(packet))
                } catch (err) {

                }
            }
        })
        this._connection.on("close", () => {
            this._connect()
        })
    }


    /**
     * Return a cloud variable with name, make sure to include the cloud icon (☁)!
     * @param {String} name 
     * @returns {String}
     */
    get = (name) => {
        return this.variables.get(name)
    }

    /**
     * Sets a cloud variable with name and value (value can only be numbers for the official cloud server), make sure to include the cloud icon (☁)!
     * @param {String} name 
     * @param {String|Number} value 
     */
    set = (name, value) => {
        this.variables.set(name, value.toString())
        this._send("set", { name, value: value.toString() })
    }

    /**
     * Internal function, connect to the cloud server
     */
    _connect = () => {
        if (this.server == "clouddata.scratch.mit.edu") {
            this._connection = new WebSocket("wss://clouddata.scratch.mit.edu/", {
                headers: {
                    "Cookie": `scratchsessionsid=${this.session};`,
                    "origin": "https://scratch.mit.edu"
                }
            })
        } else {
            this._connection = new WebSocket(`wss://${this.server}/`, {
                headers: {

                }
            })
        }
    }

    /**
     * Internal function, handle a packet
     * @param {Object} packet 
     */
    _handlePacket = (packet) => {
        this.emit("packet", packet)
        switch (packet.method) {
            case "set":
                this.emit("set", packet.name, packet.value)
                this.variables.set(packet.name, packet.value)
                break
            default:
                console.warn(`Method not implemented ${packet.method}, if you think this is a meant to be implemented create an issue at https://github.com/Zxnii/scratch-site-api/issues`)
        }
    }

    /**
     * Internal function, send a packet
     * @param {String} method 
     * @param {Object} data 
     */
    _send = (method, data) => {
        const packet = {
            method,
            user: this.username,
            project_id: this.id.toString()
        }
        for (const key of Object.keys(data)) {
            packet[key] = data[key]
        }
        if (this._connection.readyState == WebSocket.OPEN)
            this._sendPacket(`${JSON.stringify(packet)}\n`)
        else
            this._attemptedPackets.push(`${JSON.stringify(packet)}\n`)
        this.emit("outgoing", packet)
    }

    /**
     * Internal function, send a serialized packet, use `_send` instead
     * @param {String} packet 
     */
    _sendPacket = (packet) => {
        this._connection.send(packet)
    }

    /**
     * Internal function, send a handshake packet, should be used after connecting to the server
     */
    _performHandshake = () => {
        this.emit("handshake")
        this._send("handshake", {})
    }
}

module.exports.User = User
module.exports.CloudSession = CloudSession