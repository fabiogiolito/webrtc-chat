let Peer = require('simple-peer')
let socket = io()

const video = document.querySelector('#myVideo')
let client = {}

// get stream
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => {

    console.log("============================")
    console.log("got media")

    socket.emit('NewClient')
    video.srcObject = stream
    video.play()
    
    // Initialize a peer
    function InitPeer(type) {
      
      console.log("============================")
      console.log("InitPeer")

      let peer = new Peer({ initiator: (type == 'init') ? true : false, stream: stream, trickle: false })
      peer.on('stream', function(stream) {
        CreateVideo(stream)
      })
      peer.on('close', function() {
        document.getElementById("peerVideo").remove()
        peer.destroy()
      })

      return peer
    }
    
    // Peer type Init
    function MakePeer() {

      console.log("============================")
      console.log("MakePeer")

      client.gotAnswer = false
      
      let peer = InitPeer('init')
      
      peer.on('signal', function(data) {
        console.log("============================")
        console.log("on signal")
        
        
        if (!client.gotAnswer) {
          console.log("============================")
          console.log("emit offer")
          
          socket.emit('Offer', data)
        }
      })
      client.peer = peer
    }
    
    // Peer not type Init
    function FrontAnswer(offer) {

      console.log("============================")
      console.log("FrontAnswer")
      
      let peer = InitPeer('notInit')
      peer.on('signal', (data) => {
        
        console.log("============================")
        console.log("emit answer")
      
        socket.emit('Answer', data)
      })
      peer.signal(offer)
      client.peer = peer
    }
    
    function SignalAnswer(answer) {

      console.log("============================")
      console.log("SignalAnswer")

      client.gotAnswer = true
      let peer = client.peer
      peer.signal(answer)
    }
    
    function CreateVideo(stream) {
      let video = document.createElement('video')
      video.id = 'peerVideo'
      video.srcObject = stream
      video.setAttribute('class', 'embed-responsive-item')
      document.querySelector('#peerDiv').appendChild(video)

      console.log("============================")
      console.log("appended peer video")

      video.play()
    }
    
    function SessionActive() {
      document.write('Session Active. Please come back later')
    }
    
    function RemovePeer() {
      document.getElementById('peerVideo').remove()
      if (client.peer) {
        client.peer.destroy()
      }
    }
    
    socket.on('BackOffer', FrontAnswer)
    socket.on('BackAnswer', SignalAnswer)
    socket.on('SessionActive', SessionActive)
    socket.on('CreatePeer', MakePeer)
    socket.on('Disconnect', RemovePeer)

    
  })
  .catch(err => document.write(err))
