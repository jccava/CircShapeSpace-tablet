// STATES

	// Promise: Select Subject
	function subjidPromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User selected ' + resolveval)});

		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}

		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}

	function subjectlist_listener(event){
		console.log("subject selected");
		trial.subjid = subjectlist[this.value];
		subjectdialog.close();
		waitforClick.next(1);
		return
	}


	// Promise: fixation
	function fixationPromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User clicked ' + resolveval)});

		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}
		
		trial.waitingforFixation = 1;
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}

	// Promise: response
	function responsePromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User clicked ' + resolveval)});

		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}

		trial.waitingforResponse = 1;
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}

	// Promise: dispense reward (through audio control)
	function dispenseReward(rewardTime){
		return new Promise(function(resolve,reject){
			audiocontext.resume();
			var oscillator = audiocontext.createOscillator();
			gainNode.gain.value=1;

			oscillator.type='square'; //Square wave
			oscillator.frequency.value=10; //frequency in hertz		
			
			var currentTime=audiocontext.currentTime;
			oscillator.start(currentTime);
			oscillator.stop(currentTime + trial.reward);
// 			oscillator.stop(currentTime + rewardTime/2); //edited this so I can use variable reward times
			setTimeout(function(){console.log('sound done'); resolve(1);},rewardTime/2*1000);
			audiocontext.suspend();
			//printObject(oscillator.frequency);
		}).then();
	}

	// Promise: punish time-out
	function dispensePunish(){
		return new Promise(function(resolve,reject){
			setTimeout(function(){resolve(1);},trial.punish); //milliseconds
		}).then();
	}
	
	
	function primeJuice(){
		return new Promise(function(resolve,reject){
			
			audiocontext.resume();
			var primeosc = audiocontext.createOscillator();
			gainNode.gain.value = 1;
			primeosc.type='square'; //Square wave
			primeosc.frequency.value = 10; //frequency in hertz		
			primeosc.connect(audiocontext.destination); //Connect sound to output			
			var timenow = audiocontext.currentTime;
			primeosc.start(timenow);
// 			primeosc.stop(timenow + 4000);
			primeosc.stop(timenow + 500);
// 			setTimeout(function(){console.log('sound done'); resolve(1);},4000);
			setTimeout(function(){console.log('sound done'); resolve(1);},500);
			audiocontext.suspend(); //AUDIOCONTROL
			
		}).then();
	}
// STATES (end)