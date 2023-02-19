<script>
    export let start
    export let end

    let timePast
    let short

    $: {
        const startTime = luxon.DateTime.fromMillis(start)
        const endTime = luxon.DateTime.fromMillis(end)
        const diff = endTime.diff(startTime, ["years", "days", "hours", "minutes", "seconds", "milliseconds"]).toObject()

        if (diff.years !== 0) {
            short = `${diff.years}y ${diff.days}d`
        } else if (diff.days !== 0) {
            short = `${diff.days}d`
        } else if (diff.hours !== 0) {
            short = `${diff.hours}h`
        } else if (diff.minutes !== 0) {
            short = `${diff.minutes}m`
        } else if (diff.seconds !== 0) {
            short = `${diff.seconds}s`
        } else {
            short = `${diff.milliseconds}ms`
        }

        timePast = startTime.toLocaleString(luxon.DateTime.DATETIME_SHORT)
    }
</script>

{timePast} <sup>{short}</sup>