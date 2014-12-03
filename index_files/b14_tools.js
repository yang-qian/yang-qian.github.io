function userDebug(user, output) {
	if(user==-1 || Drupal.settings.user == user) {
		if(window.console) {
			window.console.log(output);
		} else {
			// alert(output);
		}
	}
}