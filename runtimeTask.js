// VARIABLES begin
// Variables (general)
	document.body.style.backgroundColor = "rgb("+grayPoint[0].toString()+","+grayPoint[1].toString()+","+grayPoint[2].toString()+")";
	
	var subjectlist = ["Task_0_CircSpaceTest"];
	var subjectdialog = document.getElementById("subjid_dialog");
	var subjectlistobj = document.getElementById("subjid_list");
	//populate list
	for (var q=subjectlist.length-1; q>=0; q--){
		// add menu option
		var opt = document.createElement('option');
		opt.value = q;
		opt.innerHTML = subjectlist[q];
		subjectlistobj.appendChild(opt);
	}
	subjectlistobj.addEventListener("change",subjectlist_listener,false);
	var paramfile={
		dir: "/parameterfiles/",
		name: null,
		data: null,
		ver: null,
		date: null,
		datahasChanged: false,
		filehasChanged: false,
	}
	var canvas = {
		blank: 0,
		sample: 1,
		test: 2,
		fix: 3,
		reward: 4,
		photoreward: 5,
		punish: 6,
		front: 0,
		sequencepre: [0,3],
		tsequencepre: [0,100],
		sequence: [0,1,0,2], //0=gray 1=sample 2=test 3=fix 4=reward 5=punish
		tsequence: [0,100,100+100,100+100+100], //timing between frames
		sequenceSkipSample: [0,2], //0=gray 1=sample 2=test 3=fix 4=reward 5=punish
		tsequenceSkipSample: [0,100], //timing between frames
		sequencepost: [0,4,4,0],
		tsequencepost: [0,0,0,0],
		headsupfraction: 1/3,
		offsetleft: 0,
		offsettop: 0,
	};
	var imagesSample = {
		folder: "/images/imagepacks/imp",
		//packsz: 8,
		serial: [],
		obj: [],
		packpointer: [],
		packserial: [],
		packpos: [],
		pixLR: [],
	}; //filenames will be placed in images[idx].src
	var imagesTest = {
		folder: "/images/imagepacks/imp",
		//packsz: 8,
		serial: [],
		obj: [],
		packpointer: [],
		packserial: [],
		packpos: [],
		pixLR: [],
	}; //filenames will be placed in imagesProto[idx].src
	var imagesSamplePack
	var imagesTestPack
	var frame = {
		current: 0,
		shown: [],
	}
	var boundingBoxFixation=[]; //where the fixation dot is on the canvas
	var boundingBoxesTest; //where the test images are on the canvas
	var waitforClick; //variable to hold generator
	var fixationTimer; //variable to hold timer
	var xgrid=[];
	var ygrid=[];
	var xgridcent=[];
	var ygridcent=[];
	var curridx = null;
	var battery = {
		current: 0,
		ldt: [],
	}
	var datafiles=[];
	var ndatafiles2read=5;

// Variables (updatable through parameter file)
	var env = {};
	var trial = {
		subjid: "Test",
		datadir: "/MonkData/",
	};
	var trialhistory={
		trainingstage: [],
		correct: [],
		current: 0,
	}
// VARIABLES end

// Screen, Video, & Audio initialization begin
	// Prevent window scrolling and bounce back effect
	document.body.addEventListener('touchmove',function(event){
		event.preventDefault();
	}, false);

	//Audio pulses for reward
	var audiocontext = new (window.AudioContext || window.webkitAudioContext)();
	var gainNode = audiocontext.createGain();
	gainNode.connect(audiocontext.destination);

	var devicePixelRatio = window.devicePixelRatio || 1;
	var visiblecanvasobj = document.getElementById("canvas" + canvas.front);
	var visiblecontext = visiblecanvasobj.getContext("2d");
	var backingStoreRatio = visiblecontext.webkitBackingStorePixelRatio ||
	                            visiblecontext.mozBackingStorePixelRatio ||
	                            visiblecontext.msBackingStorePixelRatio ||
	                            visiblecontext.oBackingStorePixelRatio ||
	                            visiblecontext.backingStorePixelRatio || 1;
	var canvasScale = devicePixelRatio/backingStoreRatio;
	
	//Start video stream
	
	//var videoobj = document.getElementById('video');
	//videoobj.addEventListener('mousedown',mousedown_listener,false);
	//videoobj.addEventListener('touchstart',touchstart_listener,false);
	navigator.getMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
	//navigator.getMedia({video: true, audio: false},function(stream){videoobj.src=window.URL.createObjectURL(stream)},function(err){alert('viderror');console.log('problem starting video stream')});

	//Monitor Battery - from: http://www.w3.org/TR/battery-status/
	navigator.getBattery().then(function(batteryobj){
		battery.ldt[battery.current]=[batteryobj.level, batteryobj.dischargingTime, Math.round(performance.now())];
		battery.current++;

		batteryobj.addEventListener('levelchange',function(){
			battery.ldt[battery.current]=[batteryobj.level, batteryobj.dischargingTime, Math.round(performance.now())];
			battery.current++;
		})
	});
	
