require('dotenv').config();

const telegramToken = process.env.TELEGRAM_TOKEN || '';
const telegramGroup = process.env.TELEGRAM_GROUP || '';

const TelegramBot = require('node-telegram-bot-api');
const EXIR = require('hollaex-node-lib');
const binance = require('node-binance-api')().options({
	APIKEY: '<key>',
	APISECRET: '<secret>',
	useServerTime: true, 
	test: true 
});

const exir = new EXIR({apiURL: 'https://api.exir.tech', baseURL: '/v0', accessToken:''});
var Exir,Binance,btc_ask,btc_bid , eth_ask , eth_bid , binance_eth


/*********************************************************
TELEGRAM BOT
*********************************************************/
const bot = new TelegramBot(telegramToken, {polling: true});

bot.onText(/^/, (msg, match) => {

	const chatId = msg.chat.id;
	let message = "ARBITRAGE BOT is working";
	
	bot.sendMessage(chatId, message);
});

// Send a notifitcation message to a telegram group with /message/ as parameter
const sendNotification = (message) => {
	try {
		bot.sendMessage(telegramGroup, message);
	} catch(err) {
		console.error(err)
	}
}


/*********************************************************
PRICE CALCULATION
*********************************************************/
const calculatePrices =  () => {
	binance.prices('ETHBTC', (error, ticker)  => {
		console.log("Price of ETH: ", ticker.ETHBTC);
		binance_eth=ticker.ETHBTC
	})

	exir.getOrderbook('btc-tmn')
		.then(res => {
			let data = JSON.parse(res)
			btc_ask=data["btc-tmn"].asks[0][0]
			btc_bid=data["btc-tmn"].bids[0][0]
		})
		.catch(err => {
			console.log(err);
		});


	 exir.getOrderbook('eth-tmn')
		.then(res => {
			let data = JSON.parse(res)
			eth_bid=data["eth-tmn"].bids[0][0]
			eth_ask=data["eth-tmn"].asks[0][0]
		})
		.catch(err => {
			console.log(err);
		});
		

		Exir = (eth_bid / btc_ask);

		Binance = (eth_ask / btc_bid);

	if( (Exir*10000)/10024 > binance_eth )
		{
			console.log("******** EYVAL :) ************    (arbitrage : Sell ETH in Exir)");

		} 
			 
	if ((Binance*10000)/9976 < binance_eth )
		{
			console.log("******** EYVAL :) ************    (arbitrage : Buy ETH in Exir)");
		}
}

setInterval(() => {
	calculatePrices();
}, 7000);