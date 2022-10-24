<script>
    export let text
    let focused = false
    let message
    let timeout

    const copyToClipboard = async () => {
        focused = !focused
        if (focused) {
            try {
                await navigator.clipboard.writeText(text)
                message = {text: 'Copied'}
            } catch (e) {
                message = {text: 'Failed to copy'}
            } finally {
                clearTimeout(timeout)
                timeout = setTimeout(() => message = null, 750)
            }
        }
    }
</script>

<a on:click|preventDefault={copyToClipboard}
   class="limited"
   class:focused
   href="#">{text}{#if message}<span class:info={message.text === 'Copied'} class:error={message.text !== 'Copied'}>{message.text}</span>{/if}
</a>

<style>
    @keyframes pop-in {
        0% {
            opacity: 0;
            transform: scale(0.5);
        }
        50% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0);
        }
    }

    .limited.focused {
        white-space: break-spaces;
        word-break: break-all;
        max-width: 100%;
    }

    span {
        position: absolute;
        z-index: 100;
        opacity: 0;
        animation: pop-in 0.75s;
    }
</style>