var parseCandidate = function(text) {
	var candidateStr, fields, pos;
	candidateStr = 'candidate:';
	pos = text.indexOf(candidateStr) + candidateStr.length;
	fields = text.substr(pos).split(' ');
	return {
		'component': fields[1],
		'type': fields[7],
		'foundation': fields[0],
		'protocol': fields[2],
		'address': fields[4],
		'port': fields[5],
		'priority': fields[3]
	};
};
var shouldBlock = function(cand) {
	if (window.vcConfig) {
		if (window.vcConfig.blockHost && cand == 'host') return true;
		if (window.vcConfig.blockStun && cand == 'srflx') return true;
		if (window.vcConfig.blockRelay && cand == 'relay') return true;
	}
	
	return;
};


/*global L*/
/*
 * Class EventDispatcher provides event handling to sub-classes.
 * It is inherited from Publisher, Room, etc.
 */
var Erizo = Erizo || {};
Erizo.EventDispatcher = function (spec) {
    "use strict";
    var that = {};
    // Private vars
    spec.dispatcher = {};
    spec.dispatcher.eventListeners = {};

    // Public functions

    // It adds an event listener attached to an event type.
    that.addEventListener = function (eventType, listener) {
        if (spec.dispatcher.eventListeners[eventType] === undefined) {
            spec.dispatcher.eventListeners[eventType] = [];
        }
        spec.dispatcher.eventListeners[eventType].push(listener);
    };

    // It removes an available event listener.
    that.removeEventListener = function (eventType, listener) {
        var index;
        index = spec.dispatcher.eventListeners[eventType].indexOf(listener);
        if (index !== -1) {
            spec.dispatcher.eventListeners[eventType].splice(index, 1);
        }
    };

    // It dispatch a new event to the event listeners, based on the type 
    // of event. All events are intended to be LicodeEvents.
    that.dispatchEvent = function (event) {
        var listener;
        L.Logger.debug("Event: " + event.type);
        for (listener in spec.dispatcher.eventListeners[event.type]) {
            if (spec.dispatcher.eventListeners[event.type].hasOwnProperty(listener)) {
                spec.dispatcher.eventListeners[event.type][listener](event);
            }
        }
    };

    return that;
};

// **** EVENTS ****

/*
 * Class LicodeEvent represents a generic Event in the library.
 * It handles the type of event, that is important when adding
 * event listeners to EventDispatchers and dispatching new events. 
 * A LicodeEvent can be initialized this way:
 * var event = LicodeEvent({type: "room-connected"});
 */
Erizo.LicodeEvent = function (spec) {
    "use strict";
    var that = {};

    // Event type. Examples are: 'room-connected', 'stream-added', etc.
    that.type = spec.type;

    return that;
};

/*
 * Class RoomEvent represents an Event that happens in a Room. It is a
 * LicodeEvent.
 * It is usually initialized as:
 * var roomEvent = RoomEvent({type:"room-connected", streams:[stream1, stream2]});
 * Event types:
 * 'room-connected' - points out that the user has been successfully connected to the room.
 * 'room-disconnected' - shows that the user has been already disconnected.
 */
Erizo.RoomEvent = function (spec) {
    "use strict";
    var that = Erizo.LicodeEvent(spec);

    // A list with the streams that are published in the room.
    that.streams = spec.streams;
    that.message = spec.message;

    return that;
};

/*
 * Class StreamEvent represents an event related to a stream. It is a LicodeEvent.
 * It is usually initialized this way:
 * var streamEvent = StreamEvent({type:"stream-added", stream:stream1});
 * Event types:
 * 'stream-added' - indicates that there is a new stream available in the room.
 * 'stream-removed' - shows that a previous available stream has been removed from the room.
 */
Erizo.StreamEvent = function (spec) {
    "use strict";
    var that = Erizo.LicodeEvent(spec);

    // The stream related to this event.
    that.stream = spec.stream;

    that.msg = spec.msg;
    that.bandwidth = spec.bandwidth;

    return that;
};

/*
 * Class PublisherEvent represents an event related to a publisher. It is a LicodeEvent.
 * It usually initializes as:
 * var publisherEvent = PublisherEvent({})
 * Event types:
 * 'access-accepted' - indicates that the user has accepted to share his camera and microphone
 */
Erizo.PublisherEvent = function (spec) {
    "use strict";
    var that = Erizo.LicodeEvent(spec);

    return that;
};
/*global window, console, RTCSessionDescription, RoapConnection, webkitRTCPeerConnection*/

var Erizo = Erizo || {};

Erizo.FcStack = function (spec) {
    "use strict";
/*
        spec.callback({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp
        });
*/
    var that = {};

    that.pc_config = {};

    that.peerConnection = {};
    that.desc = {};
    that.signalCallback = undefined;

    that.close = function(){
        console.log("Close FcStack");
    }

    that.createOffer = function(isSubscribe){
        console.log("FCSTACK: CreateOffer");
    };

    that.addStream = function(stream){
        console.log("FCSTACK: addStream", stream);
    };
    
    that.processSignalingMessage = function(msg){
        console.log("FCSTACK: processSignaling", msg);
        if(that.signalCallback!==undefined)
            that.signalCallback(msg);
    }

    that.sendSignalingMessage = function(msg){
        console.log("FCSTACK: Sending signaling Message", msg);
        spec.callback(msg);
    };
   
    that.setSignalingCallback = function(callback){
        console.log("FCSTACK: Setting signalling callback");
        that.signalCallback = callback;
    }
    return that;
};
/*global window, console, RTCSessionDescription, RoapConnection, webkitRTCPeerConnection*/

var Erizo = Erizo || {};

Erizo.ChromeStableStack = function (spec) {
    "use strict";

    var that = {},
        WebkitRTCPeerConnection = webkitRTCPeerConnection;

    that.pc_config = {
        "iceServers": []
    };


    that.con = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

    if (spec.iceServers !== undefined) {
        that.pc_config.iceServers = spec.iceServers;
    }

    if (spec.audio === undefined) {
        spec.audio = true;
    }

    if (spec.video === undefined) {
        spec.video = true;
    }

    that.mediaConstraints = {
        mandatory: {
            'OfferToReceiveVideo': spec.video,
            'OfferToReceiveAudio': spec.audio
        }
    };

    var errorCallback = function (message) {
        L.Logger.error("Error in Stack ", message);
    }

		if (window.vcConfig && window.vcConfig.iceTransportPolicyRelay) {
			that.pc_config.iceTransports = 'relay';
			that.pc_config.iceTransportPolicy = 'relay';
		}
		if (window.vcConfig && window.vcConfig.iceServers && Object.prototype.toString.call(window.vcConfig.iceServers) === '[object Array]') {
			spec.iceServers = window.vcConfig.iceServers;
		}
		console.error("go!", that.pc_config, that.con);
    that.peerConnection = new WebkitRTCPeerConnection(that.pc_config, that.con);

    var setMaxBW = function (sdp) {
        if (spec.video && spec.maxVideoBW) {
            sdp = sdp.replace(/b=AS:.*\r\n/g, "");
            var a = sdp.match(/m=video.*\r\n/);
            if (a == null) {
                a = sdp.match(/m=video.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxVideoBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        if (spec.audio && spec.maxAudioBW) {
            var a = sdp.match(/m=audio.*\r\n/);
            if (a == null) {
                a = sdp.match(/m=audio.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxAudioBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }
        return sdp;
    };

    /**
     * Closes the connection.
     */
    that.close = function () {
        that.state = 'closed';
        that.peerConnection.close();
    };

    spec.localCandidates = [];

    that.peerConnection.onicecandidate = function (event) {
        var candidateObject = {};
        if (!event.candidate) {
            L.Logger.info("Gathered all candidates. Sending END candidate");
            candidateObject = {
                sdpMLineIndex: -1 ,
                sdpMid: "end",
                candidate: "end"
            };
        }else{
					var pcand = parseCandidate(event.candidate.candidate);
					if (shouldBlock(pcand.type)) return;
					console.error('cand',pcand.type, pcand);

            if (!event.candidate.candidate.match(/a=/)) {
                event.candidate.candidate = "a=" + event.candidate.candidate;
            };

            candidateObject = {
                sdpMLineIndex: event.candidate.sdpMLineIndex,
                sdpMid: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            };
        }

        if (spec.remoteDescriptionSet) {
            spec.callback({type: 'candidate', candidate: candidateObject});
        } else {
            spec.localCandidates.push(candidateObject);
            L.Logger.info("Storing candidate: ", spec.localCandidates.length, candidateObject);
        }

    };

    that.peerConnection.onaddstream = function (stream) {
        if (that.onaddstream) {
            that.onaddstream(stream);
        }
    };

    that.peerConnection.onremovestream = function (stream) {
        if (that.onremovestream) {
            that.onremovestream(stream);
        }
    };
  
    that.peerConnection.oniceconnectionstatechange = function (ev) {
        if (that.oniceconnectionstatechange){
            that.oniceconnectionstatechange(ev.target.iceConnectionState);
        }
    }

    var localDesc;
    var remoteDesc;

    var setLocalDesc = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
        sessionDescription.sdp = sessionDescription.sdp.replace(/a=ice-options:google-ice\r\n/g, "");
        spec.callback({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp
        });
        localDesc = sessionDescription;
        //that.peerConnection.setLocalDescription(sessionDescription);
    }

    var setLocalDescp2p = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
        spec.callback({
            type: sessionDescription.type,
            sdp: sessionDescription.sdp
        });
        localDesc = sessionDescription;
        that.peerConnection.setLocalDescription(sessionDescription);
    }

    that.updateSpec = function (config, callback){
        if (config.maxVideoBW || config.maxAudioBW ){
            if (config.maxVideoBW){
                L.Logger.debug ("Maxvideo Requested", config.maxVideoBW, "limit", spec.limitMaxVideoBW);
                if (config.maxVideoBW > spec.limitMaxVideoBW) {
                    config.maxVideoBW = spec.limitMaxVideoBW;
                }
                spec.maxVideoBW = config.maxVideoBW; 
                L.Logger.debug ("Result", spec.maxVideoBW);
            }
            if (config.maxAudioBW) {
                if (config.maxAudioBW > spec.limitMaxAudioBW) {
                    config.maxAudioBW = spec.limitMaxAudioBW;
                }
                spec.maxAudioBW = config.maxAudioBW;
            }

            localDesc.sdp = setMaxBW(localDesc.sdp);
            if (config.Sdp || config.maxAudioBW){
                L.Logger.debug ("Updating with SDP renegotiation", spec.maxVideoBW);
                that.peerConnection.setLocalDescription(localDesc, function () {
                    remoteDesc.sdp = setMaxBW(remoteDesc.sdp);
                    that.peerConnection.setRemoteDescription(new RTCSessionDescription(remoteDesc), function () {
                        spec.remoteDescriptionSet = true;
                        spec.callback({type:'updatestream', sdp: localDesc.sdp});
                    });
                }, function (error){
                    L.Logger.error("Error updating configuration", error);
                    callback('error');
                });

            } else {
                L.Logger.debug ("Updating without SDP renegotiation, newVideoBW:", spec.maxVideoBW, "newAudioBW:", spec.maxAudioBW);
                spec.callback({type:'updatestream', sdp: localDesc.sdp});
            }
        }
        if (config.minVideoBW || (config.slideShowMode!==undefined)){
            L.Logger.debug ("MinVideo Changed to ", config.minVideoBW);
            L.Logger.debug ("SlideShowMode Changed to ", config.slideShowMode);
            spec.callback({type:'updatestream', config:config});            
        }   
    };

    that.createOffer = function (isSubscribe) {
        if (isSubscribe === true) {
            that.peerConnection.createOffer(setLocalDesc, errorCallback, that.mediaConstraints);
        } else {
            that.peerConnection.createOffer(setLocalDesc, errorCallback);
        }

    };

    that.addStream = function (stream) {
        that.peerConnection.addStream(stream);
    };
    spec.remoteCandidates = [];

    spec.remoteDescriptionSet = false;

    that.processSignalingMessage = function (msg) {
        //L.Logger.info("Process Signaling Message", msg);

        if (msg.type === 'offer') {
            msg.sdp = setMaxBW(msg.sdp);
            that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg), function () {
                that.peerConnection.createAnswer(setLocalDescp2p, function (error) {
                    L.Logger.error("Error: ", error);
                }, that.mediaConstraints);
                spec.remoteDescriptionSet = true;
            }, function (error) {
                L.Logger.error("Error setting Remote Description", error)
            });


        } else if (msg.type === 'answer') {


            // // For compatibility with only audio in Firefox Revisar
            // if (answer.match(/a=ssrc:55543/)) {
            //     answer = answer.replace(/a=sendrecv\\r\\na=mid:video/, 'a=recvonly\\r\\na=mid:video');
            //     answer = answer.split('a=ssrc:55543')[0] + '"}';
            // }

            L.Logger.info("Set remote and local description");
            L.Logger.debug("Remote Description", msg.sdp);
            L.Logger.debug("Local Description", localDesc.sdp);

            msg.sdp = setMaxBW(msg.sdp);

            remoteDesc = msg;
            that.peerConnection.setLocalDescription(localDesc, function () {
                that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg), function () {
                    spec.remoteDescriptionSet = true;
                    L.Logger.info("Candidates to be added: ", spec.remoteCandidates.length, spec.remoteCandidates);
                    while (spec.remoteCandidates.length > 0) {
                        // IMPORTANT: preserve ordering of candidates
                        that.peerConnection.addIceCandidate(spec.remoteCandidates.shift());
                    }
                    L.Logger.info("Local candidates to send:", spec.localCandidates.length);
                    while (spec.localCandidates.length > 0) {
                        // IMPORTANT: preserve ordering of candidates
                        spec.callback({type: 'candidate', candidate: spec.localCandidates.shift()});
                    }

                });
            });

        } else if (msg.type === 'candidate') {
            try {
                var obj;
                if (typeof(msg.candidate) === 'object') {
                    obj = msg.candidate;
                } else {
                    obj = JSON.parse(msg.candidate);
                }
                obj.candidate = obj.candidate.replace(/a=/g, "");
                obj.sdpMLineIndex = parseInt(obj.sdpMLineIndex);
                var candidate = new RTCIceCandidate(obj);
                if (spec.remoteDescriptionSet) {
                    that.peerConnection.addIceCandidate(candidate);
                } else {
                    spec.remoteCandidates.push(candidate);
                }
            } catch (e) {
                L.Logger.error("Error parsing candidate", msg.candidate);
            }
        }
    }

    return that;
};
/*global window, console, RTCSessionDescription, RoapConnection, webkitRTCPeerConnection*/

