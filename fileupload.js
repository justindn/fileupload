/*
The multi-upload script

*/

function $fileUpload(formId, settings){

	var status;
	var statusText;

	if (!window.File || !window.FileList) {
		return;
	}
	
	if (typeof settings === 'undefined') {
		settings = {};
	}
	//the function 'ready' will start after DOM fully loaded
	document.addEventListener('DOMContentLoaded', ready, false);
	
	function ready() {
		
		//Checking if the settings object is exists and it contains input file component id 
		if (typeof formId === 'undefined' ) return;
		
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
		}
		//The variable contains the form DOM-object
		var form = document.getElementById(formId);

		//Checking if the box id for progressbars is set up. If not - set up it to form.
              
		if (typeof settings.fileList === 'undefined') {
			settings.fileList = form;
		} else {
			settings.fileList = document.getElementById(settings.fileList);
			if (typeof settings.fileList === 'null') {
				settings.fileList = form;
			}
		}
		
		//Checking if the script-acceptor is set up. Default is 'upload.php'.
		if (typeof settings.acceptor === 'undefined') {
			settings.acceptor = 'upload.php';
		}
		
		//The array which contains for every file: the file, the file information and progressbar object
		var filesArray = [];
		
		//The variable contains the number of current uploading file
		var currentFileCounter = 0;
		
		var errorsCount = 0;
	
		//the variable contains the input type='file' DOM-object
		var filesInput = form.querySelector('input[type="file"]');
		
		if(typeof filesInput === 'null') return;
		
		filesInput.setAttribute('multiple', 'multiple');

		//the variable contains the input type='submit' DOM-object (to replace it with custom button element)
		var submitButton = form.querySelector("input[type='submit']");
		
		if(typeof submitButton === 'null') return;
		
		//the variable contains the custom button
		var sendButton = document.createElement('input');
		
		sendButton.setAttribute('type', 'button');
		sendButton.setAttribute('class', 'fileupload-button');

		//Copying css class from submit to own button
		if (submitButton.getAttribute('class') != null) {
			sendButton.setAttribute('class', sendButton.getAttribute('class') + ' ' + submitButton.getAttribute('class'));
		}
                
		if (submitButton.getAttribute('value') === null) {
			sendButton.setAttribute('value', 'Upload file(s)');
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
		filesInput.onchange = function() {
			var currentlyFilesInArray = filesArray.length;
			
			for (var i = 0; i < this.files.length; i++) {
				//if (this.files[i].size>settings.maxFileSize) alert ('za duzy!');	
				pbar = createProgressDiv(this.files[i].name, this.files[i].size);
			
				filesArray[i+currentlyFilesInArray] = {
					'name' : this.files[i].name, 
					'size' : this.files[i].size, 
					'type' : this.files[i].type, 
					'file' : this.files[i],
					'progressBar' : pbar,
					'loaded' : false,
				};
				
				settings.fileList.appendChild(pbar.container);
				if (this.files[i].size > settings.maxFileSize) {
					filesArray[i+currentlyFilesInArray].loaded = true;
					filesArray[i+currentlyFilesInArray].progressBar.errorMessage(this.files[i].name + ' - error: file is too big');
				}
			}
			
		}
		
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
		function createProgressDiv(name, size) {
		
			var progressDiv = document.createElement('div');
			progressDiv.className = 'file-upload-box';
			
			var infoDiv = document.createElement('div');
			infoDiv.className = 'file-upload-box-info';
			infoDiv.innerHTML = name + ', size: ' + size;
			progressDiv.appendChild(infoDiv);
			
			var progressElement = document.createElement('progress');
			progressElement.value = '0';
			progressDiv.appendChild(progressElement);
			
			var progressBar = {
				'container' : progressDiv,
				'info': infoDiv,
				'bar' : progressElement,
				'message' : function (msg) {
								this.info.innerHTML = msg;
								this.info.className = 'file-upload-box-info';
								this.info.setAttribute('title', msg);
							},
				'errorMessage' : function (msg) {
								this.info.innerHTML = msg;
								this.info.className = this.info.className + ' error_message';
								this.info.setAttribute('title', msg);
							},
				'barValue': function (val) {
								this.bar.value = val;
							},
				'barMax': function (max) {
								this.bar.max = max;
							}
			}
			return progressBar;
			
		}
		
		/*The functions callbacks:
			sendFile() checks is there any files to send. 
			If yes, it calls upload(), which sends the file. While file is uploaded, upload() permanently calls the onProgress() function, which show to user the upload progress. 
			After the upload is complete, upload() calls onSuccess() function,
			which change 'loaded' property in fileArray for 'true', increments the currentFileCounter variable and calls the sendFile() again.
			If the sendFile has not files to uploading, it set currentFileCounter for '0' and stop.
			If the 'loaded' property of file is set for 'true', file will not uploaded and sendFile will call the onSuccess() function.
		*/
		
		//Sending files
						
		function sendFile(){
			
			if (currentFileCounter < (filesArray.length)){
				if (filesArray[currentFileCounter].loaded !== true) {
					upload(); 
				} else {
					onSuccess();
				}
			} else {
				sendButton.removeAttribute('disabled');
				filesInput.removeAttribute('disabled');
				currentFileCounter = 0;
				if (settings.callback) {
					settings.callback();
				}
			}
		}
		
		//Upload function
		function upload() {
			
			sendButton.setAttribute('disabled', 'disabled');
			filesInput.setAttribute('disabled', 'disabled');
			filesArray[currentFileCounter].progressBar.message('Loading: ' + filesArray[currentFileCounter].name + '...');
			var xhr = new XMLHttpRequest();
			
			//If file uploaded successfully...
			xhr.onload = function() {
				if (this.status == 200) {
					statusText = this.responseText;

					onSuccess();
					return;
				} 
			};
			//Show progress to user
			xhr.upload.onprogress = function(event) {

				onProgress(event.loaded, event.total);
			}
			
			//If error:
			xhr.onerror = function() {
				//Showing user the number of attempt
				if (errorsCount < settings.maxErrorsCount) {
					errorsCount++;
					filesArray[currentFileCounter].progressBar.errorMessage(
					'(' + errorsCount + ') Trying to send ' + filesArray[currentFileCounter].name + '...');
					filesArray[currentFileCounter].progressBar.barValue('0');
					setTimeout(upload, settings.errorTimeout);
					
				} else {
					alert('Something wrong. There is an error: \n' + this.statusText);
					filesArray[currentFileCounter].progressBar.errorMessage ('Failed: ' + filesArray[currentFileCounter].name);
					sendButton.removeAttribute('disabled');
					filesInput.removeAttribute('disabled');
				}    
				
			};

			xhr.open("POST", settings.acceptor, true); 
			
			var formData = new FormData();
			formData.append("files", filesArray[currentFileCounter].file);
			xhr.send(formData);
		}
		
		//Function for showing uploaded bytes
		function onProgress(loaded, total) {
			filesArray[currentFileCounter].progressBar.barMax(total);
			filesArray[currentFileCounter].progressBar.barValue(loaded);
		}
		
		//success function
		function onSuccess() {
			filesArray[currentFileCounter].progressBar.message(filesArray[currentFileCounter].name + '  '+statusText);
                        
			filesArray[currentFileCounter].loaded = true;
			currentFileCounter++;					
			sendFile();
		}
	}
}