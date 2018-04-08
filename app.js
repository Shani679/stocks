const app=angular.module("app", []);
app.controller('Stocks', ($scope, $http)=>{
	$scope.loader = true;
	$scope.generateChart = (divId, data) => {
		var chart = AmCharts.makeChart(divId, {
		  "type": "stock",
		  "theme": "dark",
		  "categoryAxesSettings": {
		    "minPeriod": "mm"
		  },

		  "dataSets": [ {
		    "color": "rgb(104, 104, 132)",
		    "fieldMappings": [ {
		      "fromField": "value",
		      "toField": "value"
		    }, {
		      "fromField": "volume",
		      "toField": "volume"
		    } ],

		    "dataProvider": data,
		    "categoryField": "date"
		  } ],

		  "panels": [ {
		    "showCategoryAxis": false,
		    "title": "Value",
		    "percentHeight": 70,

		    "stockGraphs": [ {
		      "id": "g1",
		      "valueField": "value",
		      "type": "smoothedLine",
		      "lineThickness": 2,
		      "bullet": "round"
		    } ],


		    "stockLegend": {
		      "valueTextRegular": " ",
		      "markerType": "none"
		    }
		  }, {
		    "title": "Volume",
		    "percentHeight": 30,
		    "stockGraphs": [ {
		      "valueField": "volume",
		      "type": "column",
		      "cornerRadiusTop": 2,
		      "fillAlphas": 1
		    } ],

		    "stockLegend": {
		      "valueTextRegular": " ",
		      "markerType": "none"
		    }
		  } ],

		  "chartScrollbarSettings": {
		    "graph": "g1",
		    "enabled": false,
		    "usePeriod": "10mm",
		    "position": "top"
		  },

		  "chartCursorSettings": {
		    "valueBalloonsEnabled": true
		  },

		  "panelsSettings": {
		    "usePrefixes": false
		  },

		} );
	}

	const stockDataHandler = (data, stockName, callback) => {
		const symbol = data["Meta Data"]["2. Symbol"];
		const timeSeriesObj = data["Time Series (60min)"];
		const lastDataPoint = Object.keys(timeSeriesObj)[0];
		const open = timeSeriesObj[lastDataPoint]["1. open"];
		const close = timeSeriesObj[lastDataPoint]["4. close"];
		const difference = close-open;
		const trend = (close-open)/open*100;
		const stockHistory = [];
		for (let i = 0; i < 7; i++) {
			let timeStamp = Object.keys(timeSeriesObj)[i];
			stockHistory.unshift({date: new Date(timeStamp), value: timeSeriesObj[timeStamp]["4. close"], volume: timeSeriesObj[timeStamp]["5. volume"]})
		}
		callback(null, {stockHistory, name: stockName, close, symbol, difference, trend});
	}

	async.parallel([
	    callback => {
	    	$http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=AMZN&interval=60min&apikey=75S7EKHI7ZHR0OOR').then(data=>{
				stockDataHandler(data.data, 'Amazon.com', callback);
			})
	    },
	    callback => {
	        $http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=SPX&interval=60min&apikey=75S7EKHI7ZHR0OOR').then(data=>{
				stockDataHandler(data.data, 'S&P 500', callback);
			})
	    },
	    callback => {
	    	$http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=IXIC&interval=60min&apikey=75S7EKHI7ZHR0OOR').then(data=>{
				stockDataHandler(data.data, 'Nasdaq', callback);
			})
	    },
	    callback => {
	    	$http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=DJI&interval=60min&apikey=75S7EKHI7ZHR0OOR').then(data=>{
				stockDataHandler(data.data, 'Dow 30', callback);
			})
	    },
	    callback => {
	    	$http.get('https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=GOOGL&interval=60min&apikey=75S7EKHI7ZHR0OOR').then(data=>{
				stockDataHandler(data.data, 'Alphabet Inc', callback);
			})
	    }
	],
	(err, results) => {
		$scope.loader = false;
		$scope.stocks = results
	});
})