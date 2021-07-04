import WS from "ws";
import EXPRESS from "express"
import FS from "fs"

const PORT = 8080
const DATABASE_PATH = "database.txt"

const app = EXPRESS()
app.use(EXPRESS.static("website"))
const httpServer = app.listen(PORT, ()=>{console.log(`Listening at ${PORT}`)})
const wsServer = new WS.Server({ server:httpServer })

let conns = []
let clicks = []
wsServer.addListener("connection", (client)=>{
    //send past pets
    conns.push(client)
    let count = parseInt(FS.readFileSync(DATABASE_PATH).toString())
    if(!isNaN(count)) {
        client.send(JSON.stringify({
            id:"COUNT",
            value:count
        }))
    }
    
    client.addEventListener("message",(msg)=>{
        let count = parseInt(FS.readFileSync(DATABASE_PATH).toString())
        count++
        FS.writeFileSync(DATABASE_PATH,count.toString())
        //update other clients
        for(let conn of conns){
            if(conn != client) conn.send(count.toString())
        }
        clicks.push(msg.data)
    })

    client.addEventListener("close",()=>{
        conns = conns.filter(conn => conn != client)
    })
})

setInterval(() => {
    for(let conn of conns){
        let time = new Date().getTime()
        clicks = clicks.filter(click => time - click < 1000)
        let speed = clicks.length
        conn.send(JSON.stringify({
            id:"SPEED",
            value:speed
        }))
    }
}, 1);