var Erizo = Erizo || {};

Erizo.ChromeCanaryStack = function (spec) {
    "use strict";

    var that = {},
        WebkitRTCPeerConnection = webkitRTCPeerConnection;

    that.pc_config = {
        "iceServers": []
    };

    that.con = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

    if (spec.stunServerUrl !== undefined) {
        that.pc_config.iceServers.push({"url": spec.stunServerUrl});
    }

    if ((spec.turnServer || {}).url) {
        that.pc_config.iceServers.push({"username": spec.turnServer.username, "credential": spec.turnServer.password, "url": spec.turnServer.url});
    }

    if (spec.audio === undefined || spec.nop2p) {
        spec.audio = true;
    }

    if (spec.video === undefined || spec.nop2p) {
        spec.video = true;
    }

    that.mediaConstraints = {
        'mandatory': {
            'OfferToReceiveVideo': spec.video,
            'OfferToReceiveAudio': spec.audio
        }
    };

    that.roapSessionId = 103;

		if (window.vcConfig && window.vcConfig.iceTransportPolicyRelay) {
			that.pc_config.iceTransports = 'relay';
			that.pc_config.iceTransportPolicy = 'relay';
		}
		if (window.vcConfig && window.vcConfig.iceServers && Object.prototype.toString.call(window.vcConfig.iceServers) === '[object Array]') {
			spec.iceServers = window.vcConfig.iceServers;
		}
		console.error("go!", that.pc_config, that.con);
    that.peerConnection = new WebkitRTCPeerConnection(that.pc_config, that.con);

    that.peerConnection.onicecandidate = function (event) {
        L.Logger.debug("PeerConnection: ", spec.session_id);
        if (!event.candidate) {
            // At the moment, we do not renegotiate when new candidates
            // show up after the more flag has been false once.
            L.Logger.debug("State: " + that.peerConnection.iceGatheringState);

            if (that.ices === undefined) {
                that.ices = 0;
            }
            that.ices = that.ices + 1;
            if (that.ices >= 1 && that.moreIceComing) {
                that.moreIceComing = false;
                that.markActionNeeded();
            }
        } else {
					var pcand = parseCandidate(event.candidate.candidate);
					if (shouldBlock(pcand.type)) return;
					console.error('cand',pcand.type, pcand);
            that.iceCandidateCount += 1;
        }
    };

    //L.Logger.debug("Created webkitRTCPeerConnnection with config \"" + JSON.stringify(that.pc_config) + "\".");

    var setMaxBW = function (sdp) {
        if (spec.maxVideoBW) {
            var a = sdp.match(/m=video.*\r\n/);
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxVideoBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        if (spec.maxAudioBW) {
            var a = sdp.match(/m=audio.*\r\n/);
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxAudioBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        return sdp;
    };

    /**
     * This function processes signalling messages from the other side.
     * @param {string} msgstring JSON-formatted string containing a ROAP message.
     */
    that.processSignalingMessage = function (msgstring) {
        // Offer: Check for glare and resolve.
        // Answer/OK: Remove retransmit for the msg this is an answer to.
        // Send back "OK" if this was an Answer.
        L.Logger.debug('Activity on conn ' + that.sessionId);
        var msg = JSON.parse(msgstring), sd, regExp, exp;
        that.incomingMessage = msg;

        if (that.state === 'new') {
            if (msg.messageType === 'OFFER') {
                // Initial offer.
                sd = {
                    sdp: msg.sdp,
                    type: 'offer'
                };
                that.peerConnection.setRemoteDescription(new RTCSessionDescription(sd));

                that.state = 'offer-received';
                // Allow other stuff to happen, then reply.
                that.markActionNeeded();
            } else {
                that.error('Illegal message for this state: ' + msg.messageType + ' in state ' + that.state);
            }

        } else if (that.state === 'offer-sent') {
            if (msg.messageType === 'ANSWER') {

                //regExp = new RegExp(/m=video[\w\W]*\r\n/g);

                //exp = msg.sdp.match(regExp);
                //L.Logger.debug(exp);

                //msg.sdp = msg.sdp.replace(regExp, exp + "b=AS:100\r\n");

                sd = {
                    sdp: msg.sdp,
                    type: 'answer'
                };
                L.Logger.debug("Received ANSWER: ", sd.sdp);

                sd.sdp = setMaxBW(sd.sdp);

                that.peerConnection.setRemoteDescription(new RTCSessionDescription(sd));
                that.sendOK();
                that.state = 'established';

            } else if (msg.messageType === 'pr-answer') {
                sd = {
                    sdp: msg.sdp,
                    type: 'pr-answer'
                };
                that.peerConnection.setRemoteDescription(new RTCSessionDescription(sd));

                // No change to state, and no response.
            } else if (msg.messageType === 'offer') {
                // Glare processing.
                that.error('Not written yet');
            } else {
                that.error('Illegal message for this state: ' + msg.messageType + ' in state ' + that.state);
            }

        } else if (that.state === 'established') {
            if (msg.messageType === 'OFFER') {
                // Subsequent offer.
                sd = {
                    sdp: msg.sdp,
                    type: 'offer'
                };
                that.peerConnection.setRemoteDescription(new RTCSessionDescription(sd));

                that.state = 'offer-received';
                // Allow other stuff to happen, then reply.
                that.markActionNeeded();
            } else {
                that.error('Illegal message for this state: ' + msg.messageType + ' in state ' + that.state);
            }
        }
    };

    /**
     * Adds a stream - this causes signalling to happen, if needed.
     * @param {MediaStream} stream The outgoing MediaStream to add.
     */
    that.addStream = function (stream) {
        that.peerConnection.addStream(stream);
        that.markActionNeeded();
    };

    /**
     * Removes a stream.
     * @param {MediaStream} stream The MediaStream to remove.
     */
    that.removeStream = function (stream) {
//        var i;
//        for (i = 0; i < that.peerConnection.localStreams.length; ++i) {
//            if (that.localStreams[i] === stream) {
//                that.localStreams[i] = null;
//            }
//        }
        that.markActionNeeded();
    };

    /**
     * Closes the connection.
     */
    that.close = function () {
        that.state = 'closed';
        that.peerConnection.close();
    };

    /**
     * Internal function: Mark that something happened.
     */
    that.markActionNeeded = function () {
        that.actionNeeded = true;
        that.doLater(function () {
            that.onstablestate();
        });
    };

    /**
     * Internal function: Do something later (not on this stack).
     * @param {function} what Callback to be executed later.
     */
    that.doLater = function (what) {
        // Post an event to myself so that I get called a while later.
        // (needs more JS/DOM info. Just call the processing function on a delay
        // for now.)
        window.setTimeout(what, 1);
    };

    /**
     * Internal function called when a stable state
     * is entered by the browser (to allow for multiple AddStream calls or
     * other interesting actions).
     * This function will generate an offer or answer, as needed, and send
     * to the remote party using our onsignalingmessage function.
     */
    that.onstablestate = function () {
        var mySDP, roapMessage = {};
        if (that.actionNeeded) {
            if (that.state === 'new' || that.state === 'established') {
                // See if the current offer is the same as what we already sent.
                // If not, no change is needed.

                that.peerConnection.createOffer(function (sessionDescription) {

                    //sessionDescription.sdp = newOffer.replace(/a=ice-options:google-ice\r\n/g, "");
                    //sessionDescription.sdp = newOffer.replace(/a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:.*\r\n/g, "a=crypto:0 AES_CM_128_HMAC_SHA1_80 inline:eUMxlV2Ib6U8qeZot/wEKHw9iMzfKUYpOPJrNnu3\r\n");
                    //sessionDescription.sdp = newOffer.replace(/a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:.*\r\n/g, "a=crypto:1 AES_CM_128_HMAC_SHA1_80 inline:eUMxlV2Ib6U8qeZot/wEKHw9iMzfKUYpOPJrNnu3\r\n");

                    sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
                    L.Logger.debug("Changed", sessionDescription.sdp);

                    var newOffer = sessionDescription.sdp;

                    if (newOffer !== that.prevOffer) {

                        that.peerConnection.setLocalDescription(sessionDescription);

                        that.state = 'preparing-offer';
                        that.markActionNeeded();
                        return;
                    } else {
                        L.Logger.debug('Not sending a new offer');
                    }

                }, null, that.mediaConstraints);


            } else if (that.state === 'preparing-offer') {
                // Don't do anything until we have the ICE candidates.
                if (that.moreIceComing) {
                    return;
                }


                // Now able to send the offer we've already prepared.
                that.prevOffer = that.peerConnection.localDescription.sdp;
                L.Logger.debug("Sending OFFER: " + that.prevOffer);
                //L.Logger.debug('Sent SDP is ' + that.prevOffer);
                that.sendMessage('OFFER', that.prevOffer);
                // Not done: Retransmission on non-response.
                that.state = 'offer-sent';

            } else if (that.state === 'offer-received') {

                that.peerConnection.createAnswer(function (sessionDescription) {
                    that.peerConnection.setLocalDescription(sessionDescription);
                    that.state = 'offer-received-preparing-answer';

                    if (!that.iceStarted) {
                        var now = new Date();
                        L.Logger.debug(now.getTime() + ': Starting ICE in responder');
                        that.iceStarted = true;
                    } else {
                        that.markActionNeeded();
                        return;
                    }

                }, null, that.mediaConstraints);

            } else if (that.state === 'offer-received-preparing-answer') {
                if (that.moreIceComing) {
                    return;
                }

                mySDP = that.peerConnection.localDescription.sdp;

                that.sendMessage('ANSWER', mySDP);
                that.state = 'established';
            } else {
                that.error('Dazed and confused in state ' + that.state + ', stopping here');
            }
            that.actionNeeded = false;
        }
    };

    /**
     * Internal function to send an "OK" message.
     */
    that.sendOK = function () {
        that.sendMessage('OK');
    };

    /**
     * Internal function to send a signalling message.
     * @param {string} operation What operation to signal.
     * @param {string} sdp SDP message body.
     */
    that.sendMessage = function (operation, sdp) {
        var roapMessage = {};
        roapMessage.messageType = operation;
        roapMessage.sdp = sdp; // may be null or undefined
        if (operation === 'OFFER') {
            roapMessage.offererSessionId = that.sessionId;
            roapMessage.answererSessionId = that.otherSessionId; // may be null
            roapMessage.seq = (that.sequenceNumber += 1);
            // The tiebreaker needs to be neither 0 nor 429496725.
            roapMessage.tiebreaker = Math.floor(Math.random() * 429496723 + 1);
        } else {
            roapMessage.offererSessionId = that.incomingMessage.offererSessionId;
            roapMessage.answererSessionId = that.sessionId;
            roapMessage.seq = that.incomingMessage.seq;
        }
        that.onsignalingmessage(JSON.stringify(roapMessage));
    };

    /**
     * Internal something-bad-happened function.
     * @param {string} text What happened - suitable for logging.
     */
    that.error = function (text) {
        throw 'Error in RoapOnJsep: ' + text;
    };

    that.sessionId = (that.roapSessionId += 1);
    that.sequenceNumber = 0; // Number of last ROAP message sent. Starts at 1.
    that.actionNeeded = false;
    that.iceStarted = false;
    that.moreIceComing = true;
    that.iceCandidateCount = 0;
    that.onsignalingmessage = spec.callback;

    that.peerConnection.onopen = function () {
        if (that.onopen) {
            that.onopen();
        }
    };

    that.peerConnection.onaddstream = function (stream) {
        if (that.onaddstream) {
            that.onaddstream(stream);
        }
    };

    that.peerConnection.onremovestream = function (stream) {
        if (that.onremovestream) {
            that.onremovestream(stream);
        }
    };

    that.peerConnection.oniceconnectionstatechange = function (e) {
        if (that.oniceconnectionstatechange) {
            that.oniceconnectionstatechange(e.currentTarget.iceConnectionState);
        }   
    };

    // Variables that are part of the public interface of PeerConnection
    // in the 28 January 2012 version of the webrtc specification.
    that.onaddstream = null;
    that.onremovestream = null;
    that.state = 'new';
    // Auto-fire next events.
    that.markActionNeeded();
    return that;
};
/*global window, console, RTCSessionDescription, RoapConnection, webkitRTCPeerConnection*/

var Erizo = Erizo || {};

Erizo.FirefoxStack = function (spec) {
    "use strict";

    var that = {},
        WebkitRTCPeerConnection = mozRTCPeerConnection,
        RTCSessionDescription = mozRTCSessionDescription,
        RTCIceCandidate = mozRTCIceCandidate;

    var hasStream = false;

    that.pc_config = {
        "iceServers": []
    };

    if (spec.iceServers !== undefined) {
        that.pc_config.iceServers = spec.iceServers;
    }

    if (spec.audio === undefined) {
        spec.audio = true;
    }

    if (spec.video === undefined) {
        spec.video = true;
    }

    that.mediaConstraints = {
        offerToReceiveAudio: spec.audio,
        offerToReceiveVideo: spec.video,
        mozDontOfferDataChannel: true
    };

    var errorCallback = function (message) {
        L.Logger.error("Error in Stack ", message);
    }
    var gotCandidate = false;
		if (window.vcConfig && window.vcConfig.iceTransportPolicyRelay) {
			that.pc_config.iceTransports = 'relay';
			that.pc_config.iceTransportPolicy = 'relay';
		}
		if (window.vcConfig && window.vcConfig.iceServers && Object.prototype.toString.call(window.vcConfig.iceServers) === '[object Array]') {
			spec.iceServers = window.vcConfig.iceServers;
		}
		console.error("go!", that.pc_config, that.con);
    that.peerConnection = new WebkitRTCPeerConnection(that.pc_config, that.con);
    spec.localCandidates = [];

    that.peerConnection.onicecandidate =  function (event) {
        var candidateObject = {};
        if (!event.candidate) {
            L.Logger.info("Gathered all candidates. Sending END candidate");
            candidateObject = {
                sdpMLineIndex: -1 ,
                sdpMid: "end",
                candidate: "end"
            };
        }else{
					var pcand = parseCandidate(event.candidate.candidate);
					if (shouldBlock(pcand.type)) return;
					console.error('cand',pcand.type, pcand);
            gotCandidate = true;
            if (!event.candidate.candidate.match(/a=/)) {
                event.candidate.candidate ="a="+event.candidate.candidate;
            };
            candidateObject = event.candidate; 
            if (spec.remoteDescriptionSet) {
                spec.callback({type:'candidate', candidate: candidateObject});
            } else {
                spec.localCandidates.push(candidateObject);
                L.Logger.debug("Local Candidates stored: ", spec.localCandidates.length, spec.localCandidates);
            }

        } 
    };

    
    that.peerConnection.onaddstream = function (stream) {
        if (that.onaddstream) {
            that.onaddstream(stream);
        }
    };

    that.peerConnection.onremovestream = function (stream) {
        if (that.onremovestream) {
            that.onremovestream(stream);
        }
    };

    that.peerConnection.oniceconnectionstatechange = function (ev) {
        if (that.oniceconnectionstatechange){
            that.oniceconnectionstatechange(ev.target.iceConnectionState);
        }
    }

    var setMaxBW = function (sdp) {
        if (spec.video && spec.maxVideoBW) {
            sdp = sdp.replace(/b=AS:.*\r\n/g, "");
            var a = sdp.match(/m=video.*\r\n/);
            if (a == null) {
                a = sdp.match(/m=video.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxVideoBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        if (spec.audio && spec.maxAudioBW) {
            var a = sdp.match(/m=audio.*\r\n/);
            if (a == null) {
                a = sdp.match(/m=audio.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxAudioBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        return sdp;
    };
    
    var localDesc;

    var setLocalDesc = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
        sessionDescription.sdp = sessionDescription.sdp.replace(/a=ice-options:google-ice\r\n/g, "");
        spec.callback(sessionDescription);
        localDesc = sessionDescription;
    }

    var setLocalDescp2p = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
        sessionDescription.sdp = sessionDescription.sdp.replace(/a=ice-options:google-ice\r\n/g, "");
        spec.callback(sessionDescription);
        localDesc = sessionDescription;
        that.peerConnection.setLocalDescription(localDesc);
    }

    that.updateSpec = function (config, callback){
        if (config.maxVideoBW || config.maxAudioBW ){
            if (config.maxVideoBW){
                L.Logger.debug ("Maxvideo Requested", config.maxVideoBW, "limit", spec.limitMaxVideoBW);
                if (config.maxVideoBW > spec.limitMaxVideoBW) {
                    config.maxVideoBW = spec.limitMaxVideoBW;
                }
                spec.maxVideoBW = config.maxVideoBW; 
                L.Logger.debug ("Result", spec.maxVideoBW);
            }
            if (config.maxAudioBW) {
                if (config.maxAudioBW > spec.limitMaxAudioBW) {
                    config.maxAudioBW = spec.limitMaxAudioBW;
                }
                spec.maxAudioBW = config.maxAudioBW;
            }

            localDesc.sdp = setMaxBW(localDesc.sdp);
            if (config.Sdp){
                L.Logger.error ("Cannot update with renegotiation in Firefox, try without renegotiation");
            } else {
                L.Logger.debug ("Updating without renegotiation, newVideoBW:", spec.maxVideoBW, "newAudioBW:", spec.maxAudioBW);
                spec.callback({type:'updatestream', sdp: localDesc.sdp});
            }
        }
        if (config.minVideoBW || (config.slideShowMode!==undefined)){
            L.Logger.debug ("MinVideo Changed to ", config.minVideoBW);
            L.Logger.debug ("SlideShowMode Changed to ", config.slideShowMode);
            spec.callback({type:'updatestream', config:config});            
        }   
    };

    that.createOffer = function (isSubscribe) {
        if (isSubscribe === true) {            
            that.peerConnection.createOffer(setLocalDesc, errorCallback, that.mediaConstraints);
        } else {
            that.peerConnection.createOffer(setLocalDesc, errorCallback);
        }
    };

    that.addStream = function (stream) {
        that.peerConnection.addStream(stream);
    };
    spec.remoteCandidates = [];
    spec.remoteDescriptionSet = false;

    /**
     * Closes the connection.
     */
    that.close = function () {
        that.state = 'closed';
        that.peerConnection.close();
    };

    that.processSignalingMessage = function (msg) {
        
//        L.Logger.debug("Process Signaling Message", msg);

        if (msg.type === 'offer') {
            msg.sdp = setMaxBW(msg.sdp);
            that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg), function(){
                that.peerConnection.createAnswer(setLocalDescp2p, function(error){
                L.Logger.error("Error", error);
            }, that.mediaConstraints);
                spec.remoteDescriptionSet = true;
            }, function(error){
              L.Logger.error("Error setting Remote Description", error)
            });
        } else if (msg.type === 'answer') {

            // // For compatibility with only audio in Firefox Revisar
            // if (answer.match(/a=ssrc:55543/)) {
            //     answer = answer.replace(/a=sendrecv\\r\\na=mid:video/, 'a=recvonly\\r\\na=mid:video');
            //     answer = answer.split('a=ssrc:55543')[0] + '"}';
            // }

            L.Logger.info("Set remote and local description");
            L.Logger.debug("Local Description to set", localDesc.sdp);
            L.Logger.debug("Remote Description to set", msg.sdp);

            msg.sdp = setMaxBW(msg.sdp);

            that.peerConnection.setLocalDescription(localDesc, function(){
                that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg), function() {
                    spec.remoteDescriptionSet = true;
                    L.Logger.info("Remote Description successfully set");
                    while (spec.remoteCandidates.length > 0 && gotCandidate) {
                        L.Logger.info("Setting stored remote candidates")
                        // IMPORTANT: preserve ordering of candidates
                        that.peerConnection.addIceCandidate(spec.remoteCandidates.shift());
                    }
                    while(spec.localCandidates.length > 0) {
                        L.Logger.info("Sending Candidate from list");
                        // IMPORTANT: preserve ordering of candidates
                        spec.callback({type:'candidate', candidate: spec.localCandidates.shift()});
                    }
                }, function (error){
                    L.Logger.error("Error Setting Remote Description", error);
                });
            },function(error){
               L.Logger.error("Failure setting Local Description", error);
            });

        } else if (msg.type === 'candidate') {
          
            try {
                var obj;
                if (typeof(msg.candidate) === 'object') {
                    obj = msg.candidate;
                } else {
                    obj = JSON.parse(msg.candidate);
                }
                obj.candidate = obj.candidate.replace(/ generation 0/g, "");
                obj.candidate = obj.candidate.replace(/ udp /g, " UDP ");
               
                obj.sdpMLineIndex = parseInt(obj.sdpMLineIndex);
                var candidate = new RTCIceCandidate(obj);
//                L.logger.debug("Remote Candidate",candidate);

                if (spec.remoteDescriptionSet && gotCandidate) {
                    that.peerConnection.addIceCandidate(candidate);
                    while (spec.remoteCandidates.length > 0) {
                        L.Logger.info("Setting stored remote candidates")
                        // IMPORTANT: preserve ordering of candidates
                        that.peerConnection.addIceCandidate(spec.remoteCandidates.shift());
                    }
                } else {
                    spec.remoteCandidates.push(candidate);
                }
            } catch(e) {
                L.Logger.error("Error parsing candidate", msg.candidate, e);
            }
        }
    }
    return that;
};
/*global window, console, RTCSessionDescription, RoapConnection, webkitRTCPeerConnection*/

var Erizo = Erizo || {};

Erizo.BowserStack = function (spec) {
    "use strict";

    var that = {},
        WebkitRTCPeerConnection = webkitRTCPeerConnection;

    that.pc_config = {
        "iceServers": []
    };

    that.con = {'optional': [{'DtlsSrtpKeyAgreement': true}]};

    if (spec.stunServerUrl !== undefined) {
        that.pc_config.iceServers.push({"url": spec.stunServerUrl});
    } 

    if ((spec.turnServer || {}).url) {
        that.pc_config.iceServers.push({"username": spec.turnServer.username, "credential": spec.turnServer.password, "url": spec.turnServer.url});
    }

    if (spec.audio === undefined) {
        spec.audio = true;
    }

    if (spec.video === undefined) {
        spec.video = true;
    }

    that.mediaConstraints = {
            'offerToReceiveVideo': spec.video,
            'offerToReceiveAudio': spec.audio
    };

		if (window.vcConfig && window.vcConfig.iceTransportPolicyRelay) {
			that.pc_config.iceTransports = 'relay';
			that.pc_config.iceTransportPolicy = 'relay';
		}
		if (window.vcConfig && window.vcConfig.iceServers && Object.prototype.toString.call(window.vcConfig.iceServers) === '[object Array]') {
			spec.iceServers = window.vcConfig.iceServers;
		}
		console.error("go!", that.pc_config, that.con);
    that.peerConnection = new WebkitRTCPeerConnection(that.pc_config, that.con);
    
    spec.remoteDescriptionSet = false;
    
    var setMaxBW = function (sdp) {
        if (spec.maxVideoBW) {
            var a = sdp.match(/m=video.*\r\n/);
            if (a == null){
              a = sdp.match(/m=video.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxVideoBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        if (spec.maxAudioBW) {
            var a = sdp.match(/m=audio.*\r\n/);
            if (a == null){
              a = sdp.match(/m=audio.*\n/);
            }
            if (a && (a.length > 0)) {
                var r = a[0] + "b=AS:" + spec.maxAudioBW + "\r\n";
                sdp = sdp.replace(a[0], r);
            }
        }

        return sdp;
    };

    /**
     * Closes the connection.
     */
    that.close = function () {
        that.state = 'closed';
        that.peerConnection.close();
    };

    spec.localCandidates = [];

    that.peerConnection.onicecandidate =  function (event) {
        if (event.candidate) {
					var pcand = parseCandidate(event.candidate.candidate);
					if (shouldBlock(pcand.type)) return;
					console.error('cand',pcand.type, pcand);
            if (!event.candidate.candidate.match(/a=/)) {
                event.candidate.candidate ="a="+event.candidate.candidate;
            };

            
            if (spec.remoteDescriptionSet) {
                spec.callback({type:'candidate', candidate: event.candidate});
            } else {
                spec.localCandidates.push(event.candidate);
//                console.log("Local Candidates stored: ", spec.localCandidates.length, spec.localCandidates);
            }

        } else {
            
          //  spec.callback(that.peerConnection.localDescription);
            console.log("End of candidates." , that.peerConnection.localDescription);
        }
    };

    that.peerConnection.onaddstream = function (stream) {
        if (that.onaddstream) {
            that.onaddstream(stream);
        }
    };

    that.peerConnection.onremovestream = function (stream) {
        if (that.onremovestream) {
            that.onremovestream(stream);
        }
    };
    
    var errorCallback = function(message){
      console.log("Error in Stack ", message);
    }

    var localDesc;

    var setLocalDesc = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
//        sessionDescription.sdp = sessionDescription.sdp.replace(/a=ice-options:google-ice\r\n/g, "");
        console.log("Set local description", sessionDescription.sdp);
        localDesc = sessionDescription;
        that.peerConnection.setLocalDescription(localDesc, function(){
          console.log("The final LocalDesc", that.peerConnection.localDescription);
          spec.callback(that.peerConnection.localDescription);
        }, errorCallback);
        //that.peerConnection.setLocalDescription(sessionDescription);
    }

    var setLocalDescp2p = function (sessionDescription) {
        sessionDescription.sdp = setMaxBW(sessionDescription.sdp);
//        sessionDescription.sdp = sessionDescription.sdp.replace(/a=ice-options:google-ice\r\n/g, "");
        spec.callback(sessionDescription);
        localDesc = sessionDescription;
        that.peerConnection.setLocalDescription(sessionDescription);
    }

    that.createOffer = function (isSubscribe) {
      if (isSubscribe===true)
        that.peerConnection.createOffer(setLocalDesc, errorCallback, that.mediaConstraints);
      else
        that.peerConnection.createOffer(setLocalDesc, errorCallback);

    };

    that.addStream = function (stream) {
        that.peerConnection.addStream(stream);
    };
    spec.remoteCandidates = [];


    that.processSignalingMessage = function (msg) {
       console.log("Process Signaling Message", msg);

        if (msg.type === 'offer') {
            msg.sdp = setMaxBW(msg.sdp);
            that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg));
            that.peerConnection.createAnswer(setLocalDescp2p, null, that.mediaConstraints);
            spec.remoteDescriptionSet = true;
        
        } else if (msg.type === 'answer') {

            console.log("Set remote description", msg.sdp);

            msg.sdp = setMaxBW(msg.sdp);

            that.peerConnection.setRemoteDescription(new RTCSessionDescription(msg), function() {
              spec.remoteDescriptionSet = true;
              console.log("Candidates to be added: ", spec.remoteCandidates.length);
              while (spec.remoteCandidates.length > 0) {
                console.log("Candidate :",spec.remoteCandidates[spec.remoteCandidates.length-1]);
                that.peerConnection.addIceCandidate(spec.remoteCandidates.shift(), function(){}, errorCallback);
               
              }
//              console.log("Local candidates to send:" , spec.localCandidates.length);
              while(spec.localCandidates.length > 0) {
                spec.callback({type:'candidate', candidate: spec.localCandidates.shift()});
              }

            }, function(){console.log("Error Setting Remote Description");});

        } else if (msg.type === 'candidate') {
          console.log("Message with candidate");
            try {              
                var obj;
                if (typeof(msg.candidate) === 'object') {
                    obj = msg.candidate;
                } else {
                    obj = JSON.parse(msg.candidate);
                }
//                obj.candidate = obj.candidate.replace(/ generation 0/g, "");
//                obj.candidate = obj.candidate.replace(/ udp /g, " UDP ");
                obj.candidate = obj.candidate.replace(/a=/g, "");
                obj.sdpMLineIndex = parseInt(obj.sdpMLineIndex);
                obj.sdpMLineIndex = obj.sdpMid=="audio"?0:1;
                var candidate = new RTCIceCandidate(obj);
                console.log("Remote Candidate",candidate);
                if (spec.remoteDescriptionSet) {
                    that.peerConnection.addIceCandidate(candidate, function(){}, errorCallback);
                } else {
                    spec.remoteCandidates.push(candidate);
                }
            } catch(e) {
                L.Logger.error("Error parsing candidate", msg.candidate);
            }
        }
    }

    return that;
};
/*global window, console, navigator*/

var Erizo = Erizo || {};

Erizo.sessionId = 103;

Erizo.Connection = function (spec) {
    "use strict";
    var that = {};

    spec.session_id = (Erizo.sessionId += 1);

    // Check which WebRTC Stack is installed.
    that.browser = Erizo.getBrowser();
    if (that.browser === 'fake') {
        L.Logger.warn('Publish/subscribe video/audio streams not supported in erizofc yet');
        that = Erizo.FcStack(spec);
    } else if (that.browser === 'mozilla') {
        L.Logger.debug("Firefox Stack");
        that = Erizo.FirefoxStack(spec);
    } else if (that.browser === 'bowser'){
        L.Logger.debug("Bowser Stack");
        that = Erizo.BowserStack(spec); 
    } else if (that.browser === 'chrome-stable') {
        L.Logger.debug("Chrome Stable Stack");
        that = Erizo.ChromeStableStack(spec);
    } else {
        L.Logger.error("No stack available for this browser");
        throw "WebRTC stack not available";
    }
    if (!that.updateSpec){
        that.updateSpec = function(newSpec, callback){
            L.Logger.error("Update Configuration not implemented in this browser");
            if (callback)
                callback ("unimplemented");
        };
    }

    return that;
};

Erizo.getBrowser = function () {
  "use strict";

    var browser = "none";

    if (typeof module!=='undefined' && module.exports){
        browser = "fake";
    }else if (window.navigator.userAgent.match("Firefox") !== null) {
        // Firefox
        browser = "mozilla";
    } else if (window.navigator.userAgent.match("Bowser") !==null){
        browser = "bowser";    
    } else if (window.navigator.userAgent.match("Chrome") !==null) {
        if (window.navigator.appVersion.match(/Chrome\/([\w\W]*?)\./)[1] >= 26) {
            browser = "chrome-stable";
        }
    } else if (window.navigator.userAgent.match("Safari") !== null) {
        browser = "bowser";
    } else if (window.navigator.userAgent.match("AppleWebKit") !== null) {
        browser = "bowser";
    }
    return browser;
};


Erizo.GetUserMedia = function (config, callback, error) {
    "use strict";

    navigator.getMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);

    if (config.screen){

        L.Logger.debug("Screen access requested");
        switch(Erizo.getBrowser()){
            case "mozilla":
                L.Logger.debug("Screen sharing in Firefox");
                var theConfig = {};
                if(config.video.mandatory != undefined){
                    theConfig.video = config.video;
                    theConfig.video.mediaSource = 'window' || 'screen';
                }else{
                    theConfig = { audio: config.audio, video: { mediaSource: 'window' || 'screen' }};
                }
                navigator.getMedia(theConfig,callback,error);
                break;
            case "chrome-stable":
                L.Logger.debug("Screen sharing in Chrome");
                // Default extensionId - this extension is only usable in our server, please make your own extension
                // based on the code in erizo_controller/erizoClient/extras/chrome-extension
                var extensionId = "okeephmleflklcdebijnponpabbmmgeo";
                if (config.extensionId){
                    L.Logger.debug("extensionId supplied, using " + config.extensionId);
                    extensionId = config.extensionId;
                }
                L.Logger.debug("Screen access on chrome stable, looking for extension");
                try{
                    chrome.runtime.sendMessage(extensionId,{getStream:true}, function (response){
                        var theConfig = {};
                        if (response==undefined){
                            L.Logger.error("Access to screen denied");
                            var theError = {code:"Access to screen denied"};
                            error(theError);
                            return;
                        }
                        var theId = response.streamId;
                        if(config.video.mandatory!= undefined){
                            theConfig.video = config.video;                           
                            theConfig.video.mandatory.chromeMediaSource = 'desktop';
                            theConfig.video.mandatory.chromeMediaSourceId = theId;
                            
                        }else{
                            theConfig = {video: {mandatory: {chromeMediaSource: 'desktop',  chromeMediaSourceId: theId }}};
                        }
                        navigator.getMedia(theConfig,callback,error);
                    });
                } catch (e){
                    L.Logger.debug("Screensharing plugin is not accessible ");
                    var theError = {code:"no_plugin_present"};
                    error(theError);
                    return;
                }
                break;
            default:
                L.Logger.error("This browser does not support ScreenSharing");
        }
    } else {
      if (typeof module !== 'undefined' && module.exports) {
        L.Logger.error('Video/audio streams not supported in erizofc yet');
      } else {
        navigator.getMedia(config, callback, error);
      }
    }
};

/*global ErizoGetUserMedia, L, document*/
/*
 * Class Stream represents a local or a remote Stream in the Room. It will handle the WebRTC stream
 * and identify the stream and where it should be drawn.
 */
var Erizo = Erizo || {};
Erizo.Stream = function (spec) {
    "use strict";
    var that = Erizo.EventDispatcher(spec),
        getFrame;

    that.stream = spec.stream;
    that.url = spec.url;
    that.recording = spec.recording;
    that.room = undefined;
    that.showing = false;
    that.local = false;
    that.video = spec.video;
    that.audio = spec.audio;
    that.screen = spec.screen;
    that.videoSize = spec.videoSize;
    that.extensionId = spec.extensionId;

    if (that.videoSize !== undefined && (!(that.videoSize instanceof Array) || that.videoSize.length != 4)) {
        throw Error("Invalid Video Size");
    }
    if (spec.local === undefined || spec.local === true) {
        that.local = true;
    }

    // Public functions

    that.getID = function () {
        var id;
        // Unpublished local streams don't yet have an ID.
        if (that.local && !spec.streamID) {
            id = 'local';
        }
        else {
            id = spec.streamID;
        }
        return id;
    };

    // Get attributes of this stream.
    that.getAttributes = function () {
        return spec.attributes;
    };

    // Changes the attributes of this stream in the room.
    that.setAttributes = function(attrs) {
        L.Logger.error("Failed to set attributes data. This Stream object has not been published.");
    };

    that.updateLocalAttributes = function(attrs) {
        spec.attributes = attrs;
    };

    // Indicates if the stream has audio activated
    that.hasAudio = function () {
        return spec.audio;
    };

    // Indicates if the stream has video activated
    that.hasVideo = function () {
        return spec.video;
    };

    // Indicates if the stream has data activated
    that.hasData = function () {
        return spec.data;
    };

    // Indicates if the stream has screen activated
    that.hasScreen = function () {
        return spec.screen;
    };

    // Sends data through this stream.
    that.sendData = function (msg) {
        L.Logger.error("Failed to send data. This Stream object has not that channel enabled.");
    };

    // Initializes the stream and tries to retrieve a stream from local video and audio
    // We need to call this method before we can publish it in the room.
    that.init = function () {
      try {
        if ((spec.audio || spec.video || spec.screen) && spec.url === undefined) {
          L.Logger.info("Requested access to local media");
          var videoOpt = spec.video;
          if ((videoOpt == true || spec.screen == true) && that.videoSize !== undefined) {
            videoOpt = {mandatory: {minWidth: that.videoSize[0], minHeight: that.videoSize[1], maxWidth: that.videoSize[2], maxHeight: that.videoSize[3]}};
          } else if (spec.screen == true && videoOpt === undefined){
            videoOpt = true;
          }
          var opt = {video: videoOpt, audio: spec.audio, fake: spec.fake, screen: spec.screen, extensionId:that.extensionId};
          L.Logger.debug(opt);
          Erizo.GetUserMedia(opt, function (stream) {
            //navigator.webkitGetUserMedia("audio, video", function (stream) {

            L.Logger.info("User has granted access to local media.");
            that.stream = stream;

            var streamEvent = Erizo.StreamEvent({type: "access-accepted"});
            that.dispatchEvent(streamEvent);

          }, function (error) {
            L.Logger.error("Failed to get access to local media. Error code was " + error.code + ".");
            var streamEvent = Erizo.StreamEvent({type: "access-denied", msg:error});
            that.dispatchEvent(streamEvent);
          });
          } else {
            var streamEvent = Erizo.StreamEvent({type: "access-accepted"});
            that.dispatchEvent(streamEvent);
          }
          } catch (e) {
            L.Logger.error("Failed to get access to local media. Error was " + e + ".");
            var streamEvent = Erizo.StreamEvent({type: "access-denied", msg:e});
            that.dispatchEvent(streamEvent);
          }
      };


     that.close = function () {
        if (that.local) {
            if (that.room !== undefined) {
                that.room.unpublish(that);
            }
            // Remove HTML element
            that.hide();
            if (that.stream !== undefined) {
                that.stream.getTracks().forEach(function (track) {
                    track.stop();
                });
            }
            that.stream = undefined;
        }
    };

    that.play = function (elementID, options) {
        options = options || {};
        that.elementID = elementID;
        if (that.hasVideo() || this.hasScreen()) {
            // Draw on HTML
            if (elementID !== undefined) {
                var player = new Erizo.VideoPlayer({id: that.getID(), stream: that, elementID: elementID, options: options});
                that.player = player;
                that.showing = true;
            }
        } else if (that.hasAudio) {
            var player = new Erizo.AudioPlayer({id: that.getID(), stream: that, elementID: elementID, options: options});
            that.player = player;
            that.showing = true;
        }
    };

    that.stop = function () {
        if (that.showing) {
            if (that.player !== undefined) {
                that.player.destroy();
                that.showing = false;
            }
        }
    };

    that.show = that.play;
    that.hide = that.stop;

    getFrame = function () {
        if (that.player !== undefined && that.stream !== undefined) {
            var video = that.player.video,

                style = document.defaultView.getComputedStyle(video),
                width = parseInt(style.getPropertyValue("width"), 10),
                height = parseInt(style.getPropertyValue("height"), 10),
                left = parseInt(style.getPropertyValue("left"), 10),
                top = parseInt(style.getPropertyValue("top"), 10),

                div = document.getElementById(that.elementID),
                divStyle = document.defaultView.getComputedStyle(div),
                divWidth = parseInt(divStyle.getPropertyValue("width"), 10),
                divHeight = parseInt(divStyle.getPropertyValue("height"), 10),

                canvas = document.createElement('canvas'),
                context;

            canvas.id = "testing";
            canvas.width = divWidth;
            canvas.height = divHeight;
            canvas.setAttribute('style', 'display: none');
            //document.body.appendChild(canvas);
            context = canvas.getContext('2d');

            context.drawImage(video, left, top, width, height);

            return canvas;
        } else {
            return null;
        }
    };

    that.getVideoFrameURL = function (format) {
        var canvas = getFrame();
        if (canvas !== null) {
            if (format) {
                return canvas.toDataURL(format);
            } else {
                return canvas.toDataURL();
            }
        } else {
            return null;
        }
    };

    that.getVideoFrame = function () {
        var canvas = getFrame();
        if (canvas !== null) {
            return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
        } else {
            return null;
        }
    };

    that.checkOptions = function (config, isUpdate){ 
        //TODO: Check for any incompatible options
        if (isUpdate === true){  // We are updating the stream
            if (config.video || config.audio || config.screen){
                L.Logger.warning("Cannot update type of subscription");
                config.video = undefined;
                config.audio = undefined;
                config.screen = undefined;
            }
        }else{  // on publish or subscribe
            if(that.local === false){ // check what we can subscribe to
                if (config.video === true && that.hasVideo() === false){
                    L.Logger.warning("Trying to subscribe to video when there is no video, won't subscribe to video");
                    config.video = false;
                }
                if (config.audio === true && that.hasAudio() === false){
                    L.Logger.warning("Trying to subscribe to audio when there is no audio, won't subscribe to audio");
                    config.audio = false;
                }
            }
        }
        if(that.local === false){
            if (!that.hasVideo() && (config.slideShowMode === true)){
                L.Logger.warning("Cannot enable slideShowMode if it is not a video subscription, please check your parameters");
                config.slideShowMode = false;
            }
        } 
    };

    that.updateConfiguration = function (config, callback) {
        if (config === undefined)
            return;
        if (that.pc){
            that.checkOptions(config, true);
            if (that.local){
                if(that.room.p2p){ 
                    for (var index in that.pc){
                        that.pc[index].updateSpec(config, callback);
                    }
                }else{
                    that.pc.updateSpec(config, callback);
                }

            }else{
                that.pc.updateSpec(config, callback);
            }
        } else {
            return ("This stream has no peerConnection attached, ignoring");
        }
    }

    return that;
};
/*global L, io, console*/
/*
 * Class Room represents a Licode Room. It will handle the connection, local stream publication and
 * remote stream subscription.
 * Typical Room initialization would be:
 * var room = Erizo.Room({token:'213h8012hwduahd-321ueiwqewq'});
 * It also handles RoomEvents and StreamEvents. For example:
 * Event 'room-connected' points out that the user has been successfully connected to the room.
 * Event 'room-disconnected' shows that the user has been already disconnected.
 * Event 'stream-added' indicates that there is a new stream available in the room.
 * Event 'stream-removed' shows that a previous available stream has been removed from the room.
 */
var Erizo = Erizo || {};

Erizo.Room = function (spec) {
    "use strict";

    var that = Erizo.EventDispatcher(spec),
        connectSocket,
        sendMessageSocket,
        sendSDPSocket,
        sendDataSocket,
        updateAttributes,
        removeStream,
        DISCONNECTED = 0,
        CONNECTING = 1,
        CONNECTED = 2;

    that.remoteStreams = {};
    that.localStreams = {};
    that.roomID = '';
    that.socket = {};
    that.state = DISCONNECTED;
    that.p2p = false;

    that.addEventListener("room-disconnected", function (evt) {
        var index, stream, evt2;
        that.state = DISCONNECTED;

        // Remove all streams
        for (index in that.remoteStreams) {
            if (that.remoteStreams.hasOwnProperty(index)) {
                stream = that.remoteStreams[index];
                removeStream(stream);
                delete that.remoteStreams[index];
                evt2 = Erizo.StreamEvent({type: 'stream-removed', stream: stream});
                that.dispatchEvent(evt2);
            }
        }
        that.remoteStreams = {};

        // Close Peer Connections
        for (index in that.localStreams) {
            if (that.localStreams.hasOwnProperty(index)) {
                stream = that.localStreams[index];
                if(that.p2p){
                    for(var i in stream.pc){
                        stream.pc[i].close();
                    }
                }else{
                    stream.pc.close();
                }
                delete that.localStreams[index];
            }
        }

        // Close socket
        try {
            that.socket.disconnect();
        } catch (error) {
            L.Logger.debug("Socket already disconnected");
        }
        that.socket = undefined;
    });

    // Private functions

    // It removes the stream from HTML and close the PeerConnection associated
    removeStream = function (stream) {
        if (stream.stream !== undefined) {

            // Remove HTML element
            stream.hide();

            // Close PC stream
            if (stream.pc) stream.pc.close();
            if (stream.local) {
                stream.stream.stop();
            }
        }
    };

    sendDataSocket = function (stream, msg) {
        if (stream.local) {
            sendMessageSocket("sendDataStream", {id: stream.getID(), msg: msg});
        } else {
            L.Logger.error("You can not send data through a remote stream");
        }
    };

    updateAttributes = function(stream, attrs) {
        if (stream.local) {
            stream.updateLocalAttributes(attrs);
            sendMessageSocket("updateStreamAttributes", {id: stream.getID(), attrs: attrs});
        } else {
            L.Logger.error("You can not update attributes in a remote stream");
        }  
    };

    // It connects to the server through socket.io
    connectSocket = function (token, callback, error) {
        // Once we have connected
        that.socket = io.connect(token.host, {reconnect: false, secure: token.secure, 'force new connection': true, transports: ['websocket']});

        // We receive an event with a new stream in the room.
        // type can be "media" or "data"
        that.socket.on('onAddStream', function (arg) {
            var stream = Erizo.Stream({streamID: arg.id, local: false, audio: arg.audio, video: arg.video, data: arg.data, screen: arg.screen, attributes: arg.attributes}),
                evt;
            that.remoteStreams[arg.id] = stream;
            evt = Erizo.StreamEvent({type: 'stream-added', stream: stream});
            that.dispatchEvent(evt);
        });

        that.socket.on('signaling_message_erizo', function (arg) {
            var stream;
            if (arg.peerId) {
                stream = that.remoteStreams[arg.peerId];
            } else {
                stream = that.localStreams[arg.streamId];
            }
             
            if (stream) {
                stream.pc.processSignalingMessage(arg.mess);
            }
        });

        that.socket.on('signaling_message_peer', function (arg) {

            var stream = that.localStreams[arg.streamId];

            if (stream) {
                stream.pc[arg.peerSocket].processSignalingMessage(arg.msg);
            } else {
                stream = that.remoteStreams[arg.streamId];

                if (!stream.pc) {
                    create_remote_pc(stream, arg.peerSocket);
                }   
                stream.pc.processSignalingMessage(arg.msg);
            }
        });

        that.socket.on('publish_me', function (arg) {
            var myStream = that.localStreams[arg.streamId];

            if (myStream.pc === undefined) {
                myStream.pc = {};
            }

            myStream.pc[arg.peerSocket] = Erizo.Connection({callback: function (msg) {
                sendSDPSocket('signaling_message', {streamId: arg.streamId, peerSocket: arg.peerSocket, msg: msg});
            }, audio: myStream.hasAudio(), video: myStream.hasVideo(), iceServers: that.iceServers});


            myStream.pc[arg.peerSocket].oniceconnectionstatechange = function (state) {
                if (state === 'disconnected') {
                    myStream.pc[arg.peerSocket].close();
                    delete myStream.pc[arg.peerSocket];
                }
            };

            myStream.pc[arg.peerSocket].addStream(myStream.stream);
            myStream.pc[arg.peerSocket].createOffer();
        });

        var create_remote_pc = function (stream, peerSocket) {

            stream.pc = Erizo.Connection({callback: function (msg) {
                sendSDPSocket('signaling_message', {streamId: stream.getID(), peerSocket: peerSocket, msg: msg});
            }, iceServers: that.iceServers, maxAudioBW: spec.maxAudioBW, maxVideoBW: spec.maxVideoBW, limitMaxAudioBW:spec.maxAudioBW, limitMaxVideoBW: spec.maxVideoBW});

            stream.pc.onaddstream = function (evt) {
                // Draw on html
                L.Logger.info('Stream subscribed');
                stream.stream = evt.stream;
                var evt2 = Erizo.StreamEvent({type: 'stream-subscribed', stream: stream});
                that.dispatchEvent(evt2);
            };
        }

        that.socket.on('onBandwidthAlert', function (arg){
            L.Logger.info("Bandwidth Alert on", arg.streamID, "message", arg.message,"BW:", arg.bandwidth);
            if(arg.streamID){
                var stream = that.remoteStreams[arg.streamID];
                if (stream) {
                    var evt = Erizo.StreamEvent({type:'bandwidth-alert', stream:stream, msg:arg.message, bandwidth: arg.bandwidth});
                    stream.dispatchEvent(evt);
                }

            }
        });

        // We receive an event of new data in one of the streams
        that.socket.on('onDataStream', function (arg) {
            var stream = that.remoteStreams[arg.id],
                evt = Erizo.StreamEvent({type: 'stream-data', msg: arg.msg, stream: stream});
            stream.dispatchEvent(evt);
        });

        // We receive an event of new data in one of the streams
        that.socket.on('onUpdateAttributeStream', function (arg) {
            var stream = that.remoteStreams[arg.id],
                evt = Erizo.StreamEvent({type: 'stream-attributes-update', attrs: arg.attrs, stream: stream});
            stream.updateLocalAttributes(arg.attrs);
            stream.dispatchEvent(evt);
        });

        // We receive an event of a stream removed from the room
        that.socket.on('onRemoveStream', function (arg) {
            var stream = that.remoteStreams[arg.id],
                evt;
            if (stream === undefined){
                L.Logger.warning("Received a removeStream for", arg.id, "and it has not been registered here, ignoring.");
                return;
            }
            delete that.remoteStreams[arg.id];
            removeStream(stream);
            evt = Erizo.StreamEvent({type: 'stream-removed', stream: stream});
            that.dispatchEvent(evt);
        });

        // The socket has disconnected
        that.socket.on('disconnect', function (argument) {
            L.Logger.info("Socket disconnected, lost connection to ErizoController");
            if (that.state !== DISCONNECTED) {
                L.Logger.error("Unexpected disconnection from ErizoController");
                var disconnectEvt = Erizo.RoomEvent({type: "room-disconnected", message:"unexpected-disconnection"});
                that.dispatchEvent(disconnectEvt);
            }
        });

        that.socket.on('connection_failed', function(arg){
            if (arg.type === 'publish'){
                L.Logger.error("ICE Connection Failed on publishing stream", arg.streamId);
                if (that.state !== DISCONNECTED ) {
                    if(arg.streamId){
                        var stream = that.localStreams[arg.id];
                        if (stream && !stream.failed) {
                            stream.failed = true;
                            var disconnectEvt = Erizo.StreamEvent({type: "stream-failed", msg:"Publishing local stream failed ICE Checks", stream:stream});
                            that.dispatchEvent(disconnectEvt);
                        }
                    }
                }
            }else{
                L.Logger.error("ICE Connection Failed on subscribe, alerting");
                if (that.state !== DISCONNECTED) {
                    if(arg.streamId){
                        var stream = remoteStreams[arg.streamId];
                        if (stream && !stream.failed) {
                            stream.failed = true;
                            var disconnectEvt = Erizo.StreamEvent({type: "stream-failed", msg:"Subscriber failed the ICE Checks, cannot reach Licode for media", stream:stream});
                            that.dispatchEvent(disconnectEvt);
                        }
                    }
                }
            }
        });
        
        that.socket.on('error', function(e){
            error('Cannot connect to ErizoController (socket.io error)',e);
        });

        // First message with the token
        sendMessageSocket('token', token, callback, error);
    };

    // Function to send a message to the server using socket.io
    sendMessageSocket = function (type, msg, callback, error) {
        that.socket.emit(type, msg, function (respType, msg) {
            if (respType === "success") {
                if (callback !== undefined) {
                    callback(msg);
                }
            } else if (respType === "error"){
                if (error !== undefined) {
                    error(msg);
                }
            } else {
                if (callback !== undefined) {
                    callback(respType, msg);
                }
            }

        });
    };

    // It sends a SDP message to the server using socket.io
    sendSDPSocket = function (type, options, sdp, callback) {
        that.socket.emit(type, options, sdp, function (response, respCallback) {
            if (callback !== undefined) {
                callback(response, respCallback);
            }
        });
    };

    // Public functions

    // It stablishes a connection to the room. Once it is done it throws a RoomEvent("room-connected")
    that.connect = function () {
        var streamList = [],
            token = L.Base64.decodeBase64(spec.token);

        if (that.state !== DISCONNECTED) {
            L.Logger.warning("Room already connected");
        }

        // 1- Connect to Erizo-Controller
        that.state = CONNECTING;
        connectSocket(JSON.parse(token), function (response) {
            var index = 0, stream, streamList = [], streams, roomId, arg, connectEvt;
            streams = response.streams || [];
            that.p2p = response.p2p;
            roomId = response.id;
            that.iceServers = response.iceServers;
            that.state = CONNECTED;
            spec.defaultVideoBW = response.defaultVideoBW;
            spec.maxVideoBW = response.maxVideoBW;

            // 2- Retrieve list of streams
            for (index in streams) {
                if (streams.hasOwnProperty(index)) {
                    arg = streams[index];
                    stream = Erizo.Stream({streamID: arg.id, local: false, audio: arg.audio, video: arg.video, data: arg.data, screen: arg.screen, attributes: arg.attributes});
                    streamList.push(stream);
                    that.remoteStreams[arg.id] = stream;
                }
            }

            // 3 - Update RoomID
            that.roomID = roomId;

            L.Logger.info("Connected to room " + that.roomID);

            connectEvt = Erizo.RoomEvent({type: "room-connected", streams: streamList});
            that.dispatchEvent(connectEvt);
        }, function (error) {
            L.Logger.error("Not Connected! Error: " + error);
            var connectEvt = Erizo.RoomEvent({type: "room-error", message:error});
            that.dispatchEvent(connectEvt);
        });
    };

    // It disconnects from the room, dispatching a new RoomEvent("room-disconnected")
    that.disconnect = function () {
        L.Logger.debug("Disconnection requested");
        // 1- Disconnect from room
        var disconnectEvt = Erizo.RoomEvent({type: "room-disconnected", message:"expected-disconnection"});
        that.dispatchEvent(disconnectEvt);
    };

    // It publishes the stream provided as argument. Once it is added it throws a
    // StreamEvent("stream-added").
    that.publish = function (stream, options, callback) {
        options = options || {};

        var maxVideoBW;
        options.maxVideoBW = options.maxVideoBW || spec.defaultVideoBW;
        if (options.maxVideoBW > spec.maxVideoBW) {
            options.maxVideoBW = spec.maxVideoBW;
        }
        
        if (options.minVideoBW === undefined){
            options.minVideoBW = 0;
        }

        if (options.minVideoBW > spec.defaultVideoBW){
            options.minVideoBW = spec.defaultVideoBW;
        }

        // 1- If the stream is not local we do nothing.
        if (stream.local && that.localStreams[stream.getID()] === undefined) {

            // 2- Publish Media Stream to Erizo-Controller
            if (stream.hasAudio() || stream.hasVideo() || stream.hasScreen()) {
                if (stream.url !== undefined || stream.recording !== undefined) {
                    var type;
                    var arg;
                    if (stream.url) {
                        type = 'url';
                        arg = stream.url;
                    } else {
                        type = 'recording';
                        arg = stream.recording;
                    }
                    L.Logger.info("Checking publish options for", stream.getID());
                    stream.checkOptions(options);
                    sendSDPSocket('publish', {state: type, data: stream.hasData(), audio: stream.hasAudio(), video: stream.hasVideo(), 
                        attributes: stream.getAttributes(), createOffer: options.createOffer}, arg, function (id, error) {

                        if (id !== null) {
                            L.Logger.info('Stream published');
                            stream.getID = function () {
                                return id;
                            };
                            stream.sendData = function (msg) {
                                sendDataSocket(stream, msg);
                            };
                            stream.setAttributes = function (attrs) {
                                updateAttributes(stream, attrs);
                            };
                            that.localStreams[id] = stream;
                            stream.room = that;
                            if (callback)
                                callback(id);
                        } else {
                            L.Logger.error('Error when publishing stream', error);
                            // Unauth -1052488119
                            // Network -5
                            if (callback)
                                callback(undefined, error);
                        }
                    });

                } else if (that.p2p) {
                    // We save them now to be used when actually publishing in P2P mode.
                    spec.maxAudioBW = options.maxAudioBW;
                    spec.maxVideoBW = options.maxVideoBW;
                    sendSDPSocket('publish', {state: 'p2p', data: stream.hasData(), audio: stream.hasAudio(), video: stream.hasVideo(), screen: stream.hasScreen(), attributes: stream.getAttributes()}, undefined, function (id, error) {
                        if (id === null) {
                            L.Logger.error('Error when publishing the stream', error);
                            if (callback)
                                callback(undefined, error);
                        }
                        L.Logger.info('Stream published');
                        stream.getID = function () {
                            return id;
                        };
                        if (stream.hasData()) {
                            stream.sendData = function (msg) {
                                sendDataSocket(stream, msg);
                            };
                        }
                        stream.setAttributes = function (attrs) {
                            updateAttributes(stream, attrs);
                        };

                        that.localStreams[id] = stream;
                        stream.room = that;
                    });

                } else {
                    L.Logger.info("Publishing to Erizo Normally, is createOffer", options.createOffer);
                    sendSDPSocket('publish', {state: 'erizo', data: stream.hasData(), audio: stream.hasAudio(), video: stream.hasVideo(), 
                        screen: stream.hasScreen(), minVideoBW: options.minVideoBW, attributes: stream.getAttributes(), 
                        createOffer: options.createOffer, scheme: options.scheme}, undefined, function (id, error) {

                        if (id === null) {
                            L.Logger.error('Error when publishing the stream: ', error);
                            if (callback)
                                callback(undefined, error);
                            return;
                        }

                        L.Logger.info('Stream assigned an Id, starting the publish process');
                        stream.getID = function () {
                            return id;
                        };
                        if (stream.hasData()) {
                            stream.sendData = function (msg) {
                                sendDataSocket(stream, msg);
                            };
                        }
                        stream.setAttributes = function (attrs) {
                            updateAttributes(stream, attrs);
                        };
                        that.localStreams[id] = stream;
                        stream.room = that;

                        stream.pc = Erizo.Connection({callback: function (message) {
                            L.Logger.debug("Sending message", message);
                            sendSDPSocket('signaling_message', {streamId: stream.getID(), msg: message}, undefined, function () {});
                        }, iceServers: that.iceServers, maxAudioBW: options.maxAudioBW, maxVideoBW: options.maxVideoBW, limitMaxAudioBW: spec.maxAudioBW, limitMaxVideoBW: spec.maxVideoBW,audio:stream.hasAudio(), video: stream.hasVideo()});
                        
                        stream.pc.addStream(stream.stream);
                        stream.pc.oniceconnectionstatechange = function (state) {
                            if (state === 'failed') {
                                if (that.state !== DISCONNECTED && !stream.failed) {
                                    L.Logger.warning("Stream", stream.getID(), "has failed after succesful ICE checks");
                                    var disconnectEvt = Erizo.StreamEvent({type: "stream-failed", msg:"Publishing stream failed after connection", stream:stream });
                                    that.dispatchEvent(disconnectEvt);
                                    that.unpublish(stream);
                                }
                            }
                        };
                        if(!options.createOffer)
                            stream.pc.createOffer();
                        if(callback) callback(id);
                    });
                }
            } else if (stream.hasData()) {
                // 3- Publish Data Stream
                sendSDPSocket('publish', {state: 'data', data: stream.hasData(), audio: false, video: false, screen: false, attributes: stream.getAttributes()}, undefined, function (id, error) {
                    if (id === null) {
                        L.Logger.error('Error publishing stream ', error);
                        if (callback)
                            callback(undefined, error);
                        return;
                    }
                    L.Logger.info('Stream published');
                    stream.getID = function () {
                        return id;
                    };
                    stream.sendData = function (msg) {
                        sendDataSocket(stream, msg);
                    };
                    stream.setAttributes = function (attrs) {
                        updateAttributes(stream, attrs);
                    };
                    that.localStreams[id] = stream;
                    stream.room = that;
                    if(callback) callback(id);
                });
            }
        }
    };

    // Returns callback(id, error)
    that.startRecording = function (stream, callback) {
        L.Logger.debug("Start Recording stream: " + stream.getID());
        sendMessageSocket('startRecorder', {to: stream.getID()}, function(id, error){
            if (id === null){
                L.Logger.error('Error on start recording', error);
                if (callback) callback(undefined, error);
                return;
            }

            L.Logger.info('Start recording', id);
            if (callback) callback(id);
        });
    }

    // Returns callback(id, error)
    that.stopRecording = function (recordingId, callback) {
        sendMessageSocket('stopRecorder', {id: recordingId}, function(result, error){
            if (result === null){
                L.Logger.error('Error on stop recording', error);
                if (callback) callback(undefined, error);
                return;
            }
            L.Logger.info('Stop recording', recordingId);
            if (callback) callback(true);
        });
    }

    // It unpublishes the local stream in the room, dispatching a StreamEvent("stream-removed")
    that.unpublish = function (stream, callback) {

        // Unpublish stream from Erizo-Controller
        if (stream.local) {
            // Media stream
            sendMessageSocket('unpublish', stream.getID(), function(result, error){
                if (result === null){
                    L.Logger.error('Error unpublishing stream', error);
                    if (callback) callback(undefined, error);
                    return;
                }

                L.Logger.info('Stream unpublished');
                if (callback) callback(true);


            });
            var p2p = stream.room.p2p;
            stream.room = undefined;
            if ((stream.hasAudio() || stream.hasVideo() || stream.hasScreen()) && stream.url === undefined) {
                if(!p2p){
                    stream.pc.close();
                    stream.pc = undefined;
                }else{
                    for (var index in stream.pc){
                        stream.pc[index].close();
                        stream.pc[index] = undefined;
                    }
                }
            }
            delete that.localStreams[stream.getID()];

            stream.getID = function () {};
            stream.sendData = function (msg) {};
            stream.setAttributes = function (attrs) {};

        } else {
            L.Logger.error("Cannot unpublish, stream does not exist or is not local");
            if (callback) callback(undefined, error);
            return;
        }
    };

    // It subscribe to a remote stream and draws it inside the HTML tag given by the ID='elementID'
    that.subscribe = function (stream, options, callback) {

        options = options || {};

        if (!stream.local) {

            if (stream.hasVideo() || stream.hasAudio() || stream.hasScreen()) {
                // 1- Subscribe to Stream

                if (that.p2p) {
                    sendSDPSocket('subscribe', {streamId: stream.getID()});
                    if(callback) callback(true);
                } else {
                    L.Logger.info("Checking subscribe options for", stream.getID());
                    stream.checkOptions(options);
                    sendSDPSocket('subscribe', {streamId: stream.getID(), audio: options.audio, video: options.video, data: options.data, browser: Erizo.getBrowser(), createOffer: options.createOffer,
                    slideShowMode: options.slideShowMode}, undefined, function (result, error) {
                        if (result === null) {
                            L.Logger.error('Error subscribing to stream ', error);
                            if (callback)
                                callback(undefined, error);
                            return;
                        }

                        L.Logger.info('Subscriber added');
                          
                        stream.pc = Erizo.Connection({callback: function (message) {
                            L.Logger.info("Sending message", message);
                            sendSDPSocket('signaling_message', {streamId: stream.getID(), msg: message, browser: stream.pc.browser}, undefined, function () {});
                        }, nop2p: true, audio: options.audio, video: options.video, iceServers: that.iceServers});

                        stream.pc.onaddstream = function (evt) {
                            // Draw on html
                            L.Logger.info('Stream subscribed');
                            stream.stream = evt.stream;
                            var evt2 = Erizo.StreamEvent({type: 'stream-subscribed', stream: stream});
                            that.dispatchEvent(evt2);
                        };
                        
                        stream.pc.oniceconnectionstatechange = function (state) {
                            if (state === 'failed') {
                                if (that.state !== DISCONNECTED) {
                                    var disconnectEvt = Erizo.StreamEvent({type: "stream-failed", msg:"Subscribing stream failed after connection", stream:stream });
                                    that.dispatchEvent(disconnectEvt);
                                }
                            }
                        };
                        
                        stream.pc.createOffer(true);
                        if(callback) callback(true);
                    });

                }
            } else if (stream.hasData() && options.data !== false) {
                sendSDPSocket('subscribe', {streamId: stream.getID(), data: options.data}, undefined, function (result, error) {
                    if (result === null) {
                        L.Logger.error('Error subscribing to stream ', error);
                        if (callback)
                            callback(undefined, error);
                        return;
                    }
                    L.Logger.info('Stream subscribed');
                    var evt = Erizo.StreamEvent({type: 'stream-subscribed', stream: stream});
                    that.dispatchEvent(evt);
                    if(callback) callback(true);
                });
            } else {
                L.Logger.info("Subscribing to anything");
                return;
            }

            // Subscribe to stream stream
            L.Logger.info("Subscribing to: " + stream.getID());
        }
    };

    // It unsubscribes from the stream, removing the HTML element.
    that.unsubscribe = function (stream, callback) {

        // Unsubscribe from stream stream
        if (that.socket !== undefined) {
            if (!stream.local) {
                sendMessageSocket('unsubscribe', stream.getID(), function (result, error) {
                    if (result === null) {
                        if (callback)
                            callback(undefined, error);
                        return;
                    }
                    removeStream(stream);
                    if (callback) callback(true);
                }, function () {
                    L.Logger.error("Error calling unsubscribe.");
                });
            }
        }
    };

    //It searchs the streams that have "name" attribute with "value" value
    that.getStreamsByAttribute = function (name, value) {

        var streams = [], index, stream;

        for (index in that.remoteStreams) {
            if (that.remoteStreams.hasOwnProperty(index)) {
                stream = that.remoteStreams[index];

                if (stream.getAttributes() !== undefined && stream.getAttributes()[name] !== undefined) {
                    if (stream.getAttributes()[name] === value) {
                        streams.push(stream);
                    }
                }
            }
        }

        return streams;
    };

    return that;
};
/*global document, console*/

var L = L || {};

/*
 * API to write logs based on traditional logging mechanisms: debug, trace, info, warning, error
 */
L.Logger = (function (L) {
    "use strict";
    var DEBUG = 0, TRACE = 1, INFO = 2, WARNING = 3, ERROR = 4, NONE = 5, logLevel = DEBUG, enableLogPanel, setLogLevel, log, debug, trace, info, warning, error;

    // By calling this method we will not use console.log to print the logs anymore. Instead we will use a <textarea/> element to write down future logs
    enableLogPanel = function () {
        L.Logger.panel = document.createElement('textarea');
        L.Logger.panel.setAttribute("id", "licode-logs");
        L.Logger.panel.setAttribute("style", "width: 100%; height: 100%; display: none");
        L.Logger.panel.setAttribute("rows", 20);
        L.Logger.panel.setAttribute("cols", 20);
        L.Logger.panel.setAttribute("readOnly", true);
        document.body.appendChild(L.Logger.panel);
    };

    // It sets the new log level. We can set it to NONE if we do not want to print logs
    setLogLevel = function (level) {
        if (level > L.Logger.NONE) {
            level = L.Logger.NONE;
        } else if (level < L.Logger.DEBUG) {
            level = L.Logger.DEBUG;
        }
        L.Logger.logLevel = level;
    };

    // Generic function to print logs for a given level: L.Logger.[DEBUG, TRACE, INFO, WARNING, ERROR]
    log = function (level) {
        var out = '';
        if (level < L.Logger.logLevel) {
            return;
        }
        if (level === L.Logger.DEBUG) {
            out = out + "DEBUG";
        } else if (level === L.Logger.TRACE) {
            out = out + "TRACE";
        } else if (level === L.Logger.INFO) {
            out = out + "INFO";
        } else if (level === L.Logger.WARNING) {
            out = out + "WARNING";
        } else if (level === L.Logger.ERROR) {
            out = out + "ERROR";
        }
        out = out + ": ";
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        var tempArgs = args.slice(1);
        var args = [out].concat(tempArgs);
        if (L.Logger.panel !== undefined) {
            var tmp = '';
            for (var idx = 0; idx < args.length; idx++) {
                tmp = tmp + args[idx];
            }
            L.Logger.panel.value = L.Logger.panel.value + "\n" + tmp;
        } else {
            console.log.apply(console, args);
        }
    };

    // It prints debug logs
    debug = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        L.Logger.log.apply(L.Logger,[L.Logger.DEBUG].concat(args));
    };

    // It prints trace logs
    trace = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        L.Logger.log.apply(L.Logger,[L.Logger.TRACE].concat(args));
    };

    // It prints info logs
    info = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        L.Logger.log.apply(L.Logger,[L.Logger.INFO].concat(args));
    };

    // It prints warning logs
    warning = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        L.Logger.log.apply(L.Logger,[L.Logger.WARNING].concat(args));
    };

    // It prints error logs
    error = function () {
        var args = [];
        for (var i = 0; i < arguments.length; i++) {
            args[i] = arguments[i];
        }
        L.Logger.log.apply(L.Logger,[L.Logger.ERROR].concat(args));
    };

    return {
        DEBUG: DEBUG,
        TRACE: TRACE,
        INFO: INFO,
        WARNING: WARNING,
        ERROR: ERROR,
        NONE: NONE,
        enableLogPanel: enableLogPanel,
        setLogLevel: setLogLevel,
        log: log,
        debug: debug,
        trace: trace,
        info: info,
        warning: warning,
        error: error
    };
}(L));var L = L || {};
L.Base64 = (function (L) {
    "use strict";
    var END_OF_INPUT, base64Chars, reverseBase64Chars, base64Str, base64Count, i, setBase64Str, readBase64, encodeBase64, readReverseBase64, ntos, decodeBase64;

    END_OF_INPUT = -1;

    base64Chars = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H',
        'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P',
        'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X',
        'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v',
        'w', 'x', 'y', 'z', '0', '1', '2', '3',
        '4', '5', '6', '7', '8', '9', '+', '/'
    ];

    reverseBase64Chars = [];

    for (i = 0; i < base64Chars.length; i = i + 1) {
        reverseBase64Chars[base64Chars[i]] = i;
    }

    setBase64Str = function (str) {
        base64Str = str;
        base64Count = 0;
    };

    readBase64 = function () {
        var c;
        if (!base64Str) {
            return END_OF_INPUT;
        }
        if (base64Count >= base64Str.length) {
            return END_OF_INPUT;
        }
        c = base64Str.charCodeAt(base64Count) & 0xff;
        base64Count = base64Count + 1;
        return c;
    };

    encodeBase64 = function (str) {
        var result, inBuffer, lineCount, done;
        setBase64Str(str);
        result = '';
        inBuffer = new Array(3);
        lineCount = 0;
        done = false;
        while (!done && (inBuffer[0] = readBase64()) !== END_OF_INPUT) {
            inBuffer[1] = readBase64();
            inBuffer[2] = readBase64();
            result = result + (base64Chars[inBuffer[0] >> 2]);
            if (inBuffer[1] !== END_OF_INPUT) {
                result = result + (base64Chars [((inBuffer[0] << 4) & 0x30) | (inBuffer[1] >> 4)]);
                if (inBuffer[2] !== END_OF_INPUT) {
                    result = result + (base64Chars [((inBuffer[1] << 2) & 0x3c) | (inBuffer[2] >> 6)]);
                    result = result + (base64Chars[inBuffer[2] & 0x3F]);
                } else {
                    result = result + (base64Chars[((inBuffer[1] << 2) & 0x3c)]);
                    result = result + ('=');
                    done = true;
                }
            } else {
                result = result + (base64Chars[((inBuffer[0] << 4) & 0x30)]);
                result = result + ('=');
                result = result + ('=');
                done = true;
            }
            lineCount = lineCount + 4;
            if (lineCount >= 76) {
                result = result + ('\n');
                lineCount = 0;
            }
        }
        return result;
    };

    readReverseBase64 = function () {
        if (!base64Str) {
            return END_OF_INPUT;
        }
        while (true) {
            if (base64Count >= base64Str.length) {
                return END_OF_INPUT;
            }
            var nextCharacter = base64Str.charAt(base64Count);
            base64Count = base64Count + 1;
            if (reverseBase64Chars[nextCharacter]) {
                return reverseBase64Chars[nextCharacter];
            }
            if (nextCharacter === 'A') {
                return 0;
            }
        }
    };

    ntos = function (n) {
        n = n.toString(16);
        if (n.length === 1) {
            n = "0" + n;
        }
        n = "%" + n;
        return unescape(n);
    };

    decodeBase64 = function (str) {
        var result, inBuffer, done;
        setBase64Str(str);
        result = "";
        inBuffer = new Array(4);
        done = false;
        while (!done && (inBuffer[0] = readReverseBase64()) !== END_OF_INPUT && (inBuffer[1] = readReverseBase64()) !== END_OF_INPUT) {
            inBuffer[2] = readReverseBase64();
            inBuffer[3] = readReverseBase64();
            result = result + ntos((((inBuffer[0] << 2) & 0xff)| inBuffer[1] >> 4));
            if (inBuffer[2] !== END_OF_INPUT) {
                result +=  ntos((((inBuffer[1] << 4) & 0xff) | inBuffer[2] >> 2));
                if (inBuffer[3] !== END_OF_INPUT) {
                    result = result +  ntos((((inBuffer[2] << 6)  & 0xff) | inBuffer[3]));
                } else {
                    done = true;
                }
            } else {
                done = true;
            }
        }
        return result;
    };

    return {
        encodeBase64: encodeBase64,
        decodeBase64: decodeBase64
    };
}(L));/**
 * Copyright 2013 Marc J. Schmidt. See the LICENSE file at the top-level
 * directory of this distribution and at
 * https://github.com/marcj/css-element-queries/blob/master/LICENSE.
 */