// Screen, Video, & Audio initialization end

//Generator DMS task
spawn(function* (){

	// GET PARAMFILE NAME
	subjectdialog.showModal();
	yield subjidPromise();
	yield primeJuice();
	//yield getFileListDropbox();
	if (datafiles.length < ndatafiles2read){
		ndatafiles2read = datafiles.length;
	}
	for (i=0; i <= ndatafiles2read - 1; i++){
		yield readPerformanceHistoryfromDropbox(i);
	}

	paramfile.name = paramfile.dir + trial.subjid + "_params.txt";
	trial.need2loadParameters = 1;
	trial.need2loadImages = 1;

	//videoobj.style.height=480 + "px";
	//videoobj.play();
	for (trial.current=0; trial.current<10000; trial.current++){

		if (trial.need2loadParameters == 1){
			//debugger
			//yield readParametersfromDropbox();
			yield parseAutomatorFilefromDropbox(paramfile.name)
            //yield parseAutomatorFilefromDropbox()
            //yield readParametersfromDropbox();
            data = newtrial[0]
            //typeof data.sampleOn
           // data.length
            //var trial = {};
            //trial = _.object(data)

            for (var k in data){
                if (data.hasOwnProperty(k)) {
                    trial[k] = data[k];
                }
            }
			env["weight"] = trial.Weight;
				env["species"] = trial.Species;
				env["homecage"] = trial.Homecage;
				env["separated"] = trial.Separated;
				env["liquid"] = trial.Liquid;
				env["tablet"] = trial.Tablet;
				env["pump"] = trial.Pump;
				trial.objectlist = trial.TestedObjects;
				trial.nway = trial.Nway;
				trial.samplegrid = trial.SampleGridIndex;
				trial.testgrid = trial.TestGridIndex;
				trial.rewardStage = trial.RewardStage;
				trial.rewardper1000 = trial.RewardPer1000Trials;
				trial.extrarewardmult = trial.ExtraRewardMult;
				// trial.reward = trial.RewardDuration;
				trial.punish = trial.PunishTimeOut;
				trial.fixationdur = trial.FixationDuration;
				trial.fixationradius = trial.FixationRadius;
				trial.fixationmove = trial.FixationMove;
				trial.sampleON = trial.SampleON;
				trial.sampleOFF = trial.SampleOFF;
				trial.keepSampleON = trial.KeepSampleON;
				trial.hidetestdistractors= trial.HideTestDistractors;
				trial.sampleblocksize = trial.SampleBlockSize;
				trial.nstickyresponse = trial.NStickyResponse;
				trial.imageFolderSample = trial.ImageFolderSample;
				trial.imageFolderTest = trial.ImageFolderTest;
				trial.taskVersion = trial.TaskVersion;
				trial.packsz = trial.packsz;
				trial.perobj = trial.perobj;
				trial.counter = trial.counter;
				trial.params = paramfile.name;
				
				trial.narrowWeights = narrowWeights;
				trial.broadWeights = broadWeights;
				if (trial.taskVersion<2){ // if task version is 0 or 1, skip sample-test matching
					trial.rewardStage = 0;
					trial.imageFolderSample=1;trial.imageFolderTest=1;
					trial["routine"] = trial.routine;
					routine=trial.routine;
					routineIdx=routine.length;
				}
            trial.objectlist = trial.TestedObjects;
            //debugger
            trial.testgrid = trial.TestGridIndex;
            trial.samplegrid = trial.SampleGridIndex;

            console.log(trial.objectlist)
			canvas.tsequence = [0,100,100+trial.sampleON,100+trial.sampleON+trial.sampleOFF]; //timing between frames
			imagesSample.folder = "/images/imagepacks" + trial.ImageFolderSample + "/imp";
			imagesTest.folder = "/images/imagepacks" + trial.ImageFolderTest + "/imp";
			setReward(); canvas.tsequencepost[3] = canvas.tsequencepost[2]+trial.reward*1000;

			canvas.headsupfraction=0;
			setupCanvasHeadsUp()
			windowWidth = window.innerWidth; // get true window dimensions at last moment
			windowHeight = window.innerHeight;

			for (i = 0; i <= canvas.punish; i++) {setupCanvas(i);}
			if (devicePixelRatio !== 1){
				scaleCanvasforHiDPI(canvas.sample);
				scaleCanvasforHiDPI(canvas.test);
			}

		//reset trial tracking variables
			var d = new Date;
			var datestr = d.getFullYear().toString()+'-'+("00" + (d.getMonth()+1).toString()).slice(-2)+'-'+("00" + d.getDate().toString()).slice(-2)+'_'+("00" + d.getHours().toString()).slice(-2)+'-'+("00" + d.getMinutes().toString()).slice(-2)+'-'+("00" + d.getSeconds().toString()).slice(-2);
			trial.filename = datestr + "_" + trial.subjid + ".txt";
			trial.current=0;
			trial.fixationgrid=[];
			trial.routineIdx=[];
			trial.sample=[];
			trial.sampleC=[];
			trial.test=[];
			trial.testC=[];
			trial.sampleserial=[];
			trial.sampleserialC=[];
			trial.testserial=[];
			trial.testserialC=[];
			trial.tstart=[]
			trial.xytfixation=[];
			trial.xytresponse=[];
			trial.response=[];
			trial.correctItem=[];
			trial.sampleblockidx=0;
			trial.stickyresponse=0;

			trial.need2loadParameters = 0;

			renderReward();
			renderPhotoReward();
			renderPunish();
			renderBlank();

		}

		if (trial.need2loadImages == 1){
		// SELECT IMAGES
			//debugger
			funcreturn = getImageList(imagesSample,trial.ImageFolderSample);
			imagesSample = funcreturn.images;
			imagesSamplePack = funcreturn.imagesPack;
			funcreturn = getImageList(imagesTest,trial.ImageFolderTest);
			imagesTest = funcreturn.images;
			imagesTestPack = funcreturn.imagesPack;
		// SELECT IMAGES (end)

            trial.narrowWeights = narrowWeights;
            trial.broadWeights = broadWeights;
		// LOAD IMAGES
			imageSamplepromises = imagesSamplePack.packserial.map(loadSampleImagefromDropbox); //create array of image load Promises
			yield Promise.all(imageSamplepromises); //simultaneously evaluate array of image load promises

			imageTestpromises = imagesTestPack.packserial.map(loadTestImagefromDropbox); //create array of image load Promises
			yield Promise.all(imageTestpromises); //simultaneously evaluate array of image load promises

			// pixel locations of image within pack - individual images must be square
			imagesSample.wd = imagesSamplePack[0].height;
			imagesSample.ht = imagesSamplePack[0].height;

			imagesTest.wd = imagesTestPack[0].height;
			imagesTest.ht = imagesTestPack[0].height;
			
// 			for (i = 0; i<= imagesSample.serial.length-1; i++){
// 				imagesSample.pixLR[i] = [imagesSample.packpos[i] * imagesSample.wd, (imagesSample.packpos[i]+1) * imagesSample.wd - 1];
// 			}
			for (i = 0; i<= imagesTest.serial.length-1; i++){
				imagesTest.pixLR[i] = [imagesTest.packpos[i] * imagesTest.wd, (imagesTest.packpos[i]+1) * imagesTest.wd - 1];
			}
		// LOAD IMAGES (end)

		// MAKE THE IMAGE DISPLAY GRID (3x3)
			var cnt=0;
			for (var i=1; i<=3; i++){
				for (var j=1; j<=3; j++){
					xgrid[cnt]=i - 1/2;
					ygrid[cnt]=j - 1/2;
					cnt++;
				}
			}

		//center x & y grid within canvas
			var dx = (document.body.clientWidth - canvas.offsetleft)*devicePixelRatio/2/canvasScale - xgrid[4]*imagesSample.wd/canvasScale;
			var dy = (document.body.clientHeight - canvas.offsettop)*devicePixelRatio/2/canvasScale - ygrid[4]*imagesSample.ht/canvasScale;
			for (var i=0; i<=xgrid.length-1; i++){
				xgridcent[i]=xgrid[i]*imagesSample.wd/canvasScale + dx;
				ygridcent[i]=ygrid[i]*imagesSample.ht/canvasScale + dy;
			}
	// MAKE THE IMAGE DISPLAY GRID (end)
		// renderBlank();
		renderReward();
		renderPhotoReward();
		renderPunish();
		renderBlank();
		trial.need2loadImages = 0;
	}

			trial.fixationgrid[trial.current]=5;


		funcreturn=getTest(trial.nway);


		trial.test[trial.current]=funcreturn.testArray;
		trial.testC[trial.current]=funcreturn.testColor;
		//trial.correctItem[trial.current]=-2;//=funcreturn.correctItem;

	//GET IMAGE SERIALS
		trial.sampleserial[trial.current]=imagesSample.serial[trial.sample[trial.current]];
		var testserial=[];
		for (var q in trial.test[trial.current]){
			testserial[q]=imagesTest.serial[trial.test[trial.current][q]];
		}
		trial.testserial[trial.current]=testserial;
	// CHOOSE FIXATION, SAMPLE, TEST (end)
	//FIXATION
		trial.stage=0;
	 //takephoto(trial.current,trial.stage);

	//buffer fixation, sample & test
		renderFixation();
		bufferTrialImages();

	//fixation
		trial.tstart[trial.current]=Math.round(performance.now());
		frame.shown=[];
		for (var q in canvas.sequencepre){frame.shown[q]=0}; frame.current=0;
		yield displayTrial(canvas.sequencepre,canvas.tsequencepre);
		audiocontext.suspend();
		yield fixationPromise();
		trial.waitingforFixation=0;
		
	trial.stage=1;
	// sample & test
		
		if (trial.rewardStage === 1){
			frame.shown=[];
			for (var q in canvas.sequence){frame.shown[q]=0}; frame.current=0;
			//if (skipSample==0){
				yield displayTrial(canvas.sequence,canvas.tsequence);//}
				audiocontext.suspend();
			//else if (skipSample==1){
				//yield displayTrial(canvas.sequenceSkipSample,canvas.tsequenceSkipSample);}
			yield responsePromise();
			trial.waitingforResponse=0;
		}
		if (typeof trial.counter !== 'undefined' && trial.counter == 1){
			document.getElementById("trialcounter").style="z-index:100; height: 30px;";
			document.getElementById("trialcounter").innerHTML = "Trial " + trial.current;
		}
		
// take photo on task completion
	 //takephoto(trial.current,trial.stage);
	batterySnapshot(trial.current,trial.stage);
	 
	trial.stage=2;
		// reward || punish
		frame.shown=[];
		for (var q in canvas.sequencepost){frame.shown[q]=0}; frame.current=0;
		if (trial.rewardStage === 0){ //reward fixation
			canvas.sequencepost[1]=canvas.reward;
			canvas.sequencepost[2]=canvas.photoreward;
			console.log('fixation reward')
		}
		else if (trial.rewardStage === 1){ //reward DMS
			if (trial.response[trial.current] == trial.correctItem[trial.current]){
			//if (trial.response[trial.current] == trial.correctItem[trial.current]){ //reward
				canvas.sequencepost[1]=canvas.reward;
				canvas.sequencepost[2]=canvas.photoreward;
				console.log('correct')
			}
			else { //punish
				canvas.sequencepost[1]=canvas.punish;
				canvas.sequencepost[2]=canvas.punish;
				console.log('WRONG!')
			}

			if (trial.current>0){ //stuck responding to same side
				if (trial.response[trial.current]==trial.response[trial.current-1]){
					trial.stickyresponse++;
				}
				else {
					trial.stickyresponse=0;
				}
			}
		}
		
		//for (var i = 0; i < canvas.tsequencepost.length; i++){
		//	canvas.tsequencepost[i]=canvas.tsequencepost[i]/4;
		//}
		canvas.tsequencepost[3]=0;
		yield displayTrial(canvas.sequencepost,canvas.tsequencepost);
		if (canvas.sequencepost[1]==canvas.reward){
			yield dispenseReward(trial.reward*trial.extrarewardmult);
		}
		else if (canvas.sequencepost[1]==canvas.punish){
			yield dispensePunish();
		}

	//update the running trial history
		if (trial.current == 0){
			funcreturn = updateTask("readtaskstageonly");
			trialhistory.trainingstage[trialhistory.current] = funcreturn;
			trial["currentstage"]=trialhistory.trainingstage[trialhistory.current];
		}
		if (trial.rewardStage==0 | trial.response[trial.current] == trial.correctItem[trial.current]){
			trialhistory.correct[trialhistory.current]=1;
		}
		else{
			trialhistory.correct[trialhistory.current]=0;
		}
		trialhistory.current++;

		//takephoto(trial.current,trial.stage);

		console.log('ready to write data')

		//save data
		writeDatatoDropbox(); //async - no need to wait for data to write
		updateHeadsUpDisplay(); // async

		console.log('end of generator iteration' + trial.current);


	// Check if need to update task
		updateTask("writeifneeded");
		if (trial.need2loadParameters == 1){
			console.log("updating task parameters (new stage or reward)");
			yield writeParameterstoDropbox();
		}

	}
	console.log('end of generator for loop');
}) //spawn