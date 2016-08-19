function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
  return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function printText(text) {
  document.getElementById('messages').value += '- ' + text + '\n';
}

var prefedinedIceServers = [
  // {
  //   "url": "stun:.."
  // },
  // {
  //   "url": "turn:..",
  //   "username": "*",
  //   "credential": "*"
  // }
];


var toggleIceAutoUI = function(onoff) {
	var container = document.getElementById('div-ice-servers');
	container.innerHTML = '';
	if (!onoff) {
		var i = 0;
		prefedinedIceServers.forEach(function(item) {
			container.innerHTML += '<label><input type="checkbox" value="' + i + '" checked> ' + item.url + ' </label>'
			i++;
		});
	}
};

window.onload = function () {
	document.getElementById('vc-form').style.display = 'block';
	document.getElementById('startButton').onclick = window.startVC;
	document.getElementById('input-ice-auto').onchange = function() {
		toggleIceAutoUI(this.checked);
	};
};
window.getVCUIConfig = function() {
	var iceServers = 'auto';
	if (!document.getElementById('input-ice-auto').checked) {
		iceServers = [];
		document.querySelectorAll('#div-ice-servers input').forEach(function(item) {
			if (item.checked) {
				var idx = parseInt(item.value, 0);
				iceServers.push(prefedinedIceServers[idx]);
			}
		});
	}
	
	window.vcConfig = {
		blockHost: document.getElementById('input-block-host').checked,
		blockStun: document.getElementById('input-block-stun').checked,
		blockRelay: document.getElementById('input-block-relay').checked,
		iceTransportPolicyRelay: document.getElementById('input-force-relay').checked,
		iceServers: iceServers
	};
	
	console.error("Using config: ", window.vcConfig);
	printText("Using config:" + JSON.stringify(window.vcConfig));
};


