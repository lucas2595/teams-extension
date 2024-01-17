/*
Teams web has an annoying dialog when you open multiple tabs. When you say you're still
there, it reloads the page, kicking you from a meeting if you're one.
This code removes the dialog. You'll still be in the meeting if you were in one, but
your teams will be in an unsinchronized state. Everyone else will appear offline to you,
and no messages will be sent until you reload the page.
*/

const removeAnnoyingDialog = () => {
	setTimeout(removeAnnoyingDialog, 30000);
	try {
		let annoyingDialog = document.querySelector("div.ngdialog.ts-modal-dialog.ts-confirm-modal-dialog.ts-image-confirm-dialog")
		if(annoyingDialog.children[1].children[0].children[1].textContent.includes("Are you still there?")){
			annoyingDialog.remove()
			console.log("removed annoying dialog :)")
		}
		
	} catch (e) {
		console.log(e)
	}
}

removeAnnoyingDialog()
