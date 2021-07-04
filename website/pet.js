const SOCKET = new WebSocket(`ws://${window.location.host}`)
const CANVAS = document.querySelector("#canvas")
const PETEY = document.querySelector("#imgPetey")
const HAND = document.querySelector("#imgHand")

let count = 0
let pps = 0

let frame = 0
let animating = false
let lastFrameTime = new Date().getTime()

function pet(){
    count++
    animating = true
    lastFrameTime = new Date().getTime()
    if(!isNaN(count)) SOCKET.send(new Date().getTime())
}

function loop(){
    const ctx = CANVAS.getContext("2d")
    let dim = Math.min(CANVAS.width,CANVAS.height) / 2
    //clear
    ctx.fillStyle = "#141414"
    ctx.fillRect(0,0,CANVAS.width,CANVAS.height)
    
    //counter
    ctx.fillStyle = "white"
    ctx.font = "48px helvetica"
    let text = `Pets:${count}`
    ctx.textAlign = "center"
    ctx.fillText(text,CANVAS.width / 2,CANVAS.height / 2 + dim * 2/3)

    //speed
    text = `Pets/second:${pps}`
    ctx.fillText(text,CANVAS.width / 2,CANVAS.height / 2 + dim * 2/3 + 48)
    
    //petey himself
    let x = CANVAS.width / 2 - dim / 2
    let y = CANVAS.height / 2 - dim / 2
    ctx.drawImage(PETEY, x, y, dim, dim)

    //hand
    let width = HAND.naturalWidth / 5 - 1
    let srcX = width * frame
    let srcY = 0
    ctx.drawImage(HAND, srcX, srcY, width, HAND.naturalHeight, x - dim/50, y - dim/5, dim, dim)

    if(animating){
        let now = new Date().getTime()
        if(now - lastFrameTime > 40){
            lastFrameTime = now
            frame++
            if(frame > 4){
                frame = 0
                animating = false
            }
        }
    }
    requestAnimationFrame(loop)
}
loop()

function resize(){
    CANVAS.width = window.innerWidth
    CANVAS.height = window.innerHeight
}
resize()

SOCKET.addEventListener("message",(ev)=>{
    let obj = JSON.parse(ev.data)
    if(obj != null && obj.id != null){
        if(obj.id == "COUNT"){
            count = obj.value
        } else if(obj.id == "SPEED"){
            pps = obj.value
        }
    }
})

window.addEventListener("mousedown", (ev)=>{ pet(); ev.preventDefault() })

//window.addEventListener("keydown", (ev)=>{ pet(); ev.preventDefault() })

window.addEventListener("contextmenu", (ev)=>{ pet(); ev.preventDefault() })

window.addEventListener("touchstart", (ev)=>{ pet(); ev.preventDefault() })

window.addEventListener("resize", () => resize())