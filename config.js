module.exports = {
  token: '', //Token to authenticate withdraw request's
  port: 3115, //Port on which it will listen for requests
  apiKey: '', //Steam api key
  doamin: 'csgoskinmine.com', //Your domain
  cancelTime: 600000, //Time after which offer will be automaticly canceld, default: 10 minutes
  valueMultiplier: 1000, // 

  bot: {
    name: '', //Steam account name
    password: '', //Steam account password
    shared_secret: '', //Account shared secret to generate 2fa keys
    identity_secret: '' //Account identity secret for steam mobile confirmations
  },
  
  mysql: {
    host: "localhost",
    user: "bot",
    password: "test",
    database: "csgoskinmine",
    multipleStatements: true
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