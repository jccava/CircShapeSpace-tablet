// IMAGE DISPLAY
	// Sync: buffer trial images
	function bufferTrialImages(){
		// (pre)render canvas (synchronous)
		function renderCanvas(idxcv,idxim,usesample,grid){
			var canvasobj=document.getElementById("canvas"+idxcv);
			var context=canvasobj.getContext('2d');
			context.fillStyle="rgb("+grayPoint[0].toString()+","+grayPoint[1].toString()+","+grayPoint[2].toString()+")";
			context.fillRect(0,0,canvasobj.width,canvasobj.height);

			var indpos
			indpos=grid;
			
			var xleft=[];
			var ytop=[];
			var xbound=[];
			var ybound=[];

			for (var i = 0; i <  idxim.length; i++){
					img = idxim[i];
			
					xleft[i] = xgridcent[indpos[i]] - 0.5*imagesTest.wd/canvasScale;
					ytop[i] = ygridcent[indpos[i]] - 0.5*imagesTest.ht/canvasScale;

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
						context.fillStyle = "rgb("+colorR[imageColor[i]]+","+colorG[imageColor[i]]+","+colorB[imageColor[i]]+")";
	console.log("C"); console.log(context.fillStyle);
						context.fillRect(xleft[i]+1,ytop[i]+1,imagesSample.wd/canvasScale-1,imagesSample.ht/canvasScale-1); 

					var packPtrIdx = img+trial.packsz*packTest;
					var imagePackIdx = imagesTest.packpointer[packPtrIdx];
					var swd = imagesTest.wd/canvasScale;
					var sht = imagesTest.ht/canvasScale;
					var testPtr = imagesTestPack[imagePackIdx];


					console.log("imagePackIdx");
					console.log(imagePackIdx);
					context.drawImage(testPtr,
						imagesTest.pixLR[img][0],0,imagesTest.wd,imagesTest.ht,xleft[i],ytop[i],
						swd,sht);
					//context.drawImage(imagesTestPack[imagesTest.packpointer[idxim[i]]],imagesTest.pixLR[idxim[i]][0],0,imagesTest.wd,imagesTest.ht,xleft[i],ytop[i],imagesTest.wd/canvasScale,imagesTest.ht/canvasScale);

					xbound[i]=[xleft[i], xleft[i]+imagesTest.wd/canvasScale];
					ybound[i]=[ytop[i], ytop[i]+imagesTest.ht/canvasScale];
				

		
			
				xbound[i][0]=xbound[i][0]+canvas.offsetleft;
				xbound[i][1]=xbound[i][1]+canvas.offsetleft;
				ybound[i][0]=ybound[i][0]+canvas.offsettop;
				ybound[i][1]=ybound[i][1]+canvas.offsettop;
			};


			console.log(context.fillStyle);
			// bounding boxes of images on canvas
			return {
				x: xbound,
				y: ybound
			};
		}

		//buffer (sample & test canvases)
		//sample

		console.log("trial.taskVersion");
		console.log(trial.taskVersion);
		//trial.sample[trial.current];
		var imageColor=[-1];

		
		// reshuffle routine if finished
		if (routineIdx==routine.length){
			routine=shuffleArray(routine);
			routineIdx=0;
		}
		
		colorSample=0;
		colorTest=0;
		packSample=0;
		packTest=0;


		trial.routineIdx[trial.current]=routine[routineIdx];
		
		//debugger
		var focalColor=imageColor;
		
		//test
		var imageColor=[-1,-1];
		testImageIdx=trial.test[trial.current];
		
		for (var i=0; i<=testImageIdx.length-1; i++){
			testImageIdx[i]=testImageIdx[i]-trial.packsz*Math.floor(testImageIdx[i]/trial.packsz);
		}

		trial.test[trial.current]=testImageIdx;
		
		
		//  must ignore CorrectItems!!!
		
		
// 		testImageIdx = [1, 3, 5, 7];
		
		imageColor = trial.testC[trial.current];
		console.log(testImageIdx);
		console.log(imageColor);
		
		boundingBoxesTest = renderCanvas(canvas.test,testImageIdx,false,trial.testgrid);
		
	}

	// Promise: display trial images
	function displayTrial(sequence,tsequence){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(){
// 			console.log('displayed images')
		});

		var start = null;
		function updateCanvas(timestamp){
			if (!start) start = timestamp;
			if (timestamp - start > tsequence[frame.current]){
				//console.log('displaying frame' + currframe + ' ' + timestamp);

				// Move canvas in front
				var prev_canvasobj=document.getElementById("canvas"+canvas.front);
				var curr_canvasobj=document.getElementById("canvas"+sequence[frame.current]);
				if (canvas.front != canvas.blank){
					prev_canvasobj.style.zIndex="0";
				} // move back

				if (sequence[frame.current] != canvas.blank){
					curr_canvasobj.style.zIndex="100";
					canvas.front = sequence[frame.current];
				} // move to front
				else{
					canvas.front = canvas.blank;
				}
				
				frame.shown[frame.current]=1;
				frame.current++;
			}; // if show new frame

			// continue if not all frames shown
			if (frame.shown[frame.shown.length-1] != 1){
				window.requestAnimationFrame(updateCanvas);
			}
			else{
				resolveFunc(1);
			}
		}

		//requestAnimationFrame advantages: goes on next screen refresh and syncs to browsers refresh rate on separate clock (not js clock)
		window.requestAnimationFrame(updateCanvas); // kick off async work
		return p
	} //displayTrial

	function renderBlank(){
		var canvasobj=document.getElementById("canvas"+canvas.blank);
		var context=canvasobj.getContext('2d');

		context.fillStyle="rgb("+grayPoint[0].toString()+","+grayPoint[1].toString()+","+grayPoint[2].toString()+")";
		context.fillRect(0,0,canvasobj.width,canvasobj.height);

		context.fillStyle="rgb("+grayPoint[0].toString()+","+grayPoint[1].toString()+","+grayPoint[2].toString()+")";
		context.fillRect(0,0,canvasobj.width,60);
	}

	function renderReward(){
		/*var canvasobj=document.getElementById("canvas"+canvas.reward);
		var context=canvasobj.getContext('2d');
		context.fillStyle="green";
		context.fillRect(xgridcent[4]-200,ygridcent[4]-200,400,400);

		context.fillStyle="black";
		context.fillRect(0,0,canvasobj.width,60);*/
	}

	function renderPhotoReward(){
		/*var canvasobj=document.getElementById("canvas"+canvas.photoreward);
		var context=canvasobj.getContext('2d');
		context.fillStyle="green";
		context.fillRect(xgridcent[4]-200,ygridcent[4]-200,400,400);

		context.fillStyle="white";
		context.fillRect(0,0,canvasobj.width,60);*/
	}


	function renderPunish(){
		/*var canvasobj=document.getElementById("canvas"+canvas.punish);
		var context=canvasobj.getContext('2d');
		context.rect(xgridcent[4]-200,ygridcent[4]-200,400,400);
		context.fillStyle="red";
		context.fill();

		context.fillStyle="black";
		context.fillRect(0,0,canvasobj.width,60);*/
	}

	function renderFixation(){
		var canvasobj=document.getElementById("canvas"+canvas.fix);
		var context=canvasobj.getContext('2d');
		context.clearRect(0,0,canvasobj.width,canvasobj.height);

		var xcent = xgridcent[trial.fixationgrid[trial.current]];
		var ycent = ygridcent[trial.fixationgrid[trial.current]];
		
			var base_image=document.getElementById("fixgif");
			context.drawImage(base_image, xcent-base_image.width/2, ycent-base_image.height/2);
			boundingBoxFixation.x = [xcent-base_image.width/2+canvas.offsetleft, xcent+base_image.width/2+canvas.offsetleft];
			boundingBoxFixation.y = [ycent-base_image.height/2+canvas.offsettop, ycent+base_image.height/2+canvas.offsettop];
		
		

		//add eye fixation
		//context.fillStyle="red";
		//context.fillRect(xgridcent[4]-6,ygridcent[4]-6,12,12);
		
		context.fillStyle="rgb("+grayPoint[0].toString()+","+grayPoint[1].toString()+","+grayPoint[2].toString()+")";
		context.fillRect(0,0,canvasobj.width,40);
	}
// IMAGE DISPLAY (end)