// MOUSE & TOUCH EVENTS
	function mousedown_listener(event){
		if(typeof event === 'undefined'){
			console.log('no click, loading images, initializing response promise');
			return
		};

		var x = event.clientX
		var y = event.clientY

		/*if (y < canvas.offsettop){
			//clicked on headsup display
			if (videoobj.paused == true){
				//videoobj.play();
				videoobj.style.zIndex = 100;
			}
			else if (videoobj.paused == false){
				videoobj.pause();
				videoobj.style.zIndex = 0;
			}
		}*/

		if (trial.waitingforFixation == 1){
			//determine if clicked on fixation dot
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				trial.brokeFixation = 0;
				trial.xytfixation[trial.current]=[x,y,Math.round(performance.now())];
				//Start timer
				fixationTimer = setTimeout(function(){waitforClick.next(1)},trial.fixationdur);
			} //if clicked fixation
			else{
			}
		}

		if (trial.waitingforResponse == 1){
			//determine if clicked in test box
			if (trial.taskVersion==0){
				boundingBoxesTest.x[0]=[0,document.body.clientWidth];
				boundingBoxesTest.y[0]=[0,document.body.clientHeight];
			}
			for (var q=0; q<=boundingBoxesTest.x.length-1; q++){
				if (x >= boundingBoxesTest.x[q][0] && x <= boundingBoxesTest.x[q][1] &&
					y >= boundingBoxesTest.y[q][0] && y <= boundingBoxesTest.y[q][1]){
					trial.response[trial.current]=q;
					trial.xytresponse[trial.current]=[x,y,Math.round(performance.now())];
					waitforClick.next(q);
					return
				}
			}
		}
	}

	function mousemove_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation==0){
			var x = event.clientX
			var y = event.clientY

			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				//holding fixation
			}
			else{
				// moved from fixation dot, cancel fixation timers
				trial.brokeFixation = 1;
				clearTimeout(fixationTimer);
			}
		}
	}

	function mouseup_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation == 0){
			// broke touch with fixation dot too early, cancel fixation timers
			trial.brokeFixation = 1;
			clearTimeout(fixationTimer);
		}
	}

	function touchstart_listener(event){
		event.preventDefault(); //prevents additional downstream call of click listener
		if(typeof event === 'undefined'){
			console.log('no click, loading images, initializing responsepromise');
			return
		};

		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;

		/*if (y < canvas.offsettop){
			//clicked on headsup display
			if (videoobj.paused == true){
				//videoobj.play();
				videoobj.style.zIndex = 100;
			}
			else if (videoobj.paused == false){
				videoobj.pause();
				videoobj.style.zIndex = 0;
			}
		}*/

		if (trial.waitingforFixation == 1){
			//determine if clicked on fixation dot
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				trial.brokeFixation = 0;
				trial.xytfixation[trial.current]=[x,y,Math.round(performance.now())];
				//Start timer
				fixationTimer = setTimeout(function(){waitforClick.next(1)},trial.fixationdur);
			} //if clicked fixation
			else{
			}
		}

		if (trial.waitingforResponse == 1){
			//determine if clicked in test box
			if (trial.taskVersion==0){
				boundingBoxesTest.x[0]=[0,document.body.clientWidth];
				boundingBoxesTest.y[0]=[0,document.body.clientHeight];
			}
			for (var q=0; q<=boundingBoxesTest.x.length-1; q++){
				if (x >= boundingBoxesTest.x[q][0] && x <= boundingBoxesTest.x[q][1] &&
					y >= boundingBoxesTest.y[q][0] && y <= boundingBoxesTest.y[q][1]){
					trial.response[trial.current]=q;
					trial.xytresponse[trial.current]=[x,y,Math.round(performance.now())];
					waitforClick.next(q);
					return
				}
			}
		}
	}

	function touchmove_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation==0){
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;

			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				//holding fixation
			}
			else{
				// moved from fixation dot, cancel fixation timers
				trial.brokeFixation = 1;
				clearTimeout(fixationTimer);
			}
		}
		else if (trial.waitingforFixation==1 && trial.brokeFixation==1){
			//check if moved back into fixation
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;

			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){

				//re-gained fixation
				trial.brokeFixation = 0;
				//Start timer
				fixationTimer = setTimeout(function(){waitforClick.next(1)},trial.fixationdur);			
			}
		}
	}

	function touchend_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation == 0){
			// broke touch with fixation dot too early, cancel fixation timers
			trial.brokeFixation = 1;
			clearTimeout(fixationTimer);
		}
	}
// MOUSE & TOUCH EVENTS (end)