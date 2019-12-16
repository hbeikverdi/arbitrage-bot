require('dotenv').config();

const telegramToken = process.env.TELEGRAM_TOKEN || '734199382:AAEw3sxbInt-FkcC1431aiuK39MqSOH594I';
const telegramGroup = process.env.TELEGRAM_GROUP || '91555670';

const TelegramBot = require('node-telegram-bot-api');
const EXIR = require('hollaex-node-lib');
const binance = require('node-binance-api')().options({
	APIKEY: '<key>',
	APISECRET: '<secret>',
	useServerTime: true,
	test: true
});

//var client=new EXIR()
var client = new EXIR({apiURL: 'https://api.exir.io', baseURL: '/v0', accessToken:''});

var Exireth,Exirbch,Binanceeth, Binancebch,Exireb, Binanceeb ,btc_ask,btc_bid , eth_ask , eth_bid , bch_ask , bch_bid


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


	const socket = client.connect('orderbook');
	socket.on('orderbook', (data) => {
		try{
	    if (data.hasOwnProperty("btc-tmn"))
	    {
	      btc_ask=data["btc-tmn"].asks[0][0]
				btc_bid=data["btc-tmn"].bids[0][0]
	    }

	    if(data.hasOwnProperty("eth-tmn"))
	    {
	      eth_bid=data["eth-tmn"].bids[0][0]
	      eth_ask=data["eth-tmn"].asks[0][0]
	    }

	    if(data.hasOwnProperty("bch-tmn"))
	    {
	        bch_bid=data["bch-tmn"].bids[0][0]
	        bch_ask=data["bch-tmn"].asks[0][0]
	    }
		}

		catch(e)
		{
			console.error(e);
		}

	})

	binance.websockets.chart("ETHBTC", "1m", (symbol, interval, chart) => {
try {

	  let tick = binance.last(chart);
	  const last = chart[tick].close;
	  //console.log(chart);
	  // Optionally convert 'chart' object to array:
	  // let ohlc = binance.ohlc(chart);
	  // console.log(symbol, ohlc);
	  console.log(symbol+" last price: "+last)

	  Exireth = (eth_bid / btc_ask);

	  Binanceeth = (eth_ask / btc_bid);

	  if( (Exireth*10000)/10047 > last )
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Sell ETH in Exir)");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Sell ETH in Exir)");

	    }

	 /* if ((Binanceeth*10000)/9953 < last )
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Buy ETH in Exir)");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Buy ETH in Exir)")
	    }
*/

}

catch(e)
{
	console.error(e);
}
	});


	binance.websockets.chart("BCHBTC", "1m", (symbol, interval, chart) => {
		try{

	  let tick = binance.last(chart);
	  const last = chart[tick].close;
	  //console.log(chart);
	  // Optionally convert 'chart' object to array:
	  // let ohlc = binance.ohlc(chart);
	  // console.log(symbol, ohlc);

	  console.log(symbol+" last price: "+last)

	  Exirbch = (bch_bid / btc_ask);

	  Binancebch = (bch_ask / btc_bid);

	  if( (Exirbch*10000)/10047 > last)
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Sell BCH in Exir)");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Sell BCH in Exir)");
				//setTimeout(calculatePrices(),10000)
	    }

	/*  if ((Binancebch*10000)/9953 < last)
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Buy BCH in Exir)");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Buy BCH in Exir)")
	    }
*/
}

catch(e)
{
	console.error(e);
}

	});

/*
	binance.websockets.chart("BCCETH", "1m", (symbol, interval, chart) => {
	  let tick = binance.last(chart);
	  const last = chart[tick].close;
	  //console.log(chart);
	  // Optionally convert 'chart' object to array:
	  // let ohlc = binance.ohlc(chart);
	  // console.log(symbol, ohlc);

	  console.log(symbol+" last price: "+last)

	  Exireb = (bch_bid / eth_ask);

	  Binanceeb = (bch_ask / eth_bid);

	  if( (Exireb*10000)/10047 > last)
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Sell BCH in Exir (ETH pair))");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Sell BCH in Exir) (ETH pair)");

	    }

	  if ((Binanceeb*10000)/9953 < last)
	    {
	      console.log("******** EYVAL :) ************    (arbitrage : Buy BCH in Exir) (ETH pair)");
	      sendNotification("******** EYVAL :) ************    (arbitrage : Buy BCH in Exir) (ETH pair)")
	    }


	});
	*/


}

	calculatePrices();
