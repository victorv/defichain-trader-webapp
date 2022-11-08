<script>
    export let start
    export let end

    let timePast

    const duration = (quantity, text) => {
        if (quantity === 0) {
            return null
        }
        if (quantity === 1) {
            return `${quantity} ${text}`
        }
        return `${quantity} ${text}s`
    }

    $: {
        const startTime = luxon.DateTime.fromMillis(start)
        const endTime = luxon.DateTime.fromMillis(end)
        const diff = endTime.diff(startTime, ["days", "hours", "minutes", "seconds"]).toObject()

        timePast = [
            duration(diff.hours, 'hour'),
            duration(diff.minutes, 'minute'),
        ]
            .filter(duration => duration !== null)
            .join(' and ') + ' ago'

        if (diff.days > 0) {
            timePast = startTime.toLocaleString(luxon.DateTime.DATETIME_SHORT)
        } else if (diff.minutes === 0) {
            const seconds = Math.round(diff.seconds * 1000) / 1000
            timePast = duration(seconds, 'second') + ' ago'
        }
    }
</script>

{timePast}