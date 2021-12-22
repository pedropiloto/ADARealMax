function getPlotByCoord(x,y) {
  let obj = plotsData.filter(item => item.x === x && item.y == y);
  return obj[0];
}

function getPlotByName(plotName) {
  let obj = plotsData.filter(item => convertFromHex(item.asset_name) === plotName);
  return obj[0];
}

function searchPlotOnClick(elementId){
	clickedElement = document.getElementById(elementId);
		
	document.getElementById("x").value = clickedElement.getAttribute("x");
	document.getElementById("y").value = clickedElement.getAttribute("y");
	
	displayPlotDetailsByCoord()
}

function convertFromHex(hex) {
    var hex = hex.toString();
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}

function convertToHex(str) {
    var hex = '';
    for(var i=0;i<str.length;i++) {
        hex += ''+str.charCodeAt(i).toString(16);
    }
    return hex;
}

function clearSearch() {
	document.getElementById("x").value = "";
	document.getElementById("y").value = "";
	document.getElementById("plotName").value = "";
}

function showResults() {
	document.getElementById("resultsAsset").style.display = "block";
}


function displayPlotDetailsByCoord() {
  var x = document.getElementById("x").value;
  var y = document.getElementById("y").value;
  
  plotObj = getPlotByCoord(x,y);
  setLabels(plotObj);
}

function displayPlotDetailsByName() {
  var plotName = document.getElementById("plotName").value;
    
  plotObj = getPlotByName(plotName);
  setLabels(plotObj);
}

function displayPlotDetailsByAddress(policyId) {
	var walletAddress = document.getElementById("walletAddress").value;
	wallet = fetchWallet(walletAddress);
									
	walletPlots = wallet.tokens.filter(item => item.policy === policyId)
	
	paintWalletPlots(walletPlots);
	
	
	clearSearch();
	showResults();
}



function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();	
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function fetchPlotData(theUrl) {
	const response = httpGet(theUrl);
	const plotData = JSON.parse(response);
	return plotData;
}

function fetchWallet(walletAddress){

	const response =  httpGet("https://pool.pm/wallet/"+walletAddress);
	const walletData = JSON.parse(response);
	
	return walletData;
}

function setLabels (plotObj) {
	
	var plotName = convertFromHex(plotObj.asset_name);
	
	fetchPlotCNFTData(plotName).then(cnftData => {
	
		if(cnftData[0].asset.assetId == plotName) {
			cnftsearch = document.getElementById("cnftsearchlink");
			cnftsearch.innerHTML = (cnftData[0].price/1000000) + " ADA"
			cnftsearch.setAttribute('href', "https://cnft.io/token/"+cnftData[0]._id)
			cnftsearch.setAttribute('target',"_blank")
		}
		else {
			cnftsearch = document.getElementById("cnftsearchlink");
			cnftsearch.innerHTML = "Not on sale"
			cnftsearch.removeAttribute('href')
			cnftsearch.removeAttribute('target')
		}
		

		
	  document.getElementById("asset_name").innerHTML = plotName;
	  document.getElementById("policy_id").innerHTML = plotObj.policy_id;
	  document.getElementById("label_x").innerHTML = plotObj.x;
	  document.getElementById("label_y").innerHTML = plotObj.y;
	  
		
	  poolpmURL = "https://pool.pm/"+plotObj.policy_id+"."+plotName
	  poolpmGet = "https://pool.pm/asset/"+plotObj.policy_id+"."+plotName
	  poolpm = document.getElementById("poolpmlink");
		poolpm.innerHTML = poolpmURL
		poolpm.setAttribute('href', poolpmURL)
		poolpm.setAttribute('target',"_blank")
		
	  plotData = fetchPlotData(poolpmGet);

	  document.getElementById("ownerAddress").innerHTML = plotData.owner;
	  
	  paintPlot(plotObj);
	  clearSearch();
	  showResults();
	})
}

function getDataToForm(elementId) {
	clickedElement = document.getElementById(elementId);
	document.getElementById("x").value = clickedElement.getAttribute("x");
    document.getElementById("y").value = clickedElement.getAttribute("y");

}

