/*
The multi-upload script

*/

function $fileUpload(formId, settings) {
        
	var status;
	var statusText;
	
	if (!window.File || !window.FileList) {
		return;
	}
	
	if (typeof settings === 'undefined') {
		settings = {};
	}
	//the function 'ready' will start after DOM fully loaded
	window.addEventListener('load', ready, false);
	
	function ready() {
              
		//Checking if the settings object is exists and it contains input file component id 
		if (typeof formId === 'undefined' ) {
			return;
		}
		
		settings = setDefaultSettings(settings);
		
		//The variable contains the form DOM-object
		var form = document.getElementById(formId);

		//Checking if the box id for progressbars is set up. If not - set up it to form.
		if (typeof settings.fileList === 'undefined') {
			settings.fileList = form;
		} else {
			settings.fileList = document.getElementById(settings.fileList);
			if (settings.fileList === null) {
				settings.fileList = form;
			}
		}

				
		//The array which contains, for every file: the file, the file information and progressbar object
		var filesArray = [];
		
		//The variable contains the number of current uploading file
		var currentFileCounter = 0;
		
		var errorsCount = 0;
	
		//the variable contains the input type='file' DOM-object
		var filesInput = form.querySelector('input[type="file"]');
		
		if (typeof filesInput === 'null') return;
		
		if (settings.multiple === true || typeof settings.multiple === 'undefined') {
		    filesInput.setAttribute('multiple', 'multiple');
		}
		
		if ( settings.fileInputClass !== '') {
		    filesInput.setAttribute('class', filesInput.getAttribute('class') + ' ' + settings.fileInputClass);
		}
		//the variable contains the input type='submit' DOM-object (to replace it with custom button element)
		var submitButton = form.querySelector("input[type='submit']");
		
		if(typeof submitButton === 'null') return;
		
		//the variable contains the custom button
		var sendButton = document.createElement('input');
		if (settings.uploadImmediately) {
			sendButton.style.display = "none";
		}
		sendButton.setAttribute('type', 'button');
		sendButton.setAttribute('class', 'fileupload-button ' + settings.sendButtonClass);

		//Copying css class from submit to own button
		if (submitButton.getAttribute('class') !== null) {
			sendButton.setAttribute('class', sendButton.getAttribute('class') + ' ' + submitButton.getAttribute('class'));
		}
                
		if (submitButton.getAttribute('value') === null) {
			sendButton.setAttribute('value', settings.language.uploadfiles);
		} else {
			sendButton.setAttribute('value', submitButton.getAttribute('value'));
		}
		
		//removing submit button and replace it with custom button
		submitButton.setAttribute('disabled', 'disabled');
		submitButton.style.display = 'none';
		
		form.insertBefore(sendButton, submitButton);
		
		//The function for sending file
		sendButton.onclick = sendFile;
		
		//Onchange event of input type = file element
		/*
			for every file is selected it creates the element in the filesArray array. 
			This element contains:
			name, size, type - just information about the file$
			file - the fileAPI-object from input element
			progressBar - the progressBar object which contains the set of elements for showing progress bar, mesages and text information about the file.
			loaded - the simple boolean variable which 'says' if file has been uploaded or not, normally 'false'.
			For files which cannot be uploaded because of size it set for 'true'.
		*/

		var previewsArray = [];
		
		filesInput.onchange = function() {
		    
			var currentlyFilesInArray = filesArray.length;
			
			for (var i = 0; i < this.files.length; i++) {
			    
			    var pbar = createProgressDiv(this.files[i].name, this.files[i].size, i);

			    var currentFile = this.files[i];
				
			    if (settings.showPreviews) {
					var reader = new FileReader;
					
					reader.fileData = currentFile;
					reader.fileNumber = i + currentlyFilesInArray;
					
					reader.addEventListener('load', function(event) {
						
						createPreview(event.target, currentFile);
						if (settings.uploadImmediately) {
							sendFile();
						}
					});
					
					reader.readAsDataURL(currentFile);
			    } else {
					filesArray[i+currentlyFilesInArray] = {
						'name'        : this.files[i].name, 
						'size'        : this.files[i].size, 
						'type'        : this.files[i].type, 
						'file'        : this.files[i],
						'progressBar' : pbar,
						'loaded'      : false
					};
					if (this.files[i].size > settings.maxFileSize) {
						filesArray[i + currentlyFilesInArray].loaded = true;
						filesArray[i + currentlyFilesInArray].progressBar.errorMessage(this.files[i].name + settings.language.tooBig);
					}
					settings.fileList.appendChild(pbar.container);
					if (settings.uploadImmediately) {
						sendFile();
					}
			    }

			    function createPreview(loadedFile, currentFile, index) {
					 
					var currentFile = loadedFile.fileData;
					
					pbar = createProgressDiv(currentFile.name, currentFile.size, index);
					
					var imagesPattern = /image\/.*/i;
					
					if (imagesPattern.test(currentFile.type)) {
						var img = new Image();
						img.setAttribute('style', 'height:' + settings.previewHeight + ';');
						img.src = loadedFile.result;
						pbar.info.insertBefore(img, pbar.messageElement);
					}
					filesArray[loadedFile.fileNumber] = {
						'name' : currentFile.name, 
						'size' : currentFile.size, 
						'type' : currentFile.type, 
						'file' : currentFile,
						'progressBar' : pbar,
						'loaded' : false
					};
					if (currentFile.size > settings.maxFileSize) {
						filesArray[loadedFile.fileNumber].loaded = true;
						filesArray[loadedFile.fileNumber].progressBar.errorMessage(currentFile.name + settings.language.tooBig);
					}
					settings.fileList.appendChild(pbar.container);
			    }
			}

		};
		
		//Function which create progress bar for every file
		/* Returns the object which contains:
			Properties:
				container - the div-container for progress bar and text string
				info - the div contains the text information
				bar - the progress HTML element
			Methods:
				message: change the text in the 'info' element
				errorMesage: do the same as message() method but add the error class for 'info' element.
				barValue: set the value of the 'bar' element
				barMax: set the max value of the 'bar' element
		*/
		function createProgressDiv(name, size, index) {
		console.log(index);
			if (typeof index === 'undefined') {
				index = 0;
			}
			var progressDiv = document.createElement('div');
			progressDiv.className = 'file-upload-box';
			
			var messageElement = document.createElement('span');
			messageElement.innerHTML = name + ', size: ' + size;
			
			var infoDiv = document.createElement('div');
			infoDiv.className = 'file-upload-box-info';
			infoDiv.appendChild(messageElement);
			
			progressDiv.appendChild(infoDiv);
			
			var progressElement = document.createElement('progress');
			progressElement.value = '0';
			progressDiv.appendChild(progressElement);
			
			var deleteButton = document.createElement('button');
			deleteButton.className = 'file-upload-delete-button';
			deleteButton.setAttribute('data-type', 'deleteButton');
			deleteButton.setAttribute('data-index', index);
			deleteButton.innerHTML = '&times;';
			progressDiv.appendChild(deleteButton);

			var progressBar = {
				'container'      : progressDiv,
				'info'           : infoDiv,
				'bar'            : progressElement,
				'messageElement' : messageElement,
				'deleteButton'   : deleteButton,
				'message' : function (msg) {
								this.messageElement.innerHTML = msg;
								this.info.className = 'file-upload-box-info';
								this.info.setAttribute('title', msg);
							},
				'errorMessage' : function (msg) {
								this.messageElement.innerHTML = msg;
								this.info.className = this.info.className + ' error_message';
								this.info.setAttribute('title', msg);
							},
				'barValue': function (val) {
								this.bar.value = val;
							},
				'barMax': function (max) {
								this.bar.max = max;
							}
				
			};
			progressDiv.addEventListener('click', function(event) {
									clickEventListener(event, progressBar) 
								}, false);
			return progressBar;
			
		}
		
		/* The functions callbacks:
			sendFile() checks is there any files to send. 
			If yes, it calls upload(), which sends the file. While file is uploaded, upload() permanently calls the onProgress() function, which show to user the upload progress. 
			After the upload is complete, upload() calls onSuccess() function,
			which change 'loaded' property in fileArray for 'true', increments the currentFileCounter variable and calls the sendFile() again.
			If the sendFile has not files to uploading, it set currentFileCounter for '0' and stop.
			If the 'loaded' property of file is set for 'true', file will not uploaded and sendFile will call the onSuccess() function.
		*/
		
		//Sending files
						
		function sendFile() {
			if (currentFileCounter < (filesArray.length)) {
				if (filesArray[currentFileCounter].loaded !== true) {
					upload(); 
				} else {
					onSuccess();
				}
			} else {
				sendButton.removeAttribute('disabled');
				filesInput.removeAttribute('disabled');
				currentFileCounter = 0;
				if (settings.onAllFilesLoaded) {
					settings.onAllFilesLoaded(filesArray);
				}
			}
		}
		
		//Upload function
		function upload() {
			
			sendButton.setAttribute('disabled', 'disabled');
			filesInput.setAttribute('disabled', 'disabled');
			
			filesArray[currentFileCounter].progressBar.message(settings.language.loading + filesArray[currentFileCounter].name + '...');
			
			var xhr = new XMLHttpRequest();
			
			//If file uploaded successfully...
			xhr.onload = function() {
				if (this.status == 200) {
					statusText = this.responseText;
					onSuccess(statusText);
					return;
				}
			};
			//Show progress to user
			xhr.upload.onprogress = function(event) {
				onProgress(event.loaded, event.total);
			};
			
			//If error:
			xhr.onerror = function() {
				//Showing user the number of attempt
				if (errorsCount < settings.maxErrorsCount) {
					
					errorsCount++;
					
					filesArray[currentFileCounter].progressBar.errorMessage(
					'(' + errorsCount + ')' + settings.language.tryingToSend + filesArray[currentFileCounter].name + '...');
					
					filesArray[currentFileCounter].progressBar.barValue('0');
					
					setTimeout(upload, settings.errorTimeout);
					
				} else {
					alert(settings.language.error + this.statusText);
					filesArray[currentFileCounter].progressBar.errorMessage (settings.language.failed + filesArray[currentFileCounter].name);
					sendButton.removeAttribute('disabled');
					filesInput.removeAttribute('disabled');
				}    
				
			};

			xhr.open("POST", settings.acceptor, true); 
			
			var formData = new FormData();
			
			formData.append("files", filesArray[currentFileCounter].file);
			
			for (var k in settings.data) {
			    if (typeof settings.data[k] === 'function') {
					var value = settings.data[k]();
			    } else {
					var value = settings.data[k];
			    }
			    formData.append(k, value);
			}
			
			xhr.send(formData);
		}
		
		//Function for showing uploaded bytes
		function onProgress(loaded, total) {
			filesArray[currentFileCounter].progressBar.barMax(total);
			filesArray[currentFileCounter].progressBar.barValue(loaded);
		}
		
		//success function
		function onSuccess(status) {
			filesArray[currentFileCounter].progressBar.message(filesArray[currentFileCounter].name + '  ' + settings.language.loaded);
			
			var hasBeenAlreadyLoaded = filesArray[currentFileCounter].loaded;
			
			if (settings.onFileLoaded) {
			    if (typeof status === 'undefined') {
					status = '';
			    }
			    filesArray[currentFileCounter].status = status;
				if (!hasBeenAlreadyLoaded) {
					settings.onFileLoaded(filesArray[currentFileCounter]);
				}
			}
			filesArray[currentFileCounter].loaded = true;
			currentFileCounter++;				
			sendFile();
		}
		function clickEventListener(event, progressBar) {
			event.preventDefault();
			if (event.target.tagName == 'BUTTON' && event.target.getAttribute('data-type') == 'deleteButton') {
				var index = event.target.getAttribute('data-index');
				event.target.parentElement.parentElement.removeChild(event.target.parentElement);
				console.log('index ' + index);
				filesArray[index].loaded = true;
			}
			
		}
		
		function setDefaultSettings(settings) {
		//Checking if the maximum errors count is set up. Defult is 10.
			if (typeof settings.maxErrorsCount === 'undefined') {
				settings.maxErrorsCount = '10';
			}
			
			//Checking if the max file size is set up. The default value is 8 Mb.
			if (typeof settings.maxFileSize === 'undefined') {
				settings.maxFileSize = '8388608';
			}

			//Checking if the timeout attempts is set up. Defult is 1000 ms.
			if (typeof settings.errorTimeout === 'undefined') {
				settings.errorTimeout = '1000';
			}

			if (typeof settings.callback === 'undefined') {
				settings.callback = false;
			} else {
				//For compatibility
				settings.onAllFilesLoaded = settings.callback;
			}
			if (typeof settings.onAllFilesLoaded === 'undefined') {
				settings.onAllFilesLoaded = false;
			} else {
				//For compatibility
				settings.callback = settings.onAllFilesLoaded;
			}
			if (typeof settings.onFileLoaded === 'undefined') {
				settings.onFileLoaded = false;
			}
			
			if (typeof settings.showPreviews === 'undefined') {
				settings.showPreviews = false;
			}
			
			if (typeof settings.previewHeight === 'undefined') {
				settings.previewHeight = '150px';
			}
			if (typeof settings.sendButtonClass === 'undefined') {
				settings.sendButtonClass = '';
			}
			if (typeof settings.fileInputClass === 'undefined') {
				settings.fileInputClass = '';
			}
			if (typeof settings.data === 'undefined') {
				settings.data = {};
			}
			if (typeof settings.uploadImmediately === 'undefined') {
				settings.uploadImmediately = false;
			}
			if (typeof settings.language === 'undefined') {
						settings.language = {
							'loaded'      : 'loaded',
							'uploadfiles' : 'Upload file(s)',
							'tooBig'      : ' - error: file is too big',
							'loading'     : 'Loading: ',
							'tryingToSend': ' Trying to send ',
							'error'       : 'Something wrong. There is an error: \n',
							'failed'      : 'Failed: '
						};
			}
			//Checking if the script-acceptor is set up. Default is ''.
			if (typeof settings.acceptor === 'undefined') {
				settings.acceptor = '';
			}
			return settings;
		}
	}
	//Function for clearing list of files
	$fileUpload.clear = function() {
	    
	    var fileUploadBoxes = document.getElementsByClassName('file-upload-box');
	    
	    for(var i = fileUploadBoxes.length - 1; i >= 0; i--) {
			if(fileUploadBoxes[i] && fileUploadBoxes[i].parentElement) {
				fileUploadBoxes[i].parentElement.removeChild(fileUploadBoxes[i]);
			}
	    }

	}
	
	
}