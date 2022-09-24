<script context="module">
    const notification = window.Notification
</script>
<script>
    import {setDesktopNotifications, store} from "../store";

    let desktopNotifications = false

    const toggleNotifications = async () => {
        if (desktopNotifications) {
            setDesktopNotifications(false)
        } else if(notification) {
            let permission = notification.permission
            if (permission !== 'granted') {
                permission = await notification.requestPermission()
            }
            setDesktopNotifications(permission == 'granted')
        }
    }

    store.subscribe(state => {
        desktopNotifications = state.desktopNotifications
    })
</script>

<label class="pure-checkbox"
       for="desktop-notifications">
    <input id="desktop-notifications" checked={desktopNotifications}
           disabled={!notification}
           on:click={toggleNotifications}
           type="checkbox"/>
    Desktop Notifications
</label>