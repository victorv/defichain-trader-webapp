<script>
    export let status
</script>

{#if status}
    {#if status.connecting}
        Connecting...
    {:else if !status.connected}
        <section>
            <div>
                <h1>You are not connected!</h1>
                <p>Make sure you are connected to the internet.</p>
                <p>It is also possible that the servers are restarting to deploy an update.</p>
                <p>You may have encountered a bug that caused you to be disconnected. Or you could be using an
                    unsupported
                    device. Contact the maintainer if the problem
                    persists.</p>
                <p>Automatically trying to reconnect in 30 seconds...</p>
            </div>
        </section>
    {/if}
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