const express = require("express")
const dotenv = require("dotenv")
const morgan = require("morgan")
const expreshbs = require("express-handlebars")
const connectDB = require("./config/db")
const path = require("path")
const passport = require("passport")
const session = require("express-session")
const methodOverride = require('method-override')
const mongoose = require("mongoose")
const mongoStore = require("connect-mongo")(session)


dotenv.config({ path:"./config/config.env" })

require('./config/passport')(passport)

connectDB()

const app = express()

app.use(express.urlencoded({ extended:false }))

app.use(
    methodOverride(function (req, res) {
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
    })
  )

if(process.env.NODE_ENV == "development"){
    app.use(morgan("dev"))
}

const { formatDate, stripTags, truncate, editIcon, select } = require('./helpers/hbs')

app.engine('.hbs', expreshbs({ defaultLayout:"main", extname:".hbs", helpers:{formatDate, stripTags, truncate, editIcon, select} }))
app.set('view engine', ".hbs")

app.use(session({ 
    secret:'random',
    resave: false,
    saveUninitialized: false,
    cookie: {expires: new Date(253402300000000)},
    store: new mongoStore({ mongooseConnection: mongoose.connection })
 }))

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.user = req.user
    next()
})


app.use(express.static(path.join(__dirname, "/public")))

app.use('/', require("./routes/index"))
app.use('/auth', require("./routes/auth"))
app.use('/stories', require("./routes/stories"))

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} at http://localhost:${PORT}`)
})