function drawMap(){
	var canvas = document.getElementById("canvas");
	var my_context = canvas.getContext('2d');
		
	my_context.rect(0, 0, 800, 800);
	my_context.fillStyle = 'rgb(54, 52, 0)';

	var xvalue = 0;
	var yvalue = 0;

	for (var i = 0; i < plotsData.length; i++) { 
		my_context.fillRect((parseInt(plotsData[i].x)+100)*4+1, (parseInt(plotsData[i].y)+100)*4+1, 3, 3);
	}		
}


function paintPlot(plotObj) {
	var canvas = document.getElementById("canvas");
	
	var my_context = canvas.getContext('2d');
	
	var contextX = ((parseInt(plotObj.x)+100)*4+1)
	var contextY = ((parseInt(plotObj.y)+100)*4+1)
	
	plotImageData = my_context.getImageData(contextX,contextY,3,3).data
	
	if(plotImageData[0] == 0 && plotImageData[1] == 255 && plotImageData[2] == 17) {
		my_context.fillStyle = 'rgb(0, 255, 17)'
	}
	else {
		my_context.fillStyle = 'rgb(255, 179, 179)';
	}
	my_context.fillRect(contextX, contextY, 3, 3);
}

function paintWalletPlots(walletPlots) {
	var canvas = document.getElementById("canvas");
	
	var my_context = canvas.getContext('2d');
	
	for(var i=0; i<walletPlots.length; i++) {
		my_context.fillStyle = 'rgb(0, 255, 17)'
		my_context.fillRect((parseInt(walletPlots[i].metadata.Coordinates.x)+100)*4+1, (parseInt(walletPlots[i].metadata.Coordinates.y)+100)*4+1, 3, 3);
    }	
}

function getCursorPosition(event) {
	var x = event.offsetX;
	var y = event.offsetY;
	
	
	var mousex = event.clientX ;
	var mousey = event.clientY ;
	$( ".tooltip" ).css({
		"left" : mousex+10,
		"top" : mousey-20
	});
	
	
	plotX = Math.floor((x-1)/4-100);
	plotY =  Math.floor((y-1)/4-100);
	
	plotObj = getPlotByCoord(String(plotX),String(plotY));
	
	if(plotObj != null){
		var maptooltip = document.getElementById("maptooltip");
		var canvas = document.getElementById("canvas");
		
		canvas.setAttribute("x",plotObj.x)
	    canvas.setAttribute("y",plotObj.y)
		
		maptooltip.style.display = "inline-block"
		maptooltip.innerHTML = "Plot " +convertFromHex(plotObj.asset_name)+ "<br />" + plotObj.x + " , " + plotObj.y
	}
	else {
		
		clearToolTip();
	}
	


}

function clearToolTip(){
	maptooltip.style.display = "none"
}


async function fetchPlotCNFTData(plotName) {

	let response = await fetch("https://api.cnft.io/market/listings", {
	  "headers": {
		"accept": "application/json, text/plain, */*",
		"accept-language": "en-GB,en;q=0.9,en-US;q=0.8,pt;q=0.7,cs;q=0.6,es;q=0.5",
		"content-type": "application/json",
		"sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Microsoft Edge\";v=\"96\"",
		"sec-ch-ua-mobile": "?0",
		"sec-ch-ua-platform": "\"Windows\"",
		"sec-fetch-dest": "empty",
		"sec-fetch-mode": "cors",
		"sec-fetch-site": "same-site",
		"Referer": "https://cnft.io/",
		"Referrer-Policy": "strict-origin-when-cross-origin"
	  },
	  "body": "{\"search\":\""+plotName+"\",\"types\":[\"listing\",\"auction\",\"offer\"],\"project\":\"Ada Realm\",\"sort\":{\"_id\":-1},\"priceMin\":null,\"priceMax\":null,\"page\":1,\"verified\":true,\"nsfw\":false,\"sold\":false,\"smartContract\":false}",
	  "method": "POST"
	});
	
	let data = await response.json()
	
	return data.results
}