;
(function() {

    this.L = this.L || {};

    /**
     *
     * @type {Function}
     * @constructor
     */
    this.L.ElementQueries = function() {
        /**
         *
         * @param element
         * @returns {Number}
         */
        function getEmSize(element) {
            if (!element) {
                element = document.documentElement;
            }
            var fontSize = getComputedStyle(element, 'fontSize');
            return parseFloat(fontSize) || 16;
        }

        /**
         *
         * @copyright https://github.com/Mr0grog/element-query/blob/master/LICENSE
         *
         * @param element
         * @param value
         * @param units
         * @returns {*}
         */
        function convertToPx(element, value) {
            var units = value.replace(/[0-9]*/, '');
            value = parseFloat(value);
            switch (units) {
                case "px":
                    return value;
                case "em":
                    return value * getEmSize(element);
                case "rem":
                    return value * getEmSize();
                // Viewport units!
                // According to http://quirksmode.org/mobile/tableViewport.html
                // documentElement.clientWidth/Height gets us the most reliable info
                case "vw":
                    return value * document.documentElement.clientWidth / 100;
                case "vh":
                    return value * document.documentElement.clientHeight / 100;
                case "vmin":
                case "vmax":
                    var vw = document.documentElement.clientWidth / 100;
                    var vh = document.documentElement.clientHeight / 100;
                    var chooser = Math[units === "vmin" ? "min" : "max"];
                    return value * chooser(vw, vh);
                default:
                    return value;
                // for now, not supporting physical units (since they are just a set number of px)
                // or ex/ch (getting accurate measurements is hard)
            }
        }

        /**
         *
         * @param {HTMLElement} element
         * @constructor
         */
        function SetupInformation(element) {
            this.element = element;
            this.options = [];
            var i, j, option, width = 0, height = 0, value, actualValue, attrValues, attrValue, attrName;

            /**
             * @param option {mode: 'min|max', property: 'width|height', value: '123px'}
             */
            this.addOption = function(option) {
                this.options.push(option);
            }

            var attributes = ['min-width', 'min-height', 'max-width', 'max-height'];

            /**
             * Extracts the computed width/height and sets to min/max- attribute.
             */
            this.call = function() {
                // extract current dimensions
                width = this.element.offsetWidth;
                height = this.element.offsetHeight;

                attrValues = {};

                for (i = 0, j = this.options.length; i < j; i++) {
                    option = this.options[i];
                    value = convertToPx(this.element, option.value);

                    actualValue = option.property == 'width' ? width : height;
                    attrName = option.mode + '-' + option.property;
                    attrValue = '';

                    if (option.mode == 'min' && actualValue >= value) {
                        attrValue += option.value;
                    }

                    if (option.mode == 'max' && actualValue <= value) {
                        attrValue += option.value;
                    }

                    if (!attrValues[attrName]) attrValues[attrName] = '';
                    if (attrValue && -1 === (' '+attrValues[attrName]+' ').indexOf(' ' + attrValue + ' ')) {
                        attrValues[attrName] += ' ' + attrValue;
                    }
                }

                for (var k in attributes) {
                    if (attrValues[attributes[k]]) {
                        this.element.setAttribute(attributes[k], attrValues[attributes[k]].substr(1));
                    } else {
                        this.element.removeAttribute(attributes[k]);
                    }
                }
            };
        }

        /**
         * @param {HTMLElement} element
         * @param {Object}      options
         */
        function setupElement(element, options) {
            if (element.elementQueriesSetupInformation) {
                element.elementQueriesSetupInformation.addOption(options);
            } else {
                element.elementQueriesSetupInformation = new SetupInformation(element);
                element.elementQueriesSetupInformation.addOption(options);
                new ResizeSensor(element, function() {
                    element.elementQueriesSetupInformation.call();
                });
            }
            element.elementQueriesSetupInformation.call();
        }

        /**
         * @param {String} selector
         * @param {String} mode min|max
         * @param {String} property width|height
         * @param {String} value
         */
        function queueQuery(selector, mode, property, value) {
            var query;
            if (document.querySelectorAll) query = document.querySelectorAll.bind(document);
            if (!query && 'undefined' !== typeof $$) query = $$;
            if (!query && 'undefined' !== typeof jQuery) query = jQuery;

            if (!query) {
                throw 'No document.querySelectorAll, jQuery or Mootools\'s $$ found.';
            }

            var elements = query(selector);
            for (var i = 0, j = elements.length; i < j; i++) {
                setupElement(elements[i], {
                    mode: mode,
                    property: property,
                    value: value
                });
            }
        }

        var regex = /,?([^,\n]*)\[[\s\t]*(min|max)-(width|height)[\s\t]*[~$\^]?=[\s\t]*"([^"]*)"[\s\t]*]([^\n\s\{]*)/mgi;

        /**
         * @param {String} css
         */
        function extractQuery(css) {
            var match;
            css = css.replace(/'/g, '"');
            while (null !== (match = regex.exec(css))) {
                if (5 < match.length) {
                    queueQuery(match[1] || match[5], match[2], match[3], match[4]);
                }
            }
        }

        /**
         * @param {CssRule[]|String} rules
         */
        function readRules(rules) {
            var selector = '';
            if (!rules) {
                return;
            }
            if ('string' === typeof rules) {
                rules = rules.toLowerCase();
                if (-1 !== rules.indexOf('min-width') || -1 !== rules.indexOf('max-width')) {
                    extractQuery(rules);
                }
            } else {
                for (var i = 0, j = rules.length; i < j; i++) {
                    if (1 === rules[i].type) {
                        selector = rules[i].selectorText || rules[i].cssText;
                        if (-1 !== selector.indexOf('min-height') || -1 !== selector.indexOf('max-height')) {
                            extractQuery(selector);
                        }else if(-1 !== selector.indexOf('min-width') || -1 !== selector.indexOf('max-width')) {
                            extractQuery(selector);
                        }
                    } else if (4 === rules[i].type) {
                        readRules(rules[i].cssRules || rules[i].rules);
                    }
                }
            }
        }

        /**
         * Searches all css rules and setups the event listener to all elements with element query rules..
         */
        this.init = function() {
            for (var i = 0, j = document.styleSheets.length; i < j; i++) {
                readRules(document.styleSheets[i].cssText || document.styleSheets[i].cssRules || document.styleSheets[i].rules);
            }
        }
    }

    function init() {
        new L.ElementQueries().init();
    }

    if (window.addEventListener) {
        window.addEventListener('load', init, false);
    } else {
        window.attachEvent('onload', init);
    }

    /**
     * Class for dimension change detection.
     *
     * @param {Element|Element[]|Elements|jQuery} element
     * @param {Function} callback
     *
     * @constructor
     */
    this.L.ResizeSensor = function(element, callback) {
        /**
         * Adds a listener to the over/under-flow event.
         *
         * @param {HTMLElement} element
         * @param {Function}    callback
         */
        function addResizeListener(element, callback) {
            if (window.OverflowEvent) {
                //webkit
                element.addEventListener('overflowchanged', function(e) {
                    callback.call(this, e);
                });
            } else {
                element.addEventListener('overflow', function(e) {
                    callback.call(this, e);
                });
                element.addEventListener('underflow', function(e) {
                    callback.call(this, e);
                });
            }
        }

        /**
         *
         * @constructor
         */
        function EventQueue() {
            this.q = [];
            this.add = function(ev) {
                this.q.push(ev);
            };

            var i, j;
            this.call = function() {
                for (i = 0, j = this.q.length; i < j; i++) {
                    this.q[i].call();
                }
            };
        }

        /**
         * @param {HTMLElement} element
         * @param {String}      prop
         * @returns {String|Number}
         */
        function getComputedStyle(element, prop) {
            if (element.currentStyle) {
                return element.currentStyle[prop];
            } else if (window.getComputedStyle) {
                return window.getComputedStyle(element, null).getPropertyValue(prop);
            } else {
                return element.style[prop];
            }
        }

        /**
         *
         * @param {HTMLElement} element
         * @param {Function}    resized
         */
        function attachResizeEvent(element, resized) {
            if (!element.resizedAttached) {
                element.resizedAttached = new EventQueue();
                element.resizedAttached.add(resized);
            } else if (element.resizedAttached) {
                element.resizedAttached.add(resized);
                return;
            }

            /*if ('onresize' in element) {
                //internet explorer
                if (element.attachEvent) {
                    element.attachEvent('onresize', function() {
                        element.resizedAttached.call();
                    });
                } else if (element.addEventListener) {
                    element.addEventListener('resize', function(){
                        element.resizedAttached.call();
                    });
                }
            } else {*/
                var myResized = function() {
                    if (setupSensor()) {
                        element.resizedAttached.call();
                    }
                };
                element.resizeSensor = document.createElement('div');
                element.resizeSensor.className = 'resize-sensor';
                var style =
                    'position: absolute; left: 0; top: 0; right: 0; bottom: 0; overflow: hidden; z-index: -1;';
                element.resizeSensor.style.cssText = style;
                element.resizeSensor.innerHTML =
                    '<div class="resize-sensor-overflow" style="' + style + '">' +
                        '<div></div>' +
                        '</div>' +
                        '<div class="resize-sensor-underflow" style="' + style + '">' +
                        '<div></div>' +
                        '</div>';
                element.appendChild(element.resizeSensor);

                if ('absolute' !== getComputedStyle(element, 'position')) {
                    element.style.position = 'relative';
                }

                var x = -1,
                    y = -1,
                    firstStyle = element.resizeSensor.firstElementChild.firstChild.style,
                    lastStyle = element.resizeSensor.lastElementChild.firstChild.style;

                function setupSensor() {
                    var change = false,
                        width = element.resizeSensor.offsetWidth,
                        height = element.resizeSensor.offsetHeight;

                    if (x != width) {
                        firstStyle.width = (width - 1) + 'px';
                        lastStyle.width = (width + 1) + 'px';
                        change = true;
                        x = width;
                    }
                    if (y != height) {
                        firstStyle.height = (height - 1) + 'px';
                        lastStyle.height = (height + 1) + 'px';
                        change = true;
                        y = height;
                    }
                    return change;
                }

                setupSensor();
                addResizeListener(element.resizeSensor, myResized);
                addResizeListener(element.resizeSensor.firstElementChild, myResized);
                addResizeListener(element.resizeSensor.lastElementChild, myResized);
            /*}*/
        }

        if ('array' === typeof element
            || ('undefined' !== typeof jQuery && element instanceof jQuery) //jquery
            || ('undefined' !== typeof Elements && element instanceof Elements) //mootools
            ) {
            var i = 0, j = element.length;
            for (; i < j; i++) {
                attachResizeEvent(element[i], callback);
            }
        } else {
            attachResizeEvent(element, callback);
        }
    }

})();/*
 * View class represents a HTML component
 * Every view is an EventDispatcher.
 */
