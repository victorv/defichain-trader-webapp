<script>
    import {incomingMessages, outgoingMessages} from "./store";

    let socket
    let connected
    let error
    let uuid

    const getUUID = () => {
        if (localStorage) {
            let uuid = localStorage.getItem("uuid")
            if (!uuid) {
                uuid = crypto.randomUUID()
            }
            localStorage.setItem("uuid", uuid)
            return uuid
        }
        return crypto.randomUUID()
    }

    uuid = getUUID()

    outgoingMessages.subscribe(message => {
        if (message != null) {
            socket.send(JSON.stringify(message))
        }
    })

    const newSocket = () => {
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
            connected = true
            error = null
            socket.send(JSON.stringify({
                id: 'uuid',
                data: uuid,
            }))
        }

        socket.onclose = function () {
            error = 'You are not connected to the server'
            connected = false
        }

        socket.onmessage = function (event) {
            const message = JSON.parse(event.data)
            incomingMessages.set(message)
        }
    }

    newSocket()
</script>

<div>
    <label>
        Status
        {#if connected}
            Connected
        {:else}
            <button class="pure-button" on:click={newSocket}>Reconnect</button>
        {/if}
    </label>
</div>


