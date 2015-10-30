The Multi-upload component

The component purpose is transform simple upload form to multiupload form with progress bar for every file and background uploading of files.
It's don't need any third-party components.

Supported browsers:
 * IE10+
 * Firefox 31+
 * Chrome 31+
 * Safari 7+
 * Opera 12+

In not-supported browser user will see an usual uploading form.

***USAGE***

Your web-page MUST contain the form with <input type='file'> and <input type='submit'> elements. You must set an id to your form.


The 'submit' button will be replaced with <input type='button'> element with 'fileupload-button' class. The text on this button will be the same as the 'value' attribute of submit button. 


If the 'value' attribute of 'submit' button is not set, the text on the button will be 'Upload file(s)'.


The classes of 'native' submit button will be copied to the component-created button.


Uploaded files will be available from PHP-script in the usual $_FILES['files'] array.


**BASIC USAGE**

In the <head> section you must attach the CSS-file:
```
<link rel='stylesheet' href='fileupload.css'>
```

and JS-file:
```
<script src='fileupload.js'></script>
```

Then you must to add the next strings:

```
<script>
	$fileUpload('your_form_id');
</script>
```

where 'your_form_id' is id of your upload form.


**ADVANCED USAGE**


The same as previous example, you must include CSS:
```
<link rel='stylesheet' href='fileupload.css'>
```

and JS-file:
```
<script src='fileupload.js'></script>
```

*ADVANCED STYLING*

In CSS-file you can find four classes:
.file-upload-box - the class-container for progress bar and text.
.file-upload-box-info - the box with text information about every file.
.error_message - the class for formatting error messages. Default it just has red color.
.file-upload-box>progress - the class for progress bar.


You can change it according of your web page design.


*ADVANCED SETTINGS*

```
$fileUpload('your_form_id', 
		{
		'maxFileSize'    : '100000000',
		'fileList'       : 'files',
		'maxErrorsCount' : '3',
		'errorTimeout'   : '5000',
		'acceptor'       : 'getfile.php',
		'callback'       : functionName,
		'onFileLoaded'   : onFileLoaded,
		'showPreviews'   : true,
		'previewHeight'  : '250px',
		'data'           : {
				'id' : function () {
					return Math.random();
				},
				'name' : 'superUser'
		}
);
```


Like in previous example, 'your_form_id' is value of id-attribute of your form.
The all settings after form id is optional.


**maxFileSize** : the maximum size of uploaded file in bytes. Default is 8388608 bytes (8Mb).


**fileList** : the box on your page where progressbars will be created. If it is not set, progressbars will be added at the end of your upload form.


**maxErrorCount** : the maximum of file transfer errors. Default is 10.


**errorTimeout** : in case of the transfer error, the errorTimeout setting set timeout between re-transfer attempts. Must be set in milliseconds. Default is 1000 ms (1s).


**acceptor** : the name of PHP-script which will be process the uploaded files. Default is 'upload.php'.


**callback** : the name of function which run after the all files will be loaded. Default is false.


**onFileLoaded**: the name of function which run after the every files will be loaded. Default is false.
The function get argument with object represents js File object
 * https://developer.mozilla.org/en-US/docs/Web/API/File
 * http://www.html5rocks.com/en/tutorials/file/dndfiles/


**showPreviews** - show previews of images, true|false. Default is false.


**previewHeight** - css value of preview image height. Default is 150px;

**data** - the object with data which you want to be accessible in $_POST array

**multiple** - if the multiple file upload is possible, true|false. Default is true.

