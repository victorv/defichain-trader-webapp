<script>
    import {messages} from "./store";

    let socket
    let connected
    let error

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
        }

        socket.onclose = function () {
            error = 'You are not connected to the server'
            connected = false
        }

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data)
            messages.set({
                connected,
                error,
                data,
            })
        }
    }

    newSocket()
</script>

<div>
    {#if connected}
        Connected
    {:else}
        <div class="message">
            <button class="pure-button" on:click={newSocket}>Reconnect</button>
        </div>
    {/if}
</div>

<style>
    div {
        float: right;
    }
</style>

