import {LOG_URL} from "./AppContext";

// Or just use console log.
export function logEvent(address, status="", log_name="") {
    const requestOptions = {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_KEY_HERE',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "fields": {
                "address": address,
                "status": status,
                "timestamp": Date.now(),
                "date": new Date(Date.now()).toUTCString(),
            }
        })
    };
    fetch(LOG_URL, requestOptions);

    if (log_name) {
        fetch(LOG_URL + log_name, requestOptions);
    }
}