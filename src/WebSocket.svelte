<script>
    import {addPoolswap, incomingMessages, outgoingMessages, webSocketStore} from "./store";

    let socket
    let error
    let reconnectId

    outgoingMessages.subscribe(message => {
        if (message != null) {
            socket.send(JSON.stringify(message))
        }
    })

    const newSocket = () => {
        clearTimeout(reconnectId)

        webSocketStore.set({
            connecting: true,
            connected: false,
        })
        if (socket) {
            socket.onclose = function () {
            }
            socket.close()
        }

        socket = new WebSocket(`${window.location.host.indexOf('localhost') >= 0 ? 'ws' : 'wss'}://${window.location.host}/stream`)

        window.onbeforeunload = function () {
            socket.onclose = function () {
            }
            socket.close()
        }

        socket.onopen = () => {
            webSocketStore.set({
                connecting: false,
                connected: true,
            })
            error = null

            const swaps = localStorage
                ? JSON.parse(localStorage.getItem('poolSwaps') || '[]')
                : []

            swaps.forEach(swap => addPoolswap(swap))
        }

        socket.onclose = function () {
            error = 'You are not connected to the server'
            webSocketStore.set({
                connected: false,
                connecting: false,
            })
            reconnectId = setTimeout(newSocket, 30000)
        }

        socket.onmessage = function (event) {
            const message = JSON.parse(event.data)
            incomingMessages.set(message)
        }
    }

    newSocket()
</script>


