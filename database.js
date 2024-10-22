//Import
const mysql = require('mysql2');



//create connection
const db = mysql.createConnection({
    host:'localhost',
    port: 3306,
    user: 'medicineUser',
    password:'medicinePassword',
    database : 'telemedicine'

})

//connect to database
db.connect( (error) => {
    if(error){
        console.log('An Error Occured:', error.stack)
        return;
    }
    console.log('DB Connected!')
})

//export connection
module.exports= db;