var Erizo = Erizo || {};
Erizo.View = function (spec) {
	"use strict";

    var that = Erizo.EventDispatcher({});

    // Variables

    // URL where it will look for icons and assets
    that.url = '';
    return that;
};/*global window, console, clearInterval, setInterval, document, unescape, L, webkitURL*/
/*
 * VideoPlayer represents a Licode video component that shows either a local or a remote video.
 * Ex.: var player = VideoPlayer({id: id, stream: stream, elementID: elementID});
 * A VideoPlayer is also a View component.
 */
var Erizo = Erizo || {};
Erizo.VideoPlayer = function (spec) {
    "use strict";

    var that = Erizo.View({}),
        onmouseover,
        onmouseout;

    // Variables

    // VideoPlayer ID
    that.id = spec.id;

    // Stream that the VideoPlayer will play
    that.stream = spec.stream.stream;

    // DOM element in which the VideoPlayer will be appended
    that.elementID = spec.elementID;

    // Private functions
    onmouseover = function (evt) {
        that.bar.display();
    };

    onmouseout = function (evt) {
        that.bar.hide();
    };

    // Public functions

    // It will stop the VideoPlayer and remove it from the HTML
    that.destroy = function () {
        that.video.pause();
        delete that.resizer;
        that.parentNode.removeChild(that.div);
    };

    that.resize = function () {

        var width = that.container.offsetWidth,
            height = that.container.offsetHeight;

        if (spec.stream.screen || spec.options.crop === false) {

            if (width * (9 / 16) < height) {

                that.video.style.width = width + "px";
                that.video.style.height = (9 / 16) * width + "px";

                that.video.style.top = -((9 / 16) * width / 2 - height / 2) + "px";
                that.video.style.left = "0px";

            } else {

                that.video.style.height = height + "px";
                that.video.style.width = (16 / 9) * height + "px";

                that.video.style.left = -((16 / 9) * height / 2 - width / 2) + "px";
                that.video.style.top = "0px";

            }
        } else {
            if (width !== that.containerWidth || height !== that.containerHeight) {

                if (width * (3 / 4) > height) {

                    that.video.style.width = width + "px";
                    that.video.style.height = (3 / 4) * width + "px";

                    that.video.style.top = -((3 / 4) * width / 2 - height / 2) + "px";
                    that.video.style.left = "0px";

                } else {

                    that.video.style.height = height + "px";
                    that.video.style.width = (4 / 3) * height + "px";

                    that.video.style.left = -((4 / 3) * height / 2 - width / 2) + "px";
                    that.video.style.top = "0px";

                }
            }
        }

        that.containerWidth = width;
        that.containerHeight = height;

    };

    /*window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        document.getElementById(key).value = unescape(value);
    });*/

    L.Logger.debug('Creating URL from stream ' + that.stream);
    var myURL = window.URL || webkitURL;
    that.stream_url = myURL.createObjectURL(that.stream);

    // Container
    that.div = document.createElement('div');
    that.div.setAttribute('id', 'player_' + that.id);
    that.div.setAttribute('class', 'player');
    that.div.setAttribute('style', 'width: 100%; height: 100%; position: relative; background-color: black; overflow: hidden;');

    // Loader icon
    that.loader = document.createElement('img');
    that.loader.setAttribute('style', 'width: 16px; height: 16px; position: absolute; top: 50%; left: 50%; margin-top: -8px; margin-left: -8px');
    that.loader.setAttribute('id', 'back_' + that.id);
    that.loader.setAttribute('class', 'loader');
    that.loader.setAttribute('src', that.url + '/assets/loader.gif');

    // Video tag
    that.video = document.createElement('video');
    that.video.setAttribute('id', 'stream' + that.id);
    that.video.setAttribute('class', 'stream');
    that.video.setAttribute('style', 'width: 100%; height: 100%; position: absolute');
    that.video.setAttribute('autoplay', 'autoplay');

    if(spec.stream.local) 
        that.video.volume = 0;

    if (that.elementID !== undefined) {
        document.getElementById(that.elementID).appendChild(that.div);
        that.container = document.getElementById(that.elementID);
    } else {
        document.body.appendChild(that.div);
        that.container = document.body;
    }

    that.parentNode = that.div.parentNode;

    that.div.appendChild(that.loader);
    that.div.appendChild(that.video);

    that.containerWidth = 0;
    that.containerHeight = 0;

    that.resizer = new L.ResizeSensor(that.container, that.resize);

    that.resize();

    // Bottom Bar
    that.bar = new Erizo.Bar({elementID: 'player_' + that.id, id: that.id, stream: spec.stream, media: that.video, options: spec.options});

    that.div.onmouseover = onmouseover;
    that.div.onmouseout = onmouseout;

    that.video.src = that.stream_url;

    return that;
};/*global window, console, clearInterval, setInterval, document, unescape, L, webkitURL*/
/*
 * AudioPlayer represents a Licode Audio component that shows either a local or a remote Audio.
 * Ex.: var player = AudioPlayer({id: id, stream: stream, elementID: elementID});
 * A AudioPlayer is also a View component.
 */
