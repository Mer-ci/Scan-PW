function findPassForm () {
	nbForm = document.forms.length;
	if (nbForm>0) {
		for (var i = 0; i < nbForm; i++) {
			form = document.forms[i];
			nbInput = form.length;
			if (nbForm>0) {
				for (var i = 0; i < nbInput; i++) {
					if (form[i].type == "password") {
						form[i].value = 'testpass';
						alert('password :'+form[i].value);
					};
				};
			};
		}
	};
	
}

function init () {

	findPassForm();
}