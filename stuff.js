var interval = setInterval(() => {
    fetch("http://developer.itsmarta.com/RealtimeTrain/RestServiceNextTrain/GetRealtimeArrivals?apikey=49741de7-d606-46f9-aecc-d36a1d1963e9").then(function (response) {
        var contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function (json) {
                const trainList = document.getElementById("train-list");
                var items = trainList.querySelectorAll('li');
                Array.prototype.forEach.call(items, (item) => { 
                    trainList.removeChild(item);
                })

                json.forEach((train) => {
                    var node = document.createElement("li");
                    var textnode = document.createTextNode(train.TRAIN_ID);
                    node.appendChild(textnode);
                    document.getElementById("train-list").appendChild(node);
                })
            });
        } else {
            console.log("Oops, we haven't got JSON!");
        }
    });

}, 1000);
function STAHP() { 
    window.clearInterval(interval);
}

