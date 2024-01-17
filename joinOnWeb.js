/*
When you join a teams meeting in your browser through a link, it asks if
you wish to open the desktop app. This code skipts the check, redirecting
you straight to the web meeting link.

Extra instructions:

Add the following to `/etc/opt/chrome/policies/managed/managed_policies.json`

```
{
    "ExternalProtocolDialogShowAlwaysOpenCheckbox": true,
    "URLBlocklist": [
        "msteams://*",
        "teams://*"
    ]
}
```

and then run `sudo chmod -R 775 /etc/opt/chrome/policies/managed`
*/

window.stop();
try {
  document.querySelector("button[data-tid=joinOnWeb]").click();
} catch (e) {
  window.navigation.navigate(
    decodeURIComponent(
      window.location.href.replace(/^.*url=/, "https://teams.microsoft.com")
    )
  );
}
