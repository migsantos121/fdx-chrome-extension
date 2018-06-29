var
    senderIds = ["143226759066"],
    link_for_update_ext_settings = 'https://app.fundz.net/extensions';

function gcmRegistration() {
    chrome.storage.local.get("registered", function(result) {
        // If already registered, bail out.
        if (result["registered"]) {
            return;
        }
        chrome.gcm.register(senderIds, registerCallback);
    });
}

function gcmUnRegistration() {
    chrome.gcm.unregister(unregisterCallback);
}

function registerCallback(registrationId) {
    if (chrome.runtime.lastError) {
        return;
    }
    $.ajax({
        url: link_for_update_ext_settings +'.js',
        method: 'post',
        data: 'token=' + registrationId,
        dataType: 'json',
        xhrFields: {
            withCredentials: true
        },
        success: function(data){
            chrome.storage.local.set({registered: true});
            chrome.storage.local.set({registration_id: registrationId});
            chrome.browserAction.setIcon({path: {"19": "img/icon.png"}}, function(){});
        },
        error: function(data){
            chrome.storage.local.set({registered: false});
            $('#checkbox-switch').prop('checked', false);
        }
    });
}

function unregisterCallback() {
    if (chrome.runtime.lastError) {
        return;
    }
    chrome.storage.local.get("registration_id", function(result) {
        $.ajax({
            url: link_for_update_ext_settings + '/1.js',
            method: 'delete',
            data: 'token=' + result.registration_id,
            dataType: 'json',
            xhrFields: {
                withCredentials: true
            },
            success: function(data){
                chrome.storage.local.set({registered: false});
                chrome.browserAction.setIcon({path: {"19": "img/icon_disable.png"}}, function(){});
            }
        });
    });

}