var Erizo = Erizo || {};
Erizo.AudioPlayer = function (spec) {
    "use strict";

    var that = Erizo.View({}),
        onmouseover,
        onmouseout;

    // Variables

    // AudioPlayer ID
    that.id = spec.id;

    // Stream that the AudioPlayer will play
    that.stream = spec.stream.stream;

    // DOM element in which the AudioPlayer will be appended
    that.elementID = spec.elementID;


    L.Logger.debug('Creating URL from stream ' + that.stream);
    var myURL = window.URL || webkitURL;
    that.stream_url = myURL.createObjectURL(that.stream);

    // Audio tag
    that.audio = document.createElement('audio');
    that.audio.setAttribute('id', 'stream' + that.id);
    that.audio.setAttribute('class', 'stream');
    that.audio.setAttribute('style', 'width: 100%; height: 100%; position: absolute');
    that.audio.setAttribute('autoplay', 'autoplay');

    if(spec.stream.local) 
        that.audio.volume = 0;

    if(spec.stream.local) 
        that.audio.volume = 0;


    if (that.elementID !== undefined) {

        // It will stop the AudioPlayer and remove it from the HTML
        that.destroy = function () {
            that.audio.pause();
            //clearInterval(that.resize);
            that.parentNode.removeChild(that.div);
        };

        onmouseover = function (evt) {
            that.bar.display();
        };

        onmouseout = function (evt) {
            that.bar.hide();
        };

        // Container
        that.div = document.createElement('div');
        that.div.setAttribute('id', 'player_' + that.id);
        that.div.setAttribute('class', 'player');
        that.div.setAttribute('style', 'width: 100%; height: 100%; position: relative; overflow: hidden;');

        document.getElementById(that.elementID).appendChild(that.div);
        that.container = document.getElementById(that.elementID);

        that.parentNode = that.div.parentNode;

        that.div.appendChild(that.audio);

        // Bottom Bar
        that.bar = new Erizo.Bar({elementID: 'player_' + that.id, id: that.id, stream: spec.stream, media: that.audio, options: spec.options});

        that.div.onmouseover = onmouseover;
        that.div.onmouseout = onmouseout;

    } else {
        // It will stop the AudioPlayer and remove it from the HTML
        that.destroy = function () {
            that.audio.pause();
            //clearInterval(that.resize);
            that.parentNode.removeChild(that.audio);
        };

        document.body.appendChild(that.audio);
        that.parentNode = document.body;
    }

    that.audio.src = that.stream_url;

    return that;
};/*global window, document, clearTimeout, setTimeout */

