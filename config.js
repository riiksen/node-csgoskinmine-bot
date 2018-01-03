module.exports = {
	token: '', //Token to authenticate withdraw request's
	apiKey: '', //Steam api key

	bot: {
		name: '', //Steam account name
		password: '', //Steam account password
		shared_secret: '', //Account shared secret to generate 2fa keys
		identity_secret: '' //Account identity secret for steam mobile confirmations
	},
	
	mysql: {
		host: "localhost",
		user: "",
		password: "",
		database: ""
	},

	//Not in use yet
	//Bots for multiple bot accounts support
	bots: [
		{
			name: '',
			password: '',
			shared_secret: '',
			identity_secret: ''
		}
	]
}