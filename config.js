module.exports = {
  token: '', //Token to authenticate withdraw request's
  apiKey: '', //Steam api key
  doamin: 'csgoskinmine.com', //Your domain
  cancelTime: '600000', //Time after which offer will be automaticly canceld, default: 10 minutes
  valueMultiplier: '100000', // Not in use yet

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