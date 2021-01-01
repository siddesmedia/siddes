function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

var publicVapidKey = 'BEYfNQ_VPTam_6_81sKGr-UFDiXg5B8q4ahLcGcM5q4aBkhCSBIZdDeFfNmcd0sKvOtLyA4m_3sHx2QEHgGldks';

if (window.location.includes('siddes.com')) {
    // production key
    publicVapidKey = 'BEYfNQ_VPTam_6_81sKGr-UFDiXg5B8q4ahLcGcM5q4aBkhCSBIZdDeFfNmcd0sKvOtLyA4m_3sHx2QEHgGldks';
} else {
    // development key
    publicVapidKey = 'BK7sh-gCg-85KnB9_ViY7J49EF10yfa0iBABxE7Ly7pF8vSmfyldAb2L-C9HdnkyTjZvP9UclWAlo1ZX4JpPueE';
}

if (window.Notification) {
    Notification.requestPermission(() => {
        if (Notification.permission == 'granted') {
            subscribe()
        }
    });
}

async function subscribe() {
    subscription = JSON.stringify(await getSubscriptionObject())
    $.post('/subscribe', {
        body: subscription
    })
}

async function getSubscriptionObject() {
    return await navigator.serviceWorker.register('/sw.js').then(async (worker) => {
        return await worker.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
    });
}