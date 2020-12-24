# scratch-site-api

scratch-site-api is a full library for working with the Scratch website with Node.JS

## Classes

- User, a user class containing all methods for user accounts
- CloudSession, a class for interacting with cloud data

## Methods

User (all methods unless otherwise stated are async)
- `login`, take a username and password to login
- `signOut`, sign out and invalidate the current session
- `getSession`, get information about a session
- `changeCountry`, change account country (Can be any valid country, first letter must be capitalized)
- `changePassword`, change account password, takes the old account password and the new password
- `changeEmail`, change account email, takes the account password and new email
- `messages.getMessages`, get account messages, takes an offset and limit
- `messages.getCount`, get account message count
- `profile.toggleComments`, toggle commenting on user profile
- `profile.setStatus`, takes a string to set user's WIWO to
- `profile.setBio`, takes a string to set user's bio to
- `profile.setProfilePicture`, takes a buffer and mime type to set user's profile picture to
- `comments.commentOnUser`, takes a string and username to comment on, also takes a comment id and commentee id for replying
- `comments.commentOnProject`, takes a string and project id to comment on, also takes a comment id and commentee id for replying
- `cloud.createSession`, takes a project id to create a cloud session on

## Examples

Login as a user and get session info

```javascript
const Scratch = require("scratch-site-api")
const user = new Scratch.User()

async function main() {
    await user.login("username", "password")

    console.log(await user.getSession().json)
}
```

## Running the tests

Create a credentials.json file in the `tests` folder with a `user` and `pass` field