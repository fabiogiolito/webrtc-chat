const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))
let clients = 0

io.on('connection', function(socket) {

  socket.on('NewClient', function() {
    
    console.log("============================")
    console.log("Server NewClient", clients)
    
    if (clients < 2) {
      
      console.log("clients < 2")
      
      if (clients == 1) {
        this.emit('CreatePeer')
        
        console.log("============================")
        console.log("Server emit CreatePeer")
      }

    } else {
      
      console.log("============================")
      console.log("Server emit SessionActive")
      
      this.emit('SessionActive')
    }
    clients++;
  })

  socket.on('Offer', SendOffer)
  socket.on('Answer', SendAnswer)
  socket.on('disconnect', Disconnect)

})

function Disconnect() {

  console.log("============================")
  console.log("Server Disconnect")
  
  if (clients > 0) {
    if (clients <= 2) {
      this.broadcast.emit("Disconnect")
    }
    clients--;
  }
}

function SendOffer(offer) {
  
  console.log("============================")
  console.log("Server SendOffer")
  
  this.broadcast.emit('BackOffer', offer)
}

function SendAnswer(data) {
  
  console.log("============================")
  console.log("Server SendAnswer")
  
  this.broadcast.emit('BackAnswer', data)
}

http.listen(port, () => console.log("Active"))
