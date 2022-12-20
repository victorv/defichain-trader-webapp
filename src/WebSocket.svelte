<script>
    import {addPoolswap, incomingMessages, outgoingMessages} from "./store";

    let connecting = true
    let socket
    let connected
    let error

    outgoingMessages.subscribe(message => {
        if (message != null) {
            socket.send(JSON.stringify(message))
        }
    })

    const newSocket = () => {
        connecting = true
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
            connecting = false
            connected = true
            error = null

            const swaps = localStorage
                ? JSON.parse(localStorage.getItem('poolSwaps') || '[]')
                : []

            swaps.forEach(swap => addPoolswap(swap))
        }

        socket.onclose = function () {
            connecting = false
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

{#if connecting}
    Connecting...
{:else if !connected}
    <section>
        <div>
            <h1>You are not connected!</h1>
            <p>Make sure you are connected to the internet.</p>
            <p>It is also possible that the servers are restarting to deploy an update.</p>
            <p>You may have encountered a bug that caused you to be disconnected. Or you could be using an unsupported
                device. Contact the maintainer if the problem
                persists.</p>
            <button class="pure-button" on:click={newSocket}>Reconnect</button>
        </div>
    </section>
{/if}

<style>
    section {
        padding: 1rem;
        position: fixed;
        width: 100%;
        height: 100%;
        background: white;
        z-index: 100;
    }
</style>