/*
 * Bar represents the bottom menu bar of every mediaPlayer.
 * It contains a Speaker and an icon.
 * Every Bar is a View.
 * Ex.: var bar = Bar({elementID: element, id: id});
 */
var Erizo = Erizo || {};
Erizo.Bar = function (spec) {
    "use strict";
    var that = Erizo.View({}),
        waiting,
        show;

    // Variables

    // DOM element in which the Bar will be appended
    that.elementID = spec.elementID;

    // Bar ID
    that.id = spec.id;

    // Container
    that.div = document.createElement('div');
    that.div.setAttribute('id', 'bar_' + that.id);
    that.div.setAttribute('class', 'bar');

    // Bottom bar
    that.bar = document.createElement('div');
    that.bar.setAttribute('style', 'width: 100%; height: 15%; max-height: 30px; position: absolute; bottom: 0; right: 0; background-color: rgba(255,255,255,0.62)');
    that.bar.setAttribute('id', 'subbar_' + that.id);
    that.bar.setAttribute('class', 'subbar');

    // Lynckia icon
    that.link = document.createElement('a');
    that.link.setAttribute('href', 'http://www.lynckia.com/');
    that.link.setAttribute('class', 'link');
    that.link.setAttribute('target', '_blank');

    that.logo = document.createElement('img');
    that.logo.setAttribute('style', 'width: 100%; height: 100%; max-width: 30px; position: absolute; top: 0; left: 2px;');
    that.logo.setAttribute('class', 'logo');
    that.logo.setAttribute('alt', 'Lynckia');
    that.logo.setAttribute('src', that.url + '/assets/star.svg');

    // Private functions
    show = function (displaying) {
        if (displaying !== 'block') {
            displaying = 'none';
        } else {
            clearTimeout(waiting);
        }

        that.div.setAttribute('style', 'width: 100%; height: 100%; position: relative; bottom: 0; right: 0; display:' + displaying);
    };

    // Public functions

    that.display = function () {
        show('block');
    };

    that.hide = function () {
        waiting = setTimeout(show, 1000);
    };

    document.getElementById(that.elementID).appendChild(that.div);
    that.div.appendChild(that.bar);
    that.bar.appendChild(that.link);
    that.link.appendChild(that.logo);

    // Speaker component
    if (!spec.stream.screen && (spec.options === undefined || spec.options.speaker === undefined || spec.options.speaker === true)) {
        that.speaker = new Erizo.Speaker({elementID: 'subbar_' + that.id, id: that.id, stream: spec.stream, media: spec.media});
    }

    that.display();
    that.hide();

    return that;
};
/*global window, console, document */
/*
 * Speaker represents the volume icon that will be shown in the mediaPlayer, for example.
 * It manages the volume level of the media tag given in the constructor.
 * Every Speaker is a View.
 * Ex.: var speaker = Speaker({elementID: element, media: mediaTag, id: id});
 */
