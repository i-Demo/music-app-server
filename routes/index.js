const authRouter = require("./auth.js");
const songRouter = require("./song.js");
const playlistRouter = require("./playlist.js");
const searchRouter = require("./search.js");
const typeRouter = require("./type.js");

function route(app) {
    app.use("/api/auth", authRouter);
    app.use("/api/songs", songRouter);
    app.use("/api/playlists", playlistRouter);
    app.use("/api/search", searchRouter);
    app.use("/api/types", typeRouter);
    // app.use("/api/upload")
}

module.exports = route;
