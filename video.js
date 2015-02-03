/*
 * Cross-browser console.log wrapper
 * If no console.log throw alert;
 */

var isDebug = true;
var log = 
	!isDebug ?
		function(){
			eval(0);
		} : (
			window.console ? console.log.bind( console ) : function(){
				if(isDebug) {
					var args = ''
					for( var i = 0; i< arguments.length; i++)
						args += arguments[i] + "; ";
					window.alert( args );
				}
			}
		);
/*
*	Load player
*
*	@win - window object
*	@nodes - {
*		vo: <video> for output
*		so: status output node (div or span for ex.) - for ui messages
*		
*	}
*
*/
			
function localFileVideoPlayerInit(nodes, win) {
	var win = win || window;
	var URL;
	
	//functions
	var displayMessage; //log message to GUI
	var loadSelectedVideo; //load selected vudei file to <video> tag
	var loadSelectedAudio; //load selected audio track to play synchronously to video
	
	nodes.aib.disabled = true
	nodes.sib.disabled = true
	
	if( !nodes ){
		throw {
			exception: 1,
			message: 'NOT_ENOUGH_ARGS'
		};
	}
					
	URL = win.URL || win.webkitURL;
	if (!URL) {
		displayMessage(nodes.so, 'Your browser is not ' + 
		   '<a href="http://caniuse.com/bloburls">supported</a>!', true);
		
		throw {
			exception: 11,
			message: 'URL_CREATION_NOT_SUPPORTED'
		};
	}  
				
	displayMessage = function( node, isError, message ) {
		var node = nodes.so || document.getElementById('status');
		if(!node)
			throw {
				exception: 2,
				message: 'STATUS_NODE_NOT_FOUND'
			};
		
		node.style.display = "block";
		
		setTimeout( function(){
			node.style.display = "none";
		}, 2000);
			
		var isError = isError || false;
		var message = message || '';						
						
		node.innerHTML = message;
		node.className = isError ? 'error' : 'info';
	};
					
	//TODO: Remove;
	window.dm = displayMessage
	
	
	/*
	 * Create URL for file selected with input tag
	 */ 
	var createUrlForLocalFile = function( event ){
		var file = event.target.files[0];
		if( !event || !event.target || !event.target.files ){
			throw {
				exception: 3,
				message: 'FILE_NOT_FOUND'
			};
		}
		log(file)
		var audioNode = nodes.ao
		var type = file.type;
		var fileURL = URL.createObjectURL( file );
		
		return {
			'url' : fileURL,
			'type': type
		}
	}
				
	
				
	//sync audio/video
	var syncAudioVideo = function(){
		nodes.ao.currentTime = nodes.vo.currentTime;
	}
					
	var pauseAll = function(){
		nodes.ao.pause();
		nodes.vo.pause();
	}
					
	var playAll = function(){
		if(nodes.ao.currentTime)
			nodes.ao.currentTime = nodes.vo.currentTime;
		if(nodes.ao && nodes.ao.play)
			nodes.ao.play();
	
		nodes.vo.play();
	}
	
	loadSelectedVideo = function ( event ) {
		var fileDescriptor = createUrlForLocalFile(event);					
		var videoNode = nodes.vo
		var selectFileButton = nodes.sib;					
		var selectAudioButton = nodes.aib;	
		var canPlay = videoNode.canPlayType( fileDescriptor.type );
					
		//displayMessage( nodes.so, !canPlay, canPlay ? '' : 'Video format is not supported' );

		if (!canPlay || !fileDescriptor.url) {
			selectFileButton.disabled = true;
			selectAudioButton.disabled = true;
			throw {
				exception: 4,
				message: 'VIDEO_FORMAT_NOT_SUPPORTED'
			};
		} else {
			selectFileButton.disabled = false;
			selectAudioButton.disabled = false;
		}

		videoNode.src = fileDescriptor.url;
	}
					
	loadSelectedAudio = function( event ){
		var fileDescriptor = createUrlForLocalFile(event);
		var audioNode = nodes.ao;
		var canPlay = audioNode.canPlayType( fileDescriptor.type );
					
		//displayMessage( nodes.so, !canPlay, canPlay ? 'ok' : 'error' );

		if (!canPlay || !fileDescriptor.url) {
			throw {
				exception: 4,
				message: 'AUDIO_FORMAT_NOT_SUPPORTED'
			};
		}
		
		//disable video volume
		nodes.vo.addEventListener('play', playAll, false);
		nodes.vo.addEventListener('playing', playAll, false);
		nodes.vo.addEventListener('seeking', syncAudioVideo, false);
		nodes.vo.addEventListener('seeked', syncAudioVideo, false);
		nodes.vo.addEventListener('pause', pauseAll, false);
				
		nodes.vo.volume = 0;
		nodes.ao.volume = 1;
								
		audioNode.setAttribute('src', fileDescriptor.url);
					
		nodes.aib.innerHTML = '<i class="fa fa-close"></i> Disable external audio...'
					
		nodes.aib.removeEventListener ( 'click', selectAudio, false );
		nodes.aib.addEventListener('click', disableAudio, false);				
	}
				
	var disableAudio = function(){
		nodes.vo.volume = 1;
		nodes.ao.volume = 0;
					
		nodes.vo.removeEventListener('play', playAll, false);
		nodes.vo.removeEventListener('seeking', syncAudioVideo, false);
		nodes.vo.removeEventListener('seeked', syncAudioVideo, false);
		nodes.vo.removeEventListener('pause', pauseAll, false);
				
		nodes.aib.innerHTML = "<i class='fa fa-file-sound-o'></i> Add audio track..."
							
	}
				
	var disableSrt = function(){
		nodes.sib.innerHTML = '<i class="fa fa-file-text-o"></i> Add subtitles (.txt)...';
		document.getElementById('subcontainer').style.display = 'none';
		nodes.sib.removeEventListener ( 'click', disableSrt, false );
		nodes.sib.addEventListener('click', selectSrt, false);
		nodes.to.setAttribute('src', 'sample.srt');
		v();
	}
				
	var loadSelectedTrack = function( event ){
					
		var fileDescriptor = createUrlForLocalFile(event);
		var trackNode = nodes.to
		var type = fileDescriptor.type;
		var fileURL = fileDescriptor.url;
					
		trackNode.setAttribute('src', fileURL);
					
		v();//init videosub.js
					
				
		nodes.sib.innerHTML = "<i class='fa fa-close'></i> Disable subtitles"
		nodes.sib.removeEventListener ( 'click', selectSrt, false );
		nodes.sib.addEventListener('click', disableSrt, false);
				
		document.getElementById('subcontainer').style.display = 'block';
	}																																																																																																																																																																																																																																																																												  
				              
					
	var selectFile = function() {
		nodes.vi.click();//document.getElementById('video-src')
	}
			
	var selectAudio = function() {
		nodes.ai.click();//document.getElementById('video-src')
	}
				
	var selectSrt = function() {
		nodes.ti.click();		
		//document.getElementById('srt-src').click()
	}
																																																																																																																																																																																																																																																																																											  
	nodes.vi.addEventListener('change', loadSelectedVideo, false);
	nodes.ti.addEventListener('change', loadSelectedTrack, false);
	nodes.ai.addEventListener('change', loadSelectedAudio, false);
				
	//inputSrtNode.onChange = playSelectedSrt
		
	nodes.vib.addEventListener('click', selectFile, false);
		
	nodes.aib.addEventListener('click', selectAudio, false);
	nodes.sib.addEventListener('click', selectSrt, false);
				
				
				
	nodes.fullScreenButton.addEventListener('click', function(){
		document.getElementById('video-container').classList.add('full-width');
		document.getElementById('video-container').mozRequestFullScreen();
		document.getElementById('video-container').classList.add('fullscreen');
	}, false);
			
		
	document.getElementById('cancelFullScreen').addEventListener('click', function(){
		document.getElementById('video-container').classList.remove('fullscreen');
		document.mozCancelFullScreen();
	}, false)
	
	document.getElementById('menu-button').addEventListener('click', function(e){
		document.getElementById('nav-drawer').classList[
			document.getElementById('nav-drawer').classList.contains('active') ? 'remove' : 'add'
		]('active');
		e.stopPropagation();
	}, false);
				
	document.getElementById('nat-width-button').addEventListener('click', function(){
		document.getElementById('video-container').classList[
			document.getElementById('video-container').classList.contains('full-width') ? 'remove' : 'add'
		]('full-width');
		document.getElementById('nat-width-button').innerHTML = 
			document.getElementById('video-container').classList.contains('full-width') ? 
				'1:1' : '<i class="fa fa-expand">'
				
	}, false);
		
	
	
	document.getElementById('help-button').addEventListener('click', function(){
		document.getElementById('help-button').classList[
			document.getElementById('help').classList.contains('visible') ? 'remove' : 'add'
		]('help-visible');
		
		document.getElementById('help').classList[
			document.getElementById('help').classList.contains('visible') ? 'remove' : 'add'
		]('visible');
	}, false);
			
	
				
	var closeMenu = function(){
		document.getElementById('nav-drawer').classList.remove('active');
	}
				
	//nodes.vib.addEventListener('click', closeMenu, false);
	//nodes.sib.addEventListener('click', closeMenu, false);
	//nodes.aib.addEventListener('click', closeMenu, false);
	document.body.addEventListener('click', closeMenu, false);
};
		
window.onerror = function(){
	var e = arguments [4];
	document.getElementById('player').pause();
	alert( 
		"Oops. "+
		"\r\nMaybe you are trying to play unsupported video OR" +
		" your browser is not supported. "+
		"\r\nJust try again if you sure that everything is Ok." +
		"\r\nError description: " + (e.message ? e.message : "unknown error") )
	return true
}

localFileVideoPlayerInit (
	{
		//output
		ao: document.getElementById('audio'), //audio output
		vo: document.getElementById('player'), //video output
		so: document.getElementById('status'), //status text output
		to: document.getElementById('srt-node'), //track output
				
		//input
		ai: document.getElementById('audio-src'), //audio input
		vi: document.getElementById('video-src'), //video input
		ti: document.getElementById('srt-src'), //track input
				
		//input-triggering buttons
		aib: document.getElementById('audio-src-button'),
		vib: document.getElementById('video-src-button'),
		sib: document.getElementById('srt-src-button'),
				
		//controls
		fullScreenButton: document.getElementById('fullscreen-button') //Full screen switcher;
	}, 
	window 
);