var Erizo = Erizo || {};
Erizo.Speaker = function (spec) {
    "use strict";
    var that = Erizo.View({}),
        show,
        mute,
        unmute,
        lastVolume = 50;

    // Variables

    // DOM element in which the Speaker will be appended
    that.elementID = spec.elementID;

    // media tag
    that.media = spec.media;

    // Speaker id
    that.id = spec.id;

    // MediaStream
    that.stream = spec.stream;

    // Container
    that.div = document.createElement('div');
    that.div.setAttribute('style', 'width: 40%; height: 100%; max-width: 32px; position: absolute; right: 0;z-index:0;');

    // Volume icon 
    that.icon = document.createElement('img');
    that.icon.setAttribute('id', 'volume_' + that.id);
    that.icon.setAttribute('src', that.url + '/assets/sound48.png');
    that.icon.setAttribute('style', 'width: 80%; height: 100%; position: absolute;');
    that.div.appendChild(that.icon);


    if (!that.stream.local) {

        // Volume bar
        that.picker = document.createElement('input');
        that.picker.setAttribute('id', 'picker_' + that.id);
        that.picker.type = "range";
        that.picker.min = 0;
        that.picker.max = 100;
        that.picker.step = 10;
        that.picker.value = lastVolume;
        that.picker.setAttribute("orient", "vertical"); //  FireFox supports range sliders as of version 23
        that.div.appendChild(that.picker);
        that.media.volume = that.picker.value / 100;
        that.media.muted = false;

        that.picker.oninput = function (evt) {
            if (that.picker.value > 0) {
                that.media.muted = false;
                that.icon.setAttribute('src', that.url + '/assets/sound48.png');
            } else {
                that.media.muted = true;
                that.icon.setAttribute('src', that.url + '/assets/mute48.png');
            }
            that.media.volume = that.picker.value / 100;
        };

        // Private functions
        show = function (displaying) {
            that.picker.setAttribute('style', 'background: transparent; width: 32px; height: 100px; position: absolute; bottom: 90%; z-index: 1;' + that.div.offsetHeight + 'px; right: 0px; -webkit-appearance: slider-vertical; display: ' + displaying);
        };

        mute = function () {
            that.icon.setAttribute('src', that.url + '/assets/mute48.png');
            lastVolume = that.picker.value;
            that.picker.value = 0;
            that.media.volume = 0;
            that.media.muted = true;
        };

        unmute = function () {
            that.icon.setAttribute('src', that.url + '/assets/sound48.png');
            that.picker.value = lastVolume;
            that.media.volume = that.picker.value / 100;
            that.media.muted = false;
        };

        that.icon.onclick = function (evt) {
            if (that.media.muted) {
                unmute();
            } else {
                mute();
            }
        }

        // Public functions
        that.div.onmouseover = function (evt) {
            show('block');
        };

        that.div.onmouseout = function (evt) {
            show('none');
        };

        show('none');

    } else {

        mute = function () {
            that.media.muted = true;
            that.icon.setAttribute('src', that.url + '/assets/mute48.png');
            that.stream.stream.getAudioTracks()[0].enabled = false;
        };

        unmute = function () {
            that.media.muted = false;
            that.icon.setAttribute('src', that.url + '/assets/sound48.png');
            that.stream.stream.getAudioTracks()[0].enabled = true;
        };

        that.icon.onclick = function (evt) {
            if (that.media.muted) {
                unmute();
            } else {
                mute();
            }
        }
    }
  

    document.getElementById(that.elementID).appendChild(that.div);
    return that;
